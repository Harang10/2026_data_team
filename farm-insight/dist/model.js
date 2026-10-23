export const groups = [
  {title:'기본 정보',open:true,fields:[
    ['area','재배 면적',1000,100,10000,50,'㎡','100㎡','10,000㎡'],
    ['months','재배 기간',6,1,12,.5,'개월','1개월','12개월'],
    ['targetYears','목표 투자금 회수 기간',5,1,30,.5,'년','1년','30년'],
    ['construction','1,000㎡당 설치비',120000000,0,500000000,1000000,'원','0원','5억원'],
  ]},
  {title:'생산과 판매',open:true,fields:[
    ['yieldPerM2','㎡당 생산량',3,0,20,.1,'kg','0kg','20kg','재배 1회 기준 · 기본값은 가정치입니다.'],
    ['salePrice','고추 판매 단가',7000,0,30000,100,'원/kg','0원','30,000원','7,000원은 예시 단가이며, 시세가 아닙니다.'],
  ]},
  {title:'인건비',fields:[
    ['dailyHours','하루 총 노동시간',4,0,48,.5,'시간','0시간','48시간','전체 작업자의 노동시간을 합산해 주세요.'],
    ['workdays','월 근무일수',25,0,31,1,'일','0일','31일'],
    ['hourlyWage','시간당 임금',11000,0,50000,100,'원','0원','50,000원'],
  ]},
  {title:'전기요금',fields:[
    ['contractKw','계약전력',10,0,200,1,'kW','0kW','200kW'],
    ['monthlyKwh','월 전력 사용량',2000,0,50000,100,'kWh','0kWh','50,000kWh'],
    ['baseRate','kW당 월 기본요금',1200,0,10000,10,'원','0원','10,000원'],
    ['energyRate','kWh당 사용요금',60,0,500,1,'원','0원','500원'],
    ['electricitySurcharge','전기요금 가산율',14,0,50,1,'%','0%','50%','원본의 1.14배 가정을 반영한 값입니다.'],
  ]},
  {title:'종자 · 비료 · 농약',fields:[
    ['areaPerPlant','포기당 재배 면적',.5,.1,2,.05,'㎡','0.1㎡','2㎡'],
    ['seedPrice','종자 1개 가격',150,0,3000,10,'원','0원','3,000원'],
    ['germination','종자 발아율',100,10,100,1,'%','10%','100%'],
    ['baseBags','1,000㎡당 밑거름',5,0,50,1,'포','0포','50포'],
    ['basePrice','밑거름 1포 가격',26500,0,100000,500,'원','0원','100,000원'],
    ['topBags','1,000㎡당 웃거름',3,0,50,1,'포','0포','50포'],
    ['topPrice','웃거름 1포 가격',25000,0,100000,500,'원','0원','100,000원'],
    ['pesticideUnits','1,000㎡당 농약 사용량',1,0,10,1,'개','0개','10개'],
    ['sprayCount','재배 기간 방제 횟수',6,0,30,1,'회','0회','30회'],
    ['pesticidePrice','농약 1개 가격',25000,0,100000,500,'원','0원','100,000원'],
  ]},
  {title:'휴지 기간 · 기타 비용',fields:[
    ['fallowMonths','재배 사이 휴지 기간',0,0,12,.5,'개월','0개월','12개월','기본값 0은 쉬지 않고 연속 재배하는 가정입니다.'],
    ['otherCost','재배 1회 기타 비용',0,0,50000000,100000,'원','0원','5,000만원','수도·포장·운송·임차료 등 별도 지출을 더하세요.'],
  ]},
];
export const fields = groups.flatMap(group=>group.fields);
export const defaults = Object.fromEntries(fields.map(([key,,value])=>[key,value]));
export function sanitize(values={}) {
  return Object.fromEntries(fields.map(([key,,value,min,max])=>{
    const input=values[key];
    return [key,typeof input==='number'&&Number.isFinite(input)?Math.min(max,Math.max(min,input)):value];
  }));
}
export function calculate(input) {
  const s=sanitize(input);
  const investment=s.area/1000*s.construction;
  const plantCount=Math.ceil(s.area/s.areaPerPlant);
  const seedCount=Math.ceil(plantCount/(s.germination/100));
  const seed=seedCount*s.seedPrice;
  const labor=s.dailyHours*s.workdays*s.hourlyWage*s.months;
  const electricity=(s.contractKw*s.baseRate+s.monthlyKwh*s.energyRate)*(1+s.electricitySurcharge/100)*s.months;
  const fertilizer=Math.ceil(s.baseBags*s.area/1000)*s.basePrice+Math.ceil(s.topBags*s.area/1000)*s.topPrice;
  const pesticide=Math.ceil(s.pesticideUnits*s.area/1000)*s.sprayCount*s.pesticidePrice;
  const costs={labor,electricity,seed,fertilizer,pesticide,other:s.otherCost};
  const totalCost=Object.values(costs).reduce((a,b)=>a+b,0);
  const totalYield=s.area*s.yieldPerM2;
  const revenue=totalYield*s.salePrice;
  const profit=revenue-totalCost;
  const cyclesPerYear=12/(s.months+s.fallowMonths);
  const annualProfit=profit*cyclesPerYear;
  const payback=investment===0?0:annualProfit>0?investment/annualProfit:null;
  const met=annualProfit>0&&payback!==null&&payback<=s.targetYears;
  const breakeven=totalYield>0?totalCost/totalYield:null;
  const targetPrice=totalYield>0?(totalCost+investment/s.targetYears/cyclesPerYear)/totalYield:null;
  return {investment,plantCount,seedCount,costs,totalCost,totalYield,revenue,profit,cyclesPerYear,annualProfit,payback,met,breakeven,targetPrice};
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
