// 첫 방문 질문 흐름. 자료조사팀 색 분류(2026.11)를 따른다.
// 초록=농가 직접 입력, 빨강=종자, 파랑=스마트팜 모델, 보라=거름, 하양=농약. 노랑(고정값)은 묻지 않는다.
export const tags = {
  direct:{label:'직접 입력',color:'#4f9a6c'},
  seed:{label:'종자',color:'#d1473b'},
  smart:{label:'스마트팜 모델',color:'#3d6fd1'},
  fert:{label:'거름',color:'#8657c4'},
  pest:{label:'농약',color:'#8b9488'},
};

// 품종별 생산량·단가 자료는 아직 없어, 모든 품종이 경북 2025 건고추 통계와 서안동 산지가를 함께 쓴다.
const cropBase={yieldPer1000:239,salePrice:15167,germination:95,seedPackSize:1200};

export const questions = [
  {id:'area',tag:'direct',type:'number',title:'고추를 몇 ㎡에\n심을 계획인가요?',sub:'1평은 약 3.3㎡예요.',
    field:{key:'area',unit:'㎡',min:100,max:10000,step:10},
    chips:[{label:'100평',value:330},{label:'300평',value:1000},{label:'1,000평',value:3300}],
    extra:v=>`약 ${Math.round(v/3.3058).toLocaleString('ko-KR')}평`},
  {id:'variety',tag:'seed',type:'choice',title:'어떤 품종을\n심을 건가요?',sub:'품종을 고르면 종자 가격·발아율·생산량·판매 단가가 함께 정해져요.',
    options:[
      {label:'칼라짱',desc:'농우바이오 · 1,200립 120,000원',values:{...cropBase,seedPackPrice:120000}},
      {label:'초특급',desc:'농우바이오 · 1,200립 135,000원',values:{...cropBase,seedPackPrice:135000}},
      {label:'트리플탑',desc:'삼성종묘 · 1,200립 150,000원',values:{...cropBase,seedPackPrice:150000}},
      {label:'칼탄패스',desc:'농우바이오 · 1,200립 170,000원',values:{...cropBase,seedPackPrice:170000}},
    ],
    note:'모든 품종 공통: 발아율 95% · 1,000㎡당 건고추 239kg · 산지가 15,167원/kg. 품종별 수량 자료는 조사 중이에요.'},
  {id:'seedling',tag:'seed',type:'ox',title:'씨앗부터\n직접 키우나요?',sub:'모종을 사서 심는 농가도 많아요. 모종이면 포기 수 × 모종 가격으로 계산해요.',
    options:[
      {label:'씨앗부터',mark:'O',desc:'종자 봉지 가격으로 계산',values:{seedlingPrice:0}},
      {label:'모종 구입',mark:'X',desc:'모종 1주 가격을 입력할게요',values:{seedlingPrice:140}},
    ]},
  {id:'seedlingPrice',tag:'seed',type:'number',when:a=>a.seedling===1,title:'모종 1주는\n얼마인가요?',sub:'1,000㎡에 약 2,778주를 심어요.',
    field:{key:'seedlingPrice',unit:'원',min:10,max:3000,step:10},
    chips:[{label:'140원 · 통계 기준',value:140},{label:'300원',value:300},{label:'500원',value:500}],
    note:'140원은 2024 노지고추 종묘비(1,000㎡당 38.7만원) ÷ 2,778주로 낸 값이에요.'},
  {id:'disease',tag:'seed',type:'ox',title:'이 밭에서 풋마름병이\n난 적이 있나요?',sub:'병이 난 밭은 고추를 쉬고 다른 작물로 3~4년 돌려짓기를 권해요.',
    options:[
      {label:'있어요',mark:'O',desc:'3년 돌려짓기 · 고추 수익은 4년에 1번',values:{fallowMonths:42}},
      {label:'없어요',mark:'X',desc:'매년 고추 1작',values:{fallowMonths:6}},
    ],
    note:'돌려짓기 기간에 기르는 다른 작물의 수익은 계산에 넣지 않아요.'},
  {id:'months',tag:'direct',type:'number',title:'정식부터 마지막 수확까지\n몇 개월 걸리나요?',sub:'노지 건고추는 5월 정식, 8~10월 수확이 일반적이에요.',
    field:{key:'months',unit:'개월',min:1,max:12,step:.5},
    chips:[{label:'5개월',value:5},{label:'6개월',value:6},{label:'7개월',value:7}]},
  {id:'smart',tag:'smart',type:'choice',title:'어떤 스마트팜을\n생각하고 있나요?',sub:'모델에 따라 설치비와 전기 사용량이 정해져요.',
    options:[
      {label:'간편형',desc:'환경 센서 · 자동 관수',values:{construction:30000000,contractKw:5,monthlyKwh:500}},
      {label:'표준형',desc:'+ 자동 개폐 · 양액 · 원격 제어',values:{construction:120000000,contractKw:10,monthlyKwh:2000}},
      {label:'고급형',desc:'+ 냉난방 · 보광',values:{construction:250000000,contractKw:30,monthlyKwh:6000}},
      {label:'견적을 받았어요',desc:'설치비를 직접 입력할게요',values:{contractKw:10,monthlyKwh:2000},next:'quote'},
    ],
    note:'모델별 설치비·전력량은 팀 가정값이에요. 고추 스마트팜 실측 자료가 생기면 바뀝니다.'},
  {id:'quote',tag:'smart',type:'number',when:a=>a.smart===3,title:'1,000㎡당 설치비\n견적은 얼마인가요?',sub:'면적에 맞춰 자동으로 계산해요.',
    field:{key:'construction',unit:'원',min:0,max:500000000,step:1000000},
    chips:[{label:'5천만원',value:50000000},{label:'1억원',value:100000000},{label:'2억원',value:200000000}],
    extra:v=>v>=100000000?`${(v/100000000).toLocaleString('ko-KR',{maximumFractionDigits:2})}억원`:`${Math.round(v/10000).toLocaleString('ko-KR')}만원`},
  {id:'power',tag:'smart',type:'choice',title:'전기는 어떤 계약으로\n쓸 예정인가요?',sub:'고추 재배·육묘·건조기는 농사용(을) 대상이에요.',
    options:[
      {label:'농사용(을) 저압',desc:'기본 1,150원/kW · 65.9원/kWh',values:{baseRate:1150,energyRate:65.9}},
      {label:'농사용(을) 고압',desc:'기본 1,210원/kW · 68.6원/kWh',values:{baseRate:1210,energyRate:68.6}},
      {label:'잘 모르겠어요',desc:'소규모 농가에 흔한 저압으로 계산해요',values:{baseRate:1150,energyRate:65.9}},
    ],
    note:'한국전력 요금표 2025.4.1 적용. 건조기 전기료도 이 요금으로 계산해요.'},
  {id:'dryer',tag:'smart',type:'ox',title:'고추 건조기가\n이미 있나요?',sub:'없다면 구입비 240만원(8.5kW · 생고추 200kg급)을 초기 투자금에 더해요.',
    options:[
      {label:'있어요',mark:'O',desc:'구입비 0원 · 전기료만 계산',values:{dryerPrice:0}},
      {label:'없어요',mark:'X',desc:'새로 구입 240만원',values:{dryerPrice:2400000}},
    ]},
  {id:'base',tag:'fert',type:'choice',title:'밑거름은\n어떤 비료를 쓰나요?',sub:'심기 전에 주는 거름이에요. 질소 권장량(10.2kg/1,000㎡)에 맞춰 포대 수를 계산해요.',
    options:[
      {label:'뿌리조은 (12-7-9)',desc:'20kg 18,500원 · 1,000㎡당 4.5포',values:{baseBags:4.5,basePrice:18500}},
      {label:'복합비료 (21-17-17)',desc:'20kg 18,550원 · 1,000㎡당 2.4포',values:{baseBags:2.4,basePrice:18550}},
    ],
    note:'모두 정부 보조 후 가격(2026.10.20~)이에요.'},
  {id:'top',tag:'fert',type:'choice',title:'웃거름은\n어떤 비료를 쓰나요?',sub:'자라는 중간에 3번 나눠 주는 거름이에요. 질소 8.8kg/1,000㎡ 기준이에요.',
    options:[
      {label:'요소 (질소 46%)',desc:'20kg 17,250원 · 1,000㎡당 1포',values:{topBags:1,topPrice:17250}},
      {label:'복합비료 (21-17-17)',desc:'20kg 18,550원 · 1,000㎡당 2.1포',values:{topBags:2.1,topPrice:18550}},
    ]},
  {id:'compost',tag:'fert',type:'ox',title:'퇴비를\n사서 쓰나요?',sub:'권장량은 1,000㎡당 2,000kg(20kg 100포)이에요.',
    options:[
      {label:'사서 써요',mark:'O',desc:'1포 가격을 입력할게요',values:{compostBags:100},next:'compostPrice'},
      {label:'안 사요',mark:'X',desc:'직접 만들거나 쓰지 않아요',values:{compostBags:100,compostPrice:0}},
    ]},
  {id:'compostPrice',tag:'fert',type:'number',when:a=>a.compost===0,title:'퇴비 20kg 1포는\n얼마인가요?',sub:'지역농협 판매가를 넣어 주세요.',
    field:{key:'compostPrice',unit:'원',min:0,max:30000,step:100},
    chips:[{label:'3,000원',value:3000},{label:'5,000원',value:5000},{label:'8,000원',value:8000}]},
  {id:'spray',tag:'pest',type:'choice',title:'한 해에 농약을\n몇 번 치나요?',sub:'2025년 고추 농가 설문 결과로 골라 보세요.',
    options:[
      {label:'적게 · 6~10회',desc:'농가 21.0%',values:{sprayCount:8,pesticidePrice:24800,pesticideUnits:1}},
      {label:'보통 · 11~15회',desc:'농가 65.9% · 가장 많아요',values:{sprayCount:13,pesticidePrice:24800,pesticideUnits:1}},
      {label:'많이 · 16~20회',desc:'농가 6.8%',values:{sprayCount:18,pesticidePrice:24800,pesticideUnits:1}},
    ],
    note:'1회 비용 24,800원은 임시값(2024 노지고추 농약비 ÷ 13회)이에요. 지역농협 가격 조사 후 바뀌어요.'},
  {id:'labor',tag:'direct',type:'multi',title:'일손은 얼마나\n들어가나요?',sub:'함께 일하는 사람의 시간을 모두 더해 주세요.',
    fields:[
      {key:'dailyHours',label:'하루 총 노동시간',unit:'시간',min:0,max:48,step:.5},
      {key:'workdays',label:'한 달 근무일',unit:'일',min:0,max:31,step:1},
      {key:'hourlyWage',label:'시간당 임금',unit:'원',min:0,max:50000,step:100},
    ],
    note:'참고: 2024 노지고추 노동비는 1,000㎡당 약 327만원(자가노동 포함)이에요.'},
  {id:'land',tag:'direct',type:'ox',title:'고추를 심을 땅은\n내 땅인가요?',sub:'빌린 땅이면 해마다 나가는 임차료를 비용에 넣어요.',
    options:[
      {label:'내 땅',mark:'O',desc:'임차료 없음',values:{landRent:0}},
      {label:'빌린 땅',mark:'X',desc:'1년 임차료를 입력할게요',values:{landRent:1000000}},
    ]},
  {id:'landRent',tag:'direct',type:'number',when:a=>a.land===1,title:'1년 임차료는\n얼마인가요?',sub:'빌린 땅 전체에 1년 동안 내는 금액이에요.',
    field:{key:'landRent',unit:'원',min:0,max:50000000,step:100000},
    chips:[{label:'50만원',value:500000},{label:'100만원',value:1000000},{label:'200만원',value:2000000}],
    extra:v=>`${Math.round(v/10000).toLocaleString('ko-KR')}만원`,
    note:'안동 지역 임차료는 자료조사팀이 조사 중이에요.'},
  {id:'other',tag:'direct',type:'number',title:'포장·운송 같은\n다른 비용이 있나요?',sub:'재배 1번에 드는 수도·포장·운송비 등을 모두 더해 주세요. 없으면 0원이에요.',
    field:{key:'otherCost',unit:'원',min:0,max:50000000,step:100000},
    chips:[{label:'없어요',value:0},{label:'50만원',value:500000},{label:'100만원',value:1000000}],
    extra:v=>`${Math.round(v/10000).toLocaleString('ko-KR')}만원`},
  {id:'target',tag:'direct',type:'number',title:'투자금을 몇 년 안에\n돌려받고 싶나요?',sub:'이 기간 안에 회수되는지 알려 드릴게요.',
    field:{key:'targetYears',unit:'년',min:1,max:30,step:.5},
    chips:[{label:'3년',value:3},{label:'5년',value:5},{label:'10년',value:10}]},
];

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=(n,step=1)=>Number(n).toLocaleString('ko-KR',{maximumFractionDigits:step<1?1:0});

