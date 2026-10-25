import { getFood, perServing, costOf, type Diet } from './foods';

export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export const ACTIVITY = [
  { v: 1.2, label: 'Mostly sitting, little exercise' }, { v: 1.375, label: 'Light: walks or exercise 1-3 days a week' },
  { v: 1.55, label: 'Moderate: exercise 3-5 days a week' }, { v: 1.725, label: 'Very active: hard exercise 6-7 days a week' },
];
/** Mifflin-St Jeor resting energy estimate. */
export const bmr = (sex: Sex, kg: number, cm: number, age: number) => 10 * kg + 6.25 * cm - 5 * age + (sex === 'male' ? 5 : -161);
export const bmi = (kg: number, cm: number) => kg / ((cm / 100) ** 2);
/** Daily calorie target with a gentle, safe adjustment and a minimum floor. */
export function calorieTarget(sex: Sex, kg: number, cm: number, age: number, act: number, goal: Goal) {
  const tdee = Math.round(bmr(sex, kg, cm, age) * act);
  const floor = sex === 'male' ? 1500 : 1200;
  const target = goal === 'lose' ? Math.max(floor, tdee - 400) : goal === 'gain' ? tdee + 350 : tdee;
  return { tdee, target: Math.round(target / 10) * 10, floor };
}
export const proteinTarget = (kg: number, goal: Goal) => Math.round(kg * (goal === 'maintain' ? 1.2 : 1.6));

type Slot = 'breakfast' | 'lunch' | 'snack' | 'dinner';
export type Meal = { id: string; slot: Slot; name: string; diet: Diet; items: [string, number][] };
export const SLOTS: Slot[] = ['breakfast', 'lunch', 'snack', 'dinner'];
export const MEALS: Meal[] = [
  { id: 'b1', slot: 'breakfast', name: 'Oats with milk and peanuts', diet: 'veg', items: [['oats', 1], ['milk', 1], ['peanuts', 0.5]] },
  { id: 'b2', slot: 'breakfast', name: 'Sattu drink with roasted chana', diet: 'veg', items: [['sattu', 1], ['roasted-chana', 0.7]] },
  { id: 'b3', slot: 'breakfast', name: 'Paneer roti roll with curd', diet: 'veg', items: [['roti', 2], ['paneer', 0.5], ['curd', 1]] },
  { id: 'b4', slot: 'breakfast', name: 'Besan chilla with curd', diet: 'veg', items: [['besan', 1.5], ['curd', 1]] },
  { id: 'b5', slot: 'breakfast', name: 'Moong salad, roti and milk', diet: 'veg', items: [['sabut-moong', 1], ['roti', 1], ['milk', 1]] },
  { id: 'b6', slot: 'breakfast', name: 'Boiled eggs with roti', diet: 'egg', items: [['egg', 3], ['roti', 2]] },
  { id: 'b7', slot: 'breakfast', name: 'Egg oats bowl with milk', diet: 'egg', items: [['egg', 2], ['oats', 1], ['milk', 1]] },
  { id: 'l1', slot: 'lunch', name: 'Toor dal, rice, curd and peas', diet: 'veg', items: [['toor-dal', 1], ['rice', 1.2], ['curd', 1], ['green-peas', 0.5]] },
  { id: 'l2', slot: 'lunch', name: 'Rajma rice with curd', diet: 'veg', items: [['rajma', 1.2], ['rice', 1.2], ['curd', 0.5]] },
  { id: 'l3', slot: 'lunch', name: 'Chole with roti and curd', diet: 'veg', items: [['chole', 1.2], ['roti', 3], ['curd', 1]] },
  { id: 'l4', slot: 'lunch', name: 'Soya curry, roti and masoor dal', diet: 'veg', items: [['soya-chunks', 1], ['roti', 3], ['masoor-dal', 0.7]] },
  { id: 'l5', slot: 'lunch', name: 'Paneer sabzi, roti and moong dal', diet: 'veg', items: [['paneer', 1], ['roti', 3], ['moong-dal', 1]] },
  { id: 'l6', slot: 'lunch', name: 'Lobia rice with curd', diet: 'veg', items: [['lobia', 1.2], ['rice', 1.2], ['curd', 1]] },
  { id: 'l7', slot: 'lunch', name: 'Chicken, rice and moong dal', diet: 'nonveg', items: [['chicken-breast', 1.3], ['rice', 1.2], ['moong-dal', 0.7]] },
  { id: 'l8', slot: 'lunch', name: 'Fish curry, rice and masoor dal', diet: 'nonveg', items: [['fish-rohu', 1.5], ['rice', 1.2], ['masoor-dal', 0.5]] },
  { id: 's1', slot: 'snack', name: 'Roasted chana and milk', diet: 'veg', items: [['roasted-chana', 1], ['milk', 1]] },
  { id: 's2', slot: 'snack', name: 'Peanuts and curd', diet: 'veg', items: [['peanuts', 0.7], ['curd', 1]] },
  { id: 's3', slot: 'snack', name: 'Kala chana chaat', diet: 'veg', items: [['kala-chana', 1]] },
  { id: 's4', slot: 'snack', name: 'Tofu or paneer bites', diet: 'veg', items: [['tofu', 1]] },
  { id: 's5', slot: 'snack', name: 'Two boiled eggs', diet: 'egg', items: [['egg', 2]] },
  { id: 'd1', slot: 'dinner', name: 'Moong dal, roti and peas', diet: 'veg', items: [['moong-dal', 1.2], ['roti', 3], ['green-peas', 0.5]] },
  { id: 'd2', slot: 'dinner', name: 'Soya roti with curd', diet: 'veg', items: [['soya-chunks', 1], ['roti', 3], ['curd', 1]] },
  { id: 'd3', slot: 'dinner', name: 'Paneer, roti and toor dal', diet: 'veg', items: [['paneer', 1], ['roti', 2], ['toor-dal', 1]] },
  { id: 'd4', slot: 'dinner', name: 'Kala chana, roti and curd', diet: 'veg', items: [['kala-chana', 1.3], ['roti', 2], ['curd', 1]] },
  { id: 'd5', slot: 'dinner', name: 'Tofu rice with chana dal', diet: 'veg', items: [['tofu', 1.5], ['rice', 1.2], ['chana-dal', 0.7]] },
  { id: 'd6', slot: 'dinner', name: 'Chicken, roti and curd', diet: 'nonveg', items: [['chicken-breast', 1.3], ['roti', 3], ['curd', 0.7]] },
  { id: 'd7', slot: 'dinner', name: 'Egg curry, roti and moong dal', diet: 'egg', items: [['egg', 3], ['roti', 3], ['moong-dal', 0.7]] },
];

