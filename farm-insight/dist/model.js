// 기본값 출처: 자료조사팀 「안동 고추 스마트팜 경제성 분석 변수 조사 보고서」(2026.10.29)
// 생산량·단가는 노지 건고추 기준이다. 고추 스마트팜 실측 자료는 아직 없다.
export const groups = [
  {title:'기본 정보',open:true,fields:[
    ['area','재배 면적',1000,100,10000,50,'㎡','100㎡','10,000㎡'],
    ['months','재배 기간',6,1,12,.5,'개월','1개월','12개월','노지 건고추는 5월 정식 후 8~10월 수확하는 연 1작이 일반적입니다.'],
    ['targetYears','목표 투자금 회수 기간',5,1,30,.5,'년','1년','30년'],
    ['construction','1,000㎡당 설치비',120000000,0,500000000,1000000,'원','0원','5억원','고추 스마트팜 설치비 실측 자료가 없어 원본 가정값을 유지했습니다. 실제 견적으로 바꿔 주세요.'],
  ]},
  {title:'생산과 판매',open:true,fields:[
    ['yieldPer1000','1,000㎡당 생산량(건고추)',239,0,10000,1,'kg','0kg','10,000kg','경북 노지 2025년 통계(2023~2025년 221~252kg). 스마트팜 증수 효과는 가정값으로 따로 조정하세요.'],
    ['salePrice','건고추 판매 단가',15167,0,50000,1,'원/kg','0원','50,000원','서안동농협 산지가 2025.9 기준(9,100원/600g). 생산량과 같은 건고추 기준으로 입력하세요.'],
  ]},
  {title:'인건비',fields:[
    ['dailyHours','하루 총 노동시간',4,0,48,.5,'시간','0시간','48시간','전체 작업자의 노동시간을 합산해 주세요.'],
    ['workdays','월 근무일수',25,0,31,1,'일','0일','31일'],
    ['hourlyWage','시간당 임금',11000,0,50000,100,'원','0원','50,000원','참고: 2024 노지고추 노동비(자가노동 포함)는 1,000㎡당 약 327만원입니다.'],
  ]},
  {title:'전기요금',fields:[
    ['contractKw','계약전력',10,0,200,1,'kW','0kW','200kW'],
    ['monthlyKwh','월 전력 사용량',2000,0,50000,100,'kWh','0kWh','50,000kWh','스마트팜 전력 사용량 실측 자료가 없어 원본 가정값을 유지했습니다.'],
    ['baseRate','kW당 월 기본요금',1150,0,10000,10,'원','0원','10,000원','한전 농사용(을) 저압, 2025.4.1 적용'],
    ['energyRate','kWh당 사용요금',65.9,0,500,.1,'원','0원','500원','한전 농사용(을) 저압, 2025.4.1 적용'],
    ['electricitySurcharge','전기요금 추가 요금률',14,0,50,1,'%','0%','50%','기후환경·연료비조정요금·부가세·전력기반기금 합계. 단가 미확인으로 원본의 14% 가정을 유지했습니다.'],
  ]},
  {title:'고추 건조',fields:[
    ['dryRatio','건조율(생고추→건고추)',18.1,5,40,.1,'%','5%','40%','통계청 기준 18.1%. 생고추 무게 = 건고추 ÷ 건조율'],
    ['dryerCapacity','건조기 1회 투입량(생고추)',200,10,2000,10,'kg','10kg','2,000kg','제품 예시: 소비전력 8.5kW, 생고추 약 200kg급'],
    ['dryerKw','건조기 소비전력',8.5,0,50,.5,'kW','0kW','50kW'],
    ['dryerHours','건조 1회 시간',48,0,120,1,'시간','0시간','120시간','50~60℃ 열풍 약 48시간(청양군 농업기술센터). 히터가 계속 켜진 상한 추정입니다.'],
    ['dryerPrice','건조기 구입비',2400000,0,50000000,100000,'원','0원','5,000만원','초기 투자금에 더합니다. 이미 있으면 0원으로 두세요.'],
  ]},
  {title:'종자',fields:[
    ['areaPerPlant','포기당 재배 면적',.36,.1,2,.01,'㎡','0.1㎡','2㎡','1줄 120×30cm = 0.36㎡(1,000㎡당 2,778주), 2줄 150×40cm = 0.30㎡'],
    ['seedPackPrice','종자 1봉 가격',120000,0,500000,1000,'원','0원','50만원'],
    ['seedPackSize','1봉 종자 수',1200,1,10000,1,'립','1립','10,000립','종자는 봉 단위로 구매해 필요 봉수를 올림합니다.'],
    ['germination','종자 발아율',95,10,100,1,'%','10%','100%','기본 95%(소은희 외 2014 저장 시험 근거). 법정 최저 기준은 65%입니다.'],
  ]},
  {title:'비료 · 퇴비',fields:[
    ['baseBags','1,000㎡당 밑거름',4.5,0,50,.1,'포','0포','50포','뿌리조은(12-7-9) 20kg 기준 90kg = 4.5포'],
    ['basePrice','밑거름 1포 가격',18500,0,100000,500,'원','0원','100,000원','보조 후 가격'],
    ['topBags','1,000㎡당 웃거름',1,0,50,.1,'포','0포','50포','요소(질소 46%) 20kg 기준. 질소 8.8kg ÷ 0.46 ≈ 19kg'],
    ['topPrice','웃거름 1포 가격',17250,0,100000,250,'원','0원','100,000원','보조 후 가격(2026.10.20~)'],
    ['compostBags','1,000㎡당 퇴비',100,0,300,5,'포','0포','300포','권장 2,000kg ÷ 20kg포'],
    ['compostPrice','퇴비 1포 가격',0,0,30000,100,'원','0원','30,000원','안동 지역농협 가격 조사 중이라 0원으로 두었습니다.'],
  ]},
  {title:'농약',fields:[
    ['pesticideUnits','1,000㎡당 1회 농약 단위',1,0,10,1,'개','0개','10개'],
    ['sprayCount','재배 기간 방제 횟수',13,0,30,1,'회','0회','30회','2025 농가 설문 최빈 구간 11~15회(65.9%)의 가운데 값'],
    ['pesticidePrice','1회 농약 비용',24800,0,100000,100,'원','0원','100,000원','임시값: 2024 노지고추 농약비 1,000㎡당 32.2만원 ÷ 13회. 지역농협 가격 조사 후 수정하세요.'],
  ]},
  {title:'휴지 기간 · 기타 비용',fields:[
    ['fallowMonths','재배 사이 휴지 기간',6,0,48,.5,'개월','0개월','48개월','재배 6개월 + 휴지 6개월 = 연 1작. 풋마름병 발생 밭은 3~4년 돌려짓기가 권장됩니다.'],
    ['otherCost','재배 1회 기타 비용',0,0,50000000,100000,'원','0원','5,000만원','수도·포장·운송·임차료 등 별도 지출을 더하세요.'],
  ]},
];
export const fields = groups.flatMap(group=>group.fields);
export const defaults = Object.fromEntries(fields.map(([key,,value])=>[key,value]));

