import {groups,fields,defaults,sanitize,calculate,scenario} from './model.js';

const $=selector=>document.querySelector(selector);
const format=(n,digits=0)=>new Intl.NumberFormat('ko-KR',{maximumFractionDigits:digits,minimumFractionDigits:digits}).format(n);
const won=n=>`${format(n)}원`;
const years=n=>n===null?'회수 불가':`${format(n,2)}년`;
const STORAGE_KEY='farm-insight-v1';
let state={...defaults},horizon=10,spread=20,view='dashboard',saveTimer,toastTimer,storageAvailable=true;
try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(saved&&typeof saved==='object')state=sanitize(saved);}catch{storageAvailable=false;}

function fieldHTML(field){
  const [key,label,,min,max,step,unit,minLabel,maxLabel,hint]=field;
  const value=key==='scenarioSpread'?spread:state[key];
  return `<div class="slider-field"><div class="slider-heading"><label for="${key}-number">${label}</label><div class="number-wrap"><input id="${key}-number" data-key="${key}" type="number" inputmode="decimal" min="${min}" max="${max}" step="${step}" value="${value}" class="${max>=100000?'wide':''}" ${hint?`aria-describedby="${key}-hint"`:''}><span class="input-unit">${unit}</span></div></div><input class="range" id="${key}-range" data-key="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label} 슬라이더" aria-valuetext="${format(value,step<1?2:0)} ${unit}" style="--fill:${(value-min)/(max-min)*100}%"><div class="range-limits"><span>${minLabel}</span><span>${maxLabel}</span></div>${hint?`<p class="field-hint" id="${key}-hint">${hint}</p>`:''}</div>`;
}
$('#controls-body').innerHTML=groups.map((group,i)=>`<details class="control-section" ${group.open?'open':''}><summary><span class="section-number">0${i+1}</span>${group.title}</summary><div class="section-controls">${group.fields.map(fieldHTML).join('')}</div></details>`).join('');
$('#scenario-slider').innerHTML=fieldHTML(['scenarioSpread','가격·생산량 각각의 변동 폭',20,5,40,5,'%','±5%','±40%']);

