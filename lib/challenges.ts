/** Built-in fitness challenges. `rule.kind` tells the site how a day is counted. */
export type ChallengeKind = 'water' | 'steps' | 'workout' | 'sleep' | 'manual';
export type Challenge = {
  id: string; title: string; icon: string; days: number; level: 'Easy' | 'Medium' | 'Hard';
  blurb: string; rule: { kind: ChallengeKind; target: number; label: string }; tips: string[]; from: string; to: string;
};
export const CHALLENGES: Challenge[] = [
  { id: 'water-7', title: '7-day Hydration Challenge', icon: '💧', days: 7, level: 'Easy', from: '#2EA8FF', to: '#14C8B4',
    blurb: 'Drink 8 glasses of water every day for a week. Better energy, skin and fewer false hunger signals.',
    rule: { kind: 'water', target: 8, label: '8 glasses of water' }, tips: ['Drink a glass as soon as you wake up', 'Keep a bottle at your desk', 'Add lemon or mint if plain water is boring'] },
  { id: 'steps-7', title: '10,000 Steps Week', icon: '👟', days: 7, level: 'Medium', from: '#7ED957', to: '#14C8B4',
    blurb: 'Hit 10,000 steps a day for 7 days. Walk after meals, take the stairs and pace during calls.',
    rule: { kind: 'steps', target: 10000, label: '10,000 steps' }, tips: ['A 10-minute walk after each meal adds about 3,000 steps', 'Park farther away', 'Walk and talk on phone calls'] },
  { id: 'move-30', title: '30-Day Move Streak', icon: '🔥', days: 30, level: 'Hard', from: '#FF7A1A', to: '#FF5A7A',
    blurb: 'Do at least 30 minutes of exercise every day for a month. Walk, run, yoga, gym or sports all count.',
    rule: { kind: 'workout', target: 30, label: '30 minutes of exercise' }, tips: ['Schedule it like a meeting', 'Mix easy and hard days', 'Never miss two days in a row'] },
  { id: 'sleep-7', title: '7-Day Sleep Reset', icon: '😴', days: 7, level: 'Easy', from: '#7C5CFF', to: '#2EA8FF',
    blurb: 'Sleep at least 7 hours every night. Good sleep helps weight control, mood and recovery.',
    rule: { kind: 'sleep', target: 7, label: '7+ hours of sleep' }, tips: ['Fixed bedtime, even on weekends', 'No screens for 30 minutes before bed', 'Keep the room cool and dark'] },
  { id: 'protein-14', title: '14-Day Protein Goal', icon: '🥚', days: 14, level: 'Medium', from: '#FFC53D', to: '#FF7A1A',
    blurb: 'Hit your daily protein target for two weeks. Use the protein calculator to find your number.',
    rule: { kind: 'manual', target: 1, label: 'Hit my protein goal today' }, tips: ['Add dal, paneer, eggs, soya or curd to every meal', 'Plan protein first, then fill the plate', 'Roasted chana makes a cheap snack'] },
  { id: 'sugar-7', title: '7-Day Low-Sugar Week', icon: '🍬', days: 7, level: 'Medium', from: '#FF5A7A', to: '#7C5CFF',
    blurb: 'No sugary drinks, sweets or added sugar for a week. Fruit is fine.',
    rule: { kind: 'manual', target: 1, label: 'No added sugar today' }, tips: ['Swap sweet chai for less sugar each day', 'Keep fruit or nuts nearby for cravings', 'Read labels: sugar hides in sauces and biscuits'] },
];
export const getChallenge = (id: string) => CHALLENGES.find(c => c.id === id);
