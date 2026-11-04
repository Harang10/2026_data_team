import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults,presets,matchPreset,calculate,sanitize,scenario} from '../dist/model.js';

const close=(a,b,eps=1e-6)=>assert.ok(Math.abs(a-b)<eps,`${a} ≠ ${b}`);
// 원본 파이썬 계산과 같은 조건: 새 항목을 끄고 예전 기본값을 넣는다.
const legacy={...defaults,yieldPer1000:3000,salePrice:7000,areaPerPlant:.5,seedPackPrice:150,seedPackSize:1,germination:100,
  baseRate:1200,energyRate:60,baseBags:5,basePrice:26500,topBags:3,topPrice:25000,compostBags:0,sprayCount:6,pesticidePrice:25000,
  dryerKw:0,dryerPrice:0,fallowMonths:0};

test('legacy inputs still match the original Python formula',()=>{const r=calculate(legacy);assert.equal(r.investment,120000000);assert.equal(r.seedCount,2000);assert.equal(r.totalYield,3000);close(r.totalCost,8160380,.001);assert.equal(r.revenue,21000000);close(r.annualProfit,25679240,.001);close(r.payback,4.673035494041883,1e-4);assert.equal(r.met,true);});
test('research defaults reproduce the report worked examples',()=>{const r=calculate(defaults);
  assert.equal(r.plantCount,2778);assert.equal(r.seedCount,2925);assert.equal(r.seedPacks,3);assert.equal(r.costs.seed,360000);
  assert.equal(r.totalYield,239);assert.equal(r.revenue,239*15167);close(r.freshYield,239/.181);
  assert.equal(r.dryingBatches,7);assert.equal(r.dryingKwh,7*8.5*48);close(r.costs.drying,7*8.5*48*65.9*1.14);
  assert.equal(r.costs.fertilizer,5*18500+1*17250);assert.equal(r.costs.pesticide,13*24800);
  assert.equal(r.investment,122400000);assert.equal(r.cyclesPerYear,1);});
test('germination at the legal minimum buys four seed packs',()=>{assert.equal(calculate({...defaults,germination:65}).seedPacks,4);});
test('loss and zero yield do not produce invalid payback or prices',()=>{const r=calculate({...defaults,salePrice:0,yieldPer1000:0});assert.equal(r.payback,null);assert.equal(r.breakeven,null);assert.equal(r.targetPrice,null);assert.equal(r.met,false);assert.equal(r.costs.drying,0);});
test('fallow time changes annualization without changing crop costs',()=>{const base=calculate(legacy),r=calculate({...legacy,fallowMonths:6});assert.equal(r.totalCost,base.totalCost);assert.equal(r.annualProfit,base.annualProfit/2);assert.equal(r.payback,base.payback*2);assert.equal(r.met,false);});
test('exact target price recovers the investment on time',()=>{const r=calculate(legacy);const adjusted=calculate({...legacy,salePrice:r.targetPrice});close(adjusted.payback,legacy.targetYears,1e-9);});
test('bag calculations round up at each required step',()=>{const r=calculate({...defaults,area:1001});assert.equal(r.costs.fertilizer,ceil(4.5*1.001)*18500+ceil(1.001)*17250);assert.equal(r.costs.pesticide,2*13*24800);});
const ceil=Math.ceil;
test('zero investment is handled separately, including operating losses',()=>{const z={...defaults,construction:0,dryerPrice:0};assert.equal(calculate(z).payback,0);const r=calculate({...z,salePrice:0});assert.equal(r.payback,0);assert.equal(r.met,false);});
test('saved inputs reject invalid numbers and clamp supported ranges',()=>{const s=sanitize({area:-1,months:0,germination:0,salePrice:Infinity,targetYears:'bad',dryerCapacity:0});assert.equal(s.area,100);assert.equal(s.months,1);assert.equal(s.germination,10);assert.equal(s.salePrice,15167);assert.equal(s.targetYears,5);assert.equal(s.dryerCapacity,10);});
test('scenario changes compound and keep operating costs constant',()=>{const base=calculate(legacy),low=scenario(legacy,.8,.8);close(low.revenue,base.revenue*.64,.001);assert.equal(low.totalCost,base.totalCost);assert.ok(low.payback>base.payback);});
test('every preset references real fields within range and defaults match a preset',()=>{for(const preset of presets){for(const option of preset.options){const s=sanitize({...defaults,...option.values});for(const [key,value] of Object.entries(option.values)){assert.ok(key in defaults,key);assert.equal(s[key],value,`${preset.id}.${key}`);}}assert.ok(matchPreset(preset,defaults)>=0,preset.id);}});
