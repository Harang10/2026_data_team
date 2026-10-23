import math

print("========== 고추 스마트팜 경제성 분석 ==========\n")

# 1. 기본 정보
area = float(input("재배 면적 (㎡, 기본 1000): ") or 1000)
months = float(input("재배 기간 (개월, 기본 6): ") or 6)
target_years = float(input("목표 투자금 회수 기간 (년, 기본 5): ") or 5)

# 2. 초기 투자금
construction_per_1000 = float(
    input("1000㎡당 스마트팜 설치비 (원, 기본 120000000): ") or 120000000
)
investment = area / 1000 * construction_per_1000

# 3. 종자 비용
area_per_plant = 0.5
seed_price = 150
germination = 1.0

plant_count = math.ceil(area / area_per_plant)
seed_count = math.ceil(plant_count / germination)
seed_cost = seed_count * seed_price

# 4. 인건비
daily_hours = float(input("하루 노동시간 (시간, 기본 4): ") or 4)
workdays = float(input("월 근무일수 (일, 기본 25): ") or 25)
hourly_wage = float(input("시간당 임금 (원, 기본 11000): ") or 11000)

monthly_labor = daily_hours * workdays * hourly_wage
labor_cost = monthly_labor * months

# 5. 전기요금
contract_kw = float(input("계약전력 (kW, 기본 10): ") or 10)
monthly_kwh = float(input("월 전력 사용량 (kWh, 기본 2000): ") or 2000)

base_rate = 1200
energy_rate = 60

monthly_electricity = (
    contract_kw * base_rate + monthly_kwh * energy_rate
) * 1.14

electricity_cost = monthly_electricity * months

# 6. 비료 비용
base_bags = math.ceil(5 * area / 1000)
top_bags = math.ceil(3 * area / 1000)

base_price = 26500
top_price = 25000

fertilizer_cost = base_bags * base_price + top_bags * top_price

# 7. 농약 비용
pesticide_units = 1
spray_count = float(input("재배 기간 방제 횟수 (회, 기본 6): ") or 6)
pesticide_price = 25000

pesticide_cost = (
    math.ceil(pesticide_units * area / 1000)
    * spray_count
    * pesticide_price
)

# 8. 기타 비용
other_cost = float(input("재배 1회 기타 비용 (원, 기본 0): ") or 0)

# 9. 고추 생산량 및 판매 매출
yield_per_m2 = 3.0  # ㎡당 고추 생산량(kg), 임시 가정값
sale_price = float(input("고추 판매 단가 (원/kg): "))

total_yield = area * yield_per_m2
revenue = total_yield * sale_price

# 10. 재배 1회 총 운영비
total_cost = (
    seed_cost
    + labor_cost
    + electricity_cost
    + fertilizer_cost
    + pesticide_cost
    + other_cost
)

# 11. 재배 1회 순이익
net_profit = revenue - total_cost

# 12. 투자금 회수 기간
if net_profit > 0:
    payback_months = investment / net_profit * months
    payback_years = payback_months / 12
else:
    payback_months = None
    payback_years = None

# 13. 결과 출력
print("\n========== 분석 결과 ==========")
print(f"재배 면적: {area:,.0f}㎡")
print(f"필요 종자 수: {seed_count:,}개")
print(f"예상 고추 판매량: {total_yield:,.1f}kg")

print(f"\n초기 투자금: {investment:,.0f}원")
print(f"종자 비용: {seed_cost:,.0f}원")
print(f"인건비: {labor_cost:,.0f}원")
print(f"전기요금: {electricity_cost:,.0f}원")
print(f"비료 비용: {fertilizer_cost:,.0f}원")
print(f"농약 비용: {pesticide_cost:,.0f}원")
print(f"기타 비용: {other_cost:,.0f}원")

print(f"\n재배 1회 총 운영비: {total_cost:,.0f}원")
print(f"재배 1회 총매출: {revenue:,.0f}원")
print(f"재배 1회 순이익: {net_profit:,.0f}원")

print("\n========== 투자금 회수 분석 ==========")

if payback_years is None:
    print("운영 수익이 0원 이하이므로 투자금 회수가 어렵습니다.")
else:
    print(f"예상 투자금 회수 기간: {payback_years:.2f}년")
    print(f"목표 투자금 회수 기간: {target_years:.2f}년")

    if payback_years <= target_years:
        print("결과: 목표 기간 내 투자금 회수 가능")
    else:
        print("결과: 목표 기간 내 투자금 회수 어려움")