// 조사 자료에서 고를 수 있는 값 묶음. 선택하면 해당 입력값을 한 번에 바꾼다.
export const presets = [
  {id:'variety',label:'품종(종자)',options:[
    {label:'칼라짱 · 농우바이오',values:{seedPackPrice:120000,seedPackSize:1200},note:'1,200립 120,000원 (1립 100원)'},
    {label:'초특급 · 농우바이오',values:{seedPackPrice:135000,seedPackSize:1200},note:'1,200립 135,000원 (1립 112.5원)'},
    {label:'트리플탑 · 삼성종묘',values:{seedPackPrice:150000,seedPackSize:1200},note:'1,200립 150,000원 (1립 125원)'},
    {label:'칼탄패스 · 농우바이오',values:{seedPackPrice:170000,seedPackSize:1200},note:'1,200립 170,000원 (1립 141.7원)'},
  ]},
  {id:'planting',label:'재식 방식',options:[
    {label:'1줄 120×30cm',values:{areaPerPlant:.36},note:'포기당 0.36㎡ · 1,000㎡당 2,778주'},
    {label:'2줄 150×40cm',values:{areaPerPlant:.3},note:'포기당 0.30㎡ · 1,000㎡당 3,333주'},
  ]},
  {id:'yield',label:'생산량 기준',options:[
    {label:'경북 2025년',values:{yieldPer1000:239},note:'239kg/1,000㎡ (통계청)'},
    {label:'경북 3년 평균',values:{yieldPer1000:237},note:'2023~2025 평균 237kg'},
    {label:'경북 2023년(흉작)',values:{yieldPer1000:221},note:'221kg · 보수적 기준'},
    {label:'안동 2022년',values:{yieldPer1000:258},note:'258kg (안동시 농업기술센터)'},
  ]},
  {id:'price',label:'판매 단가 기준',options:[
    {label:'서안동 산지가 2025.9',values:{salePrice:15167},note:'9,100원/600g'},
    {label:'서안동 산지가 2026.3',values:{salePrice:14000},note:'8,400원/600g · 최근 저점'},
    {label:'서안동 산지가 2024.7',values:{salePrice:17500},note:'10,500원/600g'},
    {label:'도매가 2025.9 (비교용)',values:{salePrice:22167},note:'13,300원/600g · 농가 수취가 아님'},
  ]},
  {id:'power',label:'전기 계약종별',options:[
    {label:'농사용(을) 저압',values:{baseRate:1150,energyRate:65.9},note:'기본 1,150원/kW · 65.9원/kWh'},
    {label:'농사용(을) 고압',values:{baseRate:1210,energyRate:68.6},note:'기본 1,210원/kW · 여름·겨울 68.6원/kWh (봄·가을 66.6원)'},
    {label:'농사용(갑)',values:{baseRate:360,energyRate:48.3},note:'양곡 생산용 양수·배수 전용 · 고추 재배는 대상 아님'},
  ]},
];
export function matchPreset(preset,values){
  return preset.options.findIndex(option=>Object.entries(option.values).every(([key,value])=>Math.abs(values[key]-value)<1e-9));
}