function compact(n){
  const abs=Math.abs(n);
  if(abs>=100000000)return [format(n/100000000,2).replace(/0$/,'').replace(/\.0$/,''),'억원'];
  if(abs>=10000)return [format(n/10000),'만원'];
  return [format(n),'원'];
}
function metric(label,value,unit,detail,symbol,green=false){return `<article class="metric"><div class="metric-label">${label}<span class="metric-symbol" aria-hidden="true">${symbol}</span></div><div class="metric-value ${green?'green':''}">${value}<small>${unit}</small></div><p class="metric-detail">${detail}</p></article>`;}
function renderVerdict(r){
  const card=$('#verdict-card');
  card.className=`verdict-card ${r.annualProfit<=0?'negative':r.met?'':'caution'}`;
  let title,description,kicker,icon;
  if(r.annualProfit<=0){title='지금 조건에서는 운영 수익이 부족해요.';description=`재배 1회 ${r.profit<0?`${won(Math.abs(r.profit))}의 손실이 예상돼요.`:'수익과 비용이 같아요.'} 판매 단가와 운영비를 다시 살펴보세요.`;kicker='운영 조건 재검토';icon='↘';}
  else if(r.investment===0){title='초기 투자금이 0원으로 설정되어 있어요.';description='회수할 초기 투자금이 없어요. 실제 설치 견적을 입력하면 투자금 회수 기간을 확인할 수 있어요.';kicker='입력 조건 기준';icon='✓';}
  else if(r.met){title='목표 기간 안에 투자금 회수가 가능해요.';description=`현재 조건에서 약 ${format(r.payback,1)}년이 걸려요. 목표 ${format(state.targetYears,1)}년보다 ${format(state.targetYears-r.payback,1)}년 여유가 있어요.`;kicker='입력 조건 기준 · 목표 충족';icon='↗';}
  else{title='목표 회수 기간에 조금 더 가까워져 볼까요?';description=`예상 회수 기간은 ${format(r.payback,1)}년으로, 목표 ${format(state.targetYears,1)}년보다 ${format(r.payback-state.targetYears,1)}년 더 필요해요.`;kicker='입력 조건 기준 · 목표 미달';icon='↗';}
  card.innerHTML=`<div class="verdict-icon" aria-hidden="true">${icon}</div><div class="verdict-content"><div class="verdict-kicker">${kicker}</div><h3>${title}</h3><p>${description}</p></div><span class="verdict-stamp">목표 ${format(state.targetYears,1)}년</span>`;
}
function renderMetrics(r){
  const investment=compact(r.investment),annual=compact(r.annualProfit);
  $('#metric-grid').innerHTML=metric('초기 투자금',investment[0],investment[1],`${format(state.area)}㎡ 규모의 시설 설치비`,'₩')+metric('예상 연간 운영이익',annual[0],annual[1],`연간 매출 <strong>${format(r.revenue*r.cyclesPerYear/10000)}만원</strong>`,'↗',r.annualProfit>0)+metric('예상 투자금 회수 기간',r.payback===null?'—':format(r.payback,1),r.payback===null?'회수 불가':'년',`목표 <strong>${format(state.targetYears,1)}년</strong> · 단순 회수 기준`,'◷',r.met);
  $('#cycle-description').textContent=`연 ${format(r.cyclesPerYear,1)}회 재배 · 휴지 ${format(state.fallowMonths,1)}개월`;
}
function renderChart(r){
  const w=760,h=245,left=65,right=24,top=25,bottom=36,pw=w-left-right,ph=h-top-bottom;
  const start=-r.investment/10000,end=(r.annualProfit*horizon-r.investment)/10000;
  const rawMin=Math.min(0,start,end),rawMax=Math.max(Math.max(0,start,end),rawMin+100),span=rawMax-rawMin;
  const min=rawMin-span*.13,max=rawMax+span*.18;
  const x=t=>left+t/horizon*pw,y=v=>top+(max-v)/(max-min)*ph;
  const zeroY=y(0),points=Array.from({length:horizon+1},(_,i)=>[x(i),y((r.annualProfit*i-r.investment)/10000)]);
  const line=points.map(p=>p.join(',')).join(' '),area=`${x(0)},${zeroY} ${line} ${x(horizon)},${zeroY}`;
  let markup=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="chart-title chart-description"><title id="chart-title">${horizon}년간 누적 현금흐름</title><desc id="chart-description">초기 ${won(-r.investment)}에서 ${horizon}년 후 ${won(r.annualProfit*horizon-r.investment)}. 예상 회수 기간 ${years(r.payback)}. 연간 수익을 균등 배분한 추정치.</desc><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#9fbd75" stop-opacity=".24"/><stop offset="100%" stop-color="#b9ce9a" stop-opacity=".02"/></linearGradient></defs>`;
  for(let i=0;i<5;i++){
    const v=rawMin+(Math.max(100,rawMax-rawMin))*i/4;
    markup+=`<line x1="${left}" x2="${w-right}" y1="${y(v)}" y2="${y(v)}" stroke="#eff2e9" stroke-dasharray="3 4"/><text x="${left-12}" y="${y(v)+3}" text-anchor="end" fill="#a6b098" font-size="9">${format(v)}</text>`;
  }
  for(let t=0;t<=horizon;t+=horizon/5)markup+=`<text x="${x(t)}" y="${h-13}" text-anchor="middle" fill="#a6b098" font-size="9">${t===0?'시작':`${t}년`}</text>`;
  markup+=`<line x1="${left}" x2="${w-right}" y1="${zeroY}" y2="${zeroY}" stroke="#c3ceb4"/><polygon points="${area}" fill="url(#chart-fill)"/><polyline points="${line}" fill="none" stroke="#718f53" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(state.targetYears<=horizon){const targetX=x(state.targetYears);markup+=`<line x1="${targetX}" x2="${targetX}" y1="${top}" y2="${h-bottom}" stroke="#b2bea0" stroke-dasharray="4 5"/><rect x="${Math.min(w-100,Math.max(left,targetX-37))}" y="3" width="74" height="18" rx="4" fill="#f0f4e9"/><text x="${Math.min(w-63,Math.max(left+37,targetX))}" y="15" text-anchor="middle" fill="#8b9c75" font-size="8">목표 ${format(state.targetYears,1)}년</text>`;}
  if(r.payback!==null&&r.payback<=horizon&&r.annualProfit>0){const px=x(r.payback);const labelX=Math.max(left+4,Math.min(w-100,px-42));markup+=`<circle cx="${px}" cy="${zeroY}" r="6" fill="#eef4e4" stroke="#68874d" stroke-width="2"/><rect x="${labelX}" y="${zeroY-33}" width="88" height="22" rx="5" fill="#3c6446"/><text x="${labelX+44}" y="${zeroY-18}" text-anchor="middle" fill="white" font-size="9">${format(r.payback,1)}년 · 투자금 회수</text>`;}
  for(let i=0;i<=horizon;i++){const v=(r.annualProfit*i-r.investment)/10000;markup+=`<circle cx="${x(i)}" cy="${y(v)}" r="7" fill="transparent"><title>${i}년: ${won(v*10000)}</title></circle>`;}
  markup+='</svg>';$('#cashflow-chart').innerHTML=markup;
  const targetBalance=r.annualProfit*state.targetYears-r.investment;
  $('#chart-footer').innerHTML=`<span>목표 ${format(state.targetYears,1)}년 후 <strong>${targetBalance>=0?'회수 후 잔여':'미회수 투자금'} ${format(Math.abs(targetBalance)/10000)}만원</strong></span><span>${horizon}년 후 누적 ${format((r.annualProfit*horizon-r.investment)/10000)}만원</span>`;
}
function renderCosts(r){
  const entries=[['labor','인건비','#55764a'],['electricity','전기요금','#8ea66a'],['seed','종자','#bbc998'],['fertilizer','비료','#d3ddbb'],['pesticide','농약','#e0d6bb'],['other','기타','#e7e9e0']];
  let percent=0;const segments=entries.map(([key,,color])=>{const begin=percent;percent+=r.totalCost>0?r.costs[key]/r.totalCost*100:0;return `${color} ${begin}% ${percent}%`;});
  const background=r.totalCost>0?`conic-gradient(${segments.join(',')})`:'#edf1e7';
  $('#cost-breakdown').innerHTML=`<div class="cost-content"><div class="donut" style="background:${background}" role="img" aria-label="총 운영비 ${won(r.totalCost)}"><div class="donut-center"><small>총 운영비</small><strong>${format(r.totalCost/10000)}</strong><span>만원</span></div></div><div class="cost-legend">${entries.map(([key,label,color])=>`<div class="cost-row"><i class="cost-dot" style="background:${color}"></i><span>${label}</span><strong>${format(r.costs[key]/10000,1)}만원</strong></div>`).join('')}</div></div><div class="cycle-stats"><div><span>재배 1회 매출</span><strong>${format(r.revenue/10000)}만원</strong></div><div><span>재배 1회 운영이익</span><strong>${format(r.profit/10000)}만원</strong></div></div>`;
  const ceiling=Math.max(state.salePrice,r.targetPrice||0,r.breakeven||0,1)*1.2;
  const margin=r.targetPrice===null?null:state.salePrice-r.targetPrice;
  let message=margin===null?'생산량을 입력하면 손익분기 단가를 계산할 수 있어요.':margin>=0?`현재 단가는 목표 회수 단가보다 <strong>${won(Math.floor(margin))} 높아요.</strong>`:`목표 회수를 위해 현재 단가보다 <strong>${won(Math.ceil(-margin))} 더 필요해요.</strong>`;
  $('#breakeven-content').innerHTML=`<div class="breakeven-content"><div class="breakeven-row"><span>운영 손익분기 단가</span><strong>${r.breakeven===null?'—':format(Math.ceil(r.breakeven))} <small>원/kg</small></strong></div><div class="breakeven-row"><span>목표 ${format(state.targetYears,1)}년 회수에 필요한 단가</span><strong>${r.targetPrice===null?'—':format(Math.ceil(r.targetPrice))} <small>원/kg</small></strong></div><div class="price-gauge" aria-hidden="true"><div class="price-gauge-fill" style="width:${state.salePrice/ceiling*100}%"></div>${r.targetPrice!==null?`<span class="price-mark" style="left:${r.targetPrice/ceiling*100}%"></span>`:''}</div><div class="gauge-labels"><span>0원</span><span>현재 단가 ${won(state.salePrice)}</span></div><div class="breakeven-message">${message}</div></div>`;
}
function renderScenarios(){
  const configs=[['보수적 시나리오',1-spread/100,'cautious',`가격·생산량 각각 −${spread}%`],['기준 시나리오',1,'baseline','현재 입력값'],['낙관적 시나리오',1+spread/100,'optimistic',`가격·생산량 각각 +${spread}%`]];
  $('#scenario-grid').innerHTML=configs.map(([title,factor,className,detail])=>{const r=scenario(state,factor,factor);return `<article class="scenario ${className}"><div class="scenario-label">${title}</div><h3>${r.payback===null?'회수 불가':format(r.payback,1)}${r.payback!==null?'<small>년</small>':''}</h3><span class="scenario-badge ${r.met?'':'missed'}">${r.met?'목표 기간 충족':r.annualProfit<=0?'운영 수익 부족':'목표 기간 초과'}</span><dl><div><dt>변동 조건</dt><dd>${detail}</dd></div><div><dt>판매 단가</dt><dd>${won(state.salePrice*factor)}/kg</dd></div><div><dt>㎡당 생산량</dt><dd>${format(state.yieldPerM2*factor,2)}kg</dd></div><div><dt>연간 운영이익</dt><dd>${format(r.annualProfit/10000)}만원</dd></div></dl></article>`;}).join('');
  const changes=[-spread,-spread/2,0,spread/2,spread];
  const percent=v=>v===0?'기준':`${v>0?'+':''}${format(v,1).replace(/\.0$/,'')}%`;
  $('#sensitivity-table').innerHTML=`<div class="table-wrap"><table class="sensitivity-table"><caption class="sr-only">행: 생산량 변화, 열: 판매 단가 변화. 각 셀은 투자금 회수 기간입니다.</caption><thead><tr><th scope="col">생산량 ↓ / 가격 →</th>${changes.map(v=>`<th scope="col">${percent(v)}</th>`).join('')}</tr></thead><tbody>${changes.map(y=>`<tr><th scope="row">${percent(y)}</th>${changes.map(p=>{const r=scenario(state,1+p/100,1+y/100);return `<td class="${r.met?'met':''} ${y===0&&p===0?'current':''}">${r.payback===null?'회수 불가':`${format(r.payback,1)}년`}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function render(){const result=calculate(state);renderVerdict(result);renderMetrics(result);renderChart(result);renderCosts(result);renderScenarios();}
function syncControl(key,value){
  const number=$(`#${key}-number`),range=$(`#${key}-range`);
  number.value=value;range.value=value;
  range.style.setProperty('--fill',`${(value-Number(range.min))/(Number(range.max)-Number(range.min))*100}%`);
  const unit=key==='scenarioSpread'?'%':fields.find(f=>f[0]===key)[6];
  range.setAttribute('aria-valuetext',`${format(value,Number(range.step)<1?2:0)} ${unit}`);
}
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));storageAvailable=true;$('#save-status').textContent='이 브라우저에 자동 저장되었어요';}catch{storageAvailable=false;$('#save-status').textContent='현재 브라우저에서는 자동 저장이 제한돼요';}},250);}
document.addEventListener('input',event=>{
  const target=event.target,key=target.dataset.key;if(!key)return;
  const value=target.valueAsNumber;if(!Number.isFinite(value))return;
  const min=Number(target.min),max=Number(target.max);
  if(target.type==='number'&&(value<min||value>max))return;
  if(key==='scenarioSpread'){spread=Math.max(min,Math.min(max,value));syncControl(key,spread);renderScenarios();return;}
  state[key]=Math.max(min,Math.min(max,value));syncControl(key,state[key]);render();save();
});
document.addEventListener('change',event=>{const target=event.target,key=target.dataset.key;if(!key||target.type!=='number')return;let value=target.valueAsNumber;if(!Number.isFinite(value))value=key==='scenarioSpread'?spread:state[key];value=Math.max(Number(target.min),Math.min(Number(target.max),value));if(key==='scenarioSpread')spread=value;else{state[key]=value;save();}syncControl(key,value);render();});
function setView(next){view=next;for(const name of ['dashboard','scenarios','method']){$(`#${name}-view`).hidden=name!==next;}document.querySelectorAll('.main-nav [data-view]').forEach(button=>{button.classList.toggle('active',button.dataset.view===next);if(button.dataset.view===next)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});if(next!=='dashboard'&&window.innerWidth<681)$('#main').scrollIntoView({behavior:'smooth',block:'start'});}
document.addEventListener('click',event=>{const button=event.target.closest('button[data-view],button[data-horizon]');if(!button)return;if(button.dataset.view)setView(button.dataset.view);else{horizon=Number(button.dataset.horizon);document.querySelectorAll('[data-horizon]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});renderChart(calculate(state));}});
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
$('#reset-button').addEventListener('click',()=>{state={...defaults};for(const field of fields)syncControl(field[0],state[field[0]]);spread=20;syncControl('scenarioSpread',20);render();save();toast('모든 변수를 기본값으로 되돌렸어요.');});
$('#export-button').addEventListener('click',()=>{
  const r=calculate(state);
  const rows=[['팜인사이트 · 고추 스마트팜 경제성 분석'],['안내','입력 조건에 따른 단순 추정치이며 실제 수익을 보장하지 않습니다.'],['생성 일시',new Date().toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})],[],['입력 항목','값','단위'],...fields.map(([key,label,,,,,unit])=>[label,state[key],unit]),[],['결과','값','단위'],['초기 투자금',r.investment,'원'],['필요 종자 수',r.seedCount,'개'],['재배 1회 생산량',r.totalYield,'kg'],...Object.entries(r.costs).map(([key,value])=>[({labor:'인건비',electricity:'전기요금',seed:'종자',fertilizer:'비료',pesticide:'농약',other:'기타'})[key],Math.round(value),'원']),['재배 1회 운영비',Math.round(r.totalCost),'원'],['재배 1회 매출',r.revenue,'원'],['재배 1회 운영이익',Math.round(r.profit),'원'],['연간 재배 횟수',r.cyclesPerYear,'회'],['연간 운영이익',Math.round(r.annualProfit),'원'],['예상 투자금 회수 기간',r.payback??'회수 불가','년'],['목표 기간 충족',r.met?'충족':'미충족',''],['운영 손익분기 단가',r.breakeven===null?'생산량 없음':Math.ceil(r.breakeven),'원/kg'],['목표 회수 필요 단가',r.targetPrice===null?'생산량 없음':Math.ceil(r.targetPrice),'원/kg'],[],['시나리오','가격·생산량 각각 변동','연간 운영이익(원)','회수 기간(년)'],...[-spread,0,spread].map((p,i)=>{const s=scenario(state,1+p/100,1+p/100);return [['보수적','기준','낙관적'][i],`${p}%`,Math.round(s.annualProfit),s.payback??'회수 불가'];}),[],['모형 가정','재배마다 같은 수익 유지, 휴지기 운영비 없음, 연간 균등 현금흐름'],['미반영 항목','대출이자·세금·감가상각·시설 교체비·토지비·보조금·물가 변화']];
  const csv='\uFEFF'+rows.map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='팜인사이트_경제성분석.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('분석 결과와 입력값을 CSV로 내보냈어요.');
});
if(!storageAvailable)$('#save-status').textContent='현재 브라우저에서는 자동 저장이 제한돼요';
render();