const allowed = (diet: Diet, m: Meal) => diet === 'nonveg' || m.diet === 'veg' || (diet === 'egg' && m.diet === 'egg');
export const mealStats = (m: Meal) => m.items.reduce((a, [slug, q]) => { const f = getFood(slug)!; const s = perServing(f); return { kcal: a.kcal + s.k * q, p: a.p + s.p * q, cost: a.cost + costOf(f) * q }; }, { kcal: 0, p: 0, cost: 0 });
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const quarter = (n: number) => Math.max(0.25, Math.round(n * 4) / 4);

export type PlannedMeal = { meal: Meal; items: { slug: string; qty: number }[] };
export type Day = { meals: PlannedMeal[]; kcal: number; p: number; cost: number; mult: number };

/** Builds a 7-day plan. Portions are scaled to the calorie target; if over budget, cheaper meals are swapped in. */
export function buildPlan(diet: Diet, kcalTarget: number, budget: number): { days: Day[]; avgCost: number; avgKcal: number; avgP: number; overBudget: boolean; shopping: { slug: string; grams: number; cost: number }[] } {
  const pool = SLOTS.map(s => MEALS.filter(m => m.slot === s && allowed(diet, m)));
  const eval_ = (picks: Meal[]) => {
    const st = picks.map(mealStats); const base = st.reduce((a, x) => a + x.kcal, 0);
    const mult = clamp(kcalTarget / base, 0.7, 1.6);
    return { mult, kcal: base * mult, p: st.reduce((a, x) => a + x.p, 0) * mult, cost: st.reduce((a, x) => a + x.cost, 0) * mult };
  };
  const days: Day[] = [];
  for (let d = 0; d < 7; d++) {
    let picks = pool.map((c, i) => c[(d + i * 2) % c.length]);
    for (let n = 0; n < 12; n++) {
      const cur = eval_(picks); if (cur.cost <= budget) break;
      let best: { i: number; m: Meal; cost: number } | null = null;
      pool.forEach((c, i) => c.forEach(m => { if (m.id === picks[i].id) return; const t = [...picks]; t[i] = m; const e = eval_(t); if (e.cost < cur.cost - 0.01 && (!best || e.cost < best.cost)) best = { i, m, cost: e.cost }; }));
      if (!best) break;
      const b = best as { i: number; m: Meal }; picks = picks.map((p, i) => (i === b.i ? b.m : p));
    }
    const e = eval_(picks);
    days.push({ mult: e.mult, kcal: Math.round(e.kcal), p: Math.round(e.p), cost: Math.round(e.cost), meals: picks.map(m => ({ meal: m, items: m.items.map(([slug, q]) => ({ slug, qty: quarter(q * e.mult) })) })) });
  }
  const week = new Map<string, number>();
  days.forEach(day => day.meals.forEach(pm => pm.items.forEach(it => week.set(it.slug, (week.get(it.slug) || 0) + it.qty))));
  const shopping = [...week.entries()].map(([slug, qty]) => { const f = getFood(slug)!; const grams = Math.round(qty * f.buyG / 10) * 10; return { slug, grams, cost: Math.round(grams / 1000 * f.price) }; }).sort((a, b) => b.cost - a.cost);
  const avg = (k: 'cost' | 'kcal' | 'p') => Math.round(days.reduce((a, x) => a + x[k], 0) / 7);
  return { days, avgCost: avg('cost'), avgKcal: avg('kcal'), avgP: avg('p'), overBudget: avg('cost') > budget, shopping };
}