export function sanitize(values={}) {
  return Object.fromEntries(fields.map(([key,,value,min,max])=>{
    const input=values[key];
    return [key,typeof input==='number'&&Number.isFinite(input)?Math.min(max,Math.max(min,input)):value];
  }));
}
export function calculate(input) {
  const s=sanitize(input);
  const facility=s.area/1000*s.construction;
  const investment=facility+s.dryerPrice;
  const plantCount=Math.ceil(s.area/s.areaPerPlant);
  const seedCount=Math.ceil(plantCount/(s.germination/100));
  const seedPacks=Math.ceil(seedCount/s.seedPackSize);
  const seed=seedPacks*s.seedPackPrice;
  const labor=s.dailyHours*s.workdays*s.hourlyWage*s.months;
  const rateFactor=1+s.electricitySurcharge/100;
  const electricity=(s.contractKw*s.baseRate+s.monthlyKwh*s.energyRate)*rateFactor*s.months;
  const totalYield=s.area/1000*s.yieldPer1000;
  const freshYield=totalYield/(s.dryRatio/100);
  const dryingBatches=totalYield>0?Math.ceil(freshYield/s.dryerCapacity):0;
  const dryingKwh=dryingBatches*s.dryerKw*s.dryerHours;
  const drying=dryingKwh*s.energyRate*rateFactor;
  const fertilizer=Math.ceil(s.baseBags*s.area/1000)*s.basePrice+Math.ceil(s.topBags*s.area/1000)*s.topPrice;
  const compost=Math.ceil(s.compostBags*s.area/1000)*s.compostPrice;
  const pesticide=Math.ceil(s.pesticideUnits*s.area/1000)*s.sprayCount*s.pesticidePrice;
  const costs={labor,electricity,drying,seed,fertilizer,compost,pesticide,other:s.otherCost};
  const totalCost=Object.values(costs).reduce((a,b)=>a+b,0);
  const revenue=totalYield*s.salePrice;
  const profit=revenue-totalCost;
  const cyclesPerYear=12/(s.months+s.fallowMonths);
  const annualProfit=profit*cyclesPerYear;
  const payback=investment===0?0:annualProfit>0?investment/annualProfit:null;
  const met=annualProfit>0&&payback!==null&&payback<=s.targetYears;
  const breakeven=totalYield>0?totalCost/totalYield:null;
  const targetPrice=totalYield>0?(totalCost+investment/s.targetYears/cyclesPerYear)/totalYield:null;
  return {investment,facility,plantCount,seedCount,seedPacks,freshYield,dryingBatches,dryingKwh,costs,totalCost,totalYield,revenue,profit,cyclesPerYear,annualProfit,payback,met,breakeven,targetPrice};
}
// Scenarios may exceed slider bounds; apply changes to outputs so the stated percentages remain exact.
export function scenario(input,priceFactor,yieldFactor) {
  const base=calculate(input);
  const revenue=base.revenue*priceFactor*yieldFactor;
  const profit=revenue-base.totalCost;
  const annualProfit=profit*base.cyclesPerYear;
  const payback=base.investment===0?0:annualProfit>0?base.investment/annualProfit:null;
  return {...base,revenue,profit,annualProfit,payback,met:annualProfit>0&&payback!==null&&payback<=sanitize(input).targetYears};
}