export function openWizard(root,{values,answers={},preview,onFinish,onSkip}){
  let draft={...values},picked={...answers},path=[],index=0;
  const visible=()=>questions.filter(q=>!q.when||q.when(picked));
  const current=()=>visible()[index];
  root.hidden=false;document.body.classList.add('wizard-open');

  function apply(q,optionIndex){picked[q.id]=optionIndex;Object.assign(draft,q.options[optionIndex].values);}
  function canNext(q){return q.type==='number'||q.type==='multi'||picked[q.id]!==undefined;}
  function next(){const list=visible();if(index<list.length-1){index++;draw();}else drawResult();}
  function back(){if(index>0){index--;draw();}else drawIntro();}

  function shell(inner,{progress=null,backLabel='이전'}={}){
    root.innerHTML=`<div class="wz" role="dialog" aria-modal="true" aria-labelledby="wz-title"><div class="wz-top">${progress===null?'<span></span>':`<button class="wz-back" data-act="back" aria-label="${backLabel}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><div class="wz-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress*100)}"><i style="width:${progress*100}%"></i></div>`}<button class="wz-skip" data-act="skip">건너뛰기</button></div><div class="wz-body">${inner}</div></div>`;
    root.querySelector('h2,[data-focus]')?.focus({preventScroll:true});
  }
  function drawIntro(){
    shell(`<div class="wz-intro"><div class="wz-hero" aria-hidden="true"><span>🌶</span></div><h2 id="wz-title" tabindex="-1">고추 스마트팜,<br>질문 몇 개면 계산돼요</h2><p>질문 ${questions.filter(q=>!q.when).length}개에 답하면 예상 매출과 투자금 회수 기간을 바로 보여 드려요. 답은 나중에 언제든 바꿀 수 있어요.</p><ul class="wz-legend">${Object.values(tags).map(t=>`<li><i style="background:${t.color}"></i>${t.label}</li>`).join('')}</ul></div><div class="wz-cta"><button class="wz-primary" data-act="start">시작하기</button></div>`);
  }
  function draw(){
    const q=current(),list=visible(),tag=tags[q.tag];
    let body='';
    if(q.type==='choice')body=`<div class="wz-options" role="radiogroup" aria-labelledby="wz-title">${q.options.map((o,i)=>`<button class="wz-option ${picked[q.id]===i?'on':''}" role="radio" aria-checked="${picked[q.id]===i}" data-pick="${i}"><strong>${esc(o.label)}</strong><span>${esc(o.desc)}</span></button>`).join('')}</div>`;
    else if(q.type==='ox')body=`<div class="wz-ox" role="radiogroup" aria-labelledby="wz-title">${q.options.map((o,i)=>`<button class="wz-oxbtn ${o.mark==='O'?'o':'x'} ${picked[q.id]===i?'on':''}" role="radio" aria-checked="${picked[q.id]===i}" data-pick="${i}"><b aria-hidden="true">${o.mark}</b><strong>${esc(o.label)}</strong><span>${esc(o.desc)}</span></button>`).join('')}</div>`;
    else if(q.type==='number'){const f=q.field,v=draft[f.key];body=`<label class="wz-number"><span class="sr-only">${esc(q.title)}</span><input id="wz-${f.key}" data-field="${f.key}" type="number" inputmode="decimal" min="${f.min}" max="${f.max}" step="${f.step}" value="${v}" data-focus><em>${f.unit}</em></label><p class="wz-extra" id="wz-extra">${q.extra?esc(q.extra(v)):''}</p><div class="wz-chips">${q.chips.map(c=>`<button class="wz-chip ${Number(v)===c.value?'on':''}" data-chip="${c.value}">${esc(c.label)}</button>`).join('')}</div>`;}
    else if(q.type==='multi')body=`<div class="wz-multi">${q.fields.map(f=>`<label class="wz-row"><span>${esc(f.label)}</span><span class="wz-rowinput"><input id="wz-${f.key}" data-field="${f.key}" type="number" inputmode="decimal" min="${f.min}" max="${f.max}" step="${f.step}" value="${draft[f.key]}"><em>${f.unit}</em></span></label>`).join('')}</div><p class="wz-extra" id="wz-extra"></p>`;
    shell(`<div class="wz-q"><span class="wz-tag"><i style="background:${tag.color}"></i>${tag.label}</span><h2 id="wz-title" tabindex="-1">${esc(q.title).replace(/\n/g,'<br>')}</h2><p class="wz-sub">${esc(q.sub)}</p>${body}${q.note?`<p class="wz-note">${esc(q.note)}</p>`:''}</div><div class="wz-cta"><button class="wz-primary" data-act="next" ${canNext(q)?'':'disabled'}>${index===list.length-1?'결과 보기':'다음'}</button></div>`,{progress:(index+1)/(list.length+1)});
    if(q.type==='multi')updateLabor();
  }
  function updateLabor(){const el=root.querySelector('#wz-extra');if(!el)return;const total=draft.dailyHours*draft.workdays*draft.hourlyWage*draft.months;el.textContent=`재배 ${fmt(draft.months,.5)}개월 동안 인건비 약 ${fmt(Math.round(total/10000))}만원`;}
  function drawResult(){
    const r=preview(draft),man=n=>`${fmt(Math.round(n/10000))}만원`;
    const ok=r.met,loss=r.annualProfit<=0;
    shell(`<div class="wz-q wz-result"><span class="wz-tag"><i style="background:${ok?'#4f9a6c':loss?'#b36150':'#a87827'}"></i>계산 완료</span><h2 id="wz-title" tabindex="-1">${loss?'지금 조건으로는<br>운영 수익이 부족해요':ok?`약 ${fmt(r.payback.toFixed(1),.5)}년이면<br>투자금을 돌려받아요`:`회수까지 약 ${fmt(r.payback.toFixed(1),.5)}년,<br>목표보다 길어요`}</h2><dl class="wz-summary"><div><dt>초기 투자금</dt><dd>${man(r.investment)}</dd></div><div><dt>연간 매출</dt><dd>${man(r.revenue*r.cyclesPerYear)}</dd></div><div><dt>연간 운영이익</dt><dd class="${r.annualProfit<0?'neg':''}">${man(r.annualProfit)}</dd></div><div><dt>손익분기 단가</dt><dd>${r.breakeven===null?'—':`${fmt(Math.ceil(r.breakeven))}원/kg`}</dd></div></dl><p class="wz-note">입력한 답과 조사 자료로 낸 단순 추정치예요. 대시보드에서 값을 하나씩 바꿔 볼 수 있어요.</p></div><div class="wz-cta"><button class="wz-secondary" data-act="back">답 고치기</button><button class="wz-primary" data-act="finish">대시보드에서 자세히 보기</button></div>`,{progress:1});
    index=visible().length;
  }
  function close(){root.hidden=true;root.innerHTML='';document.body.classList.remove('wizard-open');root.removeEventListener('click',onClick);root.removeEventListener('input',onInput);root.removeEventListener('keydown',onKey);}
  function onClick(e){
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.act==='start'){index=0;draw();}
    else if(b.dataset.act==='skip'){close();onSkip?.();}
    else if(b.dataset.act==='back'){if(index>=visible().length){index=visible().length-1;draw();}else back();}
    else if(b.dataset.act==='next'){if(!b.disabled)next();}
    else if(b.dataset.act==='finish'){close();onFinish(draft,picked);}
    else if(b.dataset.pick!==undefined){const q=current();apply(q,Number(b.dataset.pick));draw();root.querySelector(`[data-pick="${b.dataset.pick}"]`)?.focus();}
    else if(b.dataset.chip!==undefined){const q=current();draft[q.field.key]=Number(b.dataset.chip);draw();}
  }
  function onInput(e){
    const input=e.target.closest('input[data-field]');if(!input)return;
    const v=input.valueAsNumber;if(!Number.isFinite(v))return;
    draft[input.dataset.field]=Math.min(Number(input.max),Math.max(Number(input.min),v));
    const q=current();
    if(q?.type==='number'){root.querySelector('#wz-extra').textContent=q.extra?q.extra(draft[q.field.key]):'';root.querySelectorAll('.wz-chip').forEach(c=>c.classList.toggle('on',Number(c.dataset.chip)===draft[q.field.key]));}
    else updateLabor();
  }
  function onKey(e){if(e.key==='Enter'&&e.target.matches('input')){e.preventDefault();next();}if(e.key==='Escape'){close();onSkip?.();}}
  root.addEventListener('click',onClick);root.addEventListener('input',onInput);root.addEventListener('keydown',onKey);
  drawIntro();
}
