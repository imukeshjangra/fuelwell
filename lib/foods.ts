export type Cat = 'pulses' | 'dairy' | 'nonveg' | 'grains' | 'nuts' | 'soy';
export type Diet = 'veg' | 'egg' | 'nonveg';
export type Food = {
  slug: string; name: string; hi: string; cat: Cat; diet: Diet;
  serving: string; hiServing: string; g: number;       // typical serving (as eaten) and its weight in grams
  p: number; k: number; c: number; f: number;           // per 100 g as eaten: protein g, kcal, carbs g, fat g
  buyG: number; price: number;                          // grams you buy per serving, and indicative price in Rs per kg
  staple?: boolean;                                     // everyday carbs (roti, rice, oats) shown separately in protein-per-rupee
};

/**
 * Nutrition values are rounded approximations based on commonly published food-composition data (IFCT 2017 / USDA).
 * Prices are INDICATIVE retail averages in Rs per kg of the item as bought (dry for pulses/atta/rice). Review and update them
 * for your city, then re-deploy. Add a food by adding one line here and it gets its own page automatically.
 */
export const PRICES_NOTE = 'October 2026';
export const FOODS: Food[] = [
  { slug: 'soya-chunks', name: 'Soya chunks', hi: 'सोया चंक्स (सोया बड़ी)', cat: 'soy', diet: 'veg', serving: '30 g dry', hiServing: '30 ग्राम सूखे', g: 30, p: 52, k: 345, c: 33, f: 0.5, buyG: 30, price: 160 },
  { slug: 'moong-dal', name: 'Moong dal (cooked)', hi: 'मूंग दाल (पकी)', cat: 'pulses', diet: 'veg', serving: '1 katori (150 g) cooked', hiServing: '1 कटोरी (150 ग्राम) पकी', g: 150, p: 7, k: 105, c: 19, f: 0.4, buyG: 50, price: 130 },
  { slug: 'toor-dal', name: 'Toor / arhar dal (cooked)', hi: 'तूर / अरहर दाल (पकी)', cat: 'pulses', diet: 'veg', serving: '1 katori (150 g) cooked', hiServing: '1 कटोरी (150 ग्राम) पकी', g: 150, p: 7, k: 118, c: 20, f: 0.5, buyG: 50, price: 160 },
  { slug: 'masoor-dal', name: 'Masoor dal (cooked)', hi: 'मसूर दाल (पकी)', cat: 'pulses', diet: 'veg', serving: '1 katori (150 g) cooked', hiServing: '1 कटोरी (150 ग्राम) पकी', g: 150, p: 9, k: 116, c: 20, f: 0.4, buyG: 50, price: 100 },
  { slug: 'chana-dal', name: 'Chana dal (cooked)', hi: 'चना दाल (पकी)', cat: 'pulses', diet: 'veg', serving: '1 katori (150 g) cooked', hiServing: '1 कटोरी (150 ग्राम) पकी', g: 150, p: 9, k: 164, c: 27, f: 2.5, buyG: 60, price: 100 },
  { slug: 'sabut-moong', name: 'Whole green moong (boiled)', hi: 'साबुत मूंग (उबली)', cat: 'pulses', diet: 'veg', serving: '1 katori (150 g) boiled', hiServing: '1 कटोरी (150 ग्राम) उबली', g: 150, p: 7, k: 105, c: 19, f: 0.4, buyG: 50, price: 120 },
  { slug: 'lobia', name: 'Lobia / black-eyed peas (boiled)', hi: 'लोबिया (उबला)', cat: 'pulses', diet: 'veg', serving: '1 katori (150 g) boiled', hiServing: '1 कटोरी (150 ग्राम) उबला', g: 150, p: 7.7, k: 116, c: 21, f: 0.5, buyG: 55, price: 120 },
  { slug: 'rajma', name: 'Rajma (boiled, no gravy)', hi: 'राजमा (उबला, बिना ग्रेवी)', cat: 'pulses', diet: 'veg', serving: '1 katori (150 g) boiled', hiServing: '1 कटोरी (150 ग्राम) उबला', g: 150, p: 8.7, k: 127, c: 23, f: 0.5, buyG: 60, price: 150 },
  { slug: 'chole', name: 'Chole / kabuli chana (boiled)', hi: 'छोले / काबुली चना (उबला)', cat: 'pulses', diet: 'veg', serving: '1 katori (150 g) boiled', hiServing: '1 कटोरी (150 ग्राम) उबला', g: 150, p: 8.9, k: 164, c: 27, f: 2.6, buyG: 60, price: 130 },
  { slug: 'kala-chana', name: 'Kala chana (boiled)', hi: 'काला चना (उबला)', cat: 'pulses', diet: 'veg', serving: '1 katori (150 g) boiled', hiServing: '1 कटोरी (150 ग्राम) उबला', g: 150, p: 9, k: 160, c: 26, f: 2.7, buyG: 60, price: 100 },
  { slug: 'green-peas', name: 'Green peas / matar (boiled)', hi: 'हरी मटर (उबली)', cat: 'pulses', diet: 'veg', serving: '½ katori (75 g)', hiServing: '½ कटोरी (75 ग्राम)', g: 75, p: 5.4, k: 84, c: 15, f: 0.2, buyG: 75, price: 70 },
  { slug: 'roasted-chana', name: 'Roasted chana (bhuna chana)', hi: 'भुना चना', cat: 'pulses', diet: 'veg', serving: '30 g (a small handful)', hiServing: '30 ग्राम (एक छोटी मुट्ठी)', g: 30, p: 20, k: 365, c: 60, f: 6, buyG: 30, price: 140 },
  { slug: 'besan', name: 'Besan (gram flour)', hi: 'बेसन', cat: 'pulses', diet: 'veg', serving: '30 g dry (about 4 tbsp)', hiServing: '30 ग्राम सूखा (लगभग 4 बड़े चम्मच)', g: 30, p: 22, k: 387, c: 58, f: 6.7, buyG: 30, price: 90 },
  { slug: 'sattu', name: 'Sattu (roasted gram flour)', hi: 'सत्तू', cat: 'pulses', diet: 'veg', serving: '30 g (2 heaped tbsp)', hiServing: '30 ग्राम (2 ढेर चम्मच)', g: 30, p: 20, k: 390, c: 65, f: 6, buyG: 30, price: 110 },
  { slug: 'paneer', name: 'Paneer', hi: 'पनीर', cat: 'dairy', diet: 'veg', serving: '100 g', hiServing: '100 ग्राम', g: 100, p: 18, k: 265, c: 1.2, f: 20, buyG: 100, price: 400 },
  { slug: 'curd', name: 'Curd / dahi', hi: 'दही', cat: 'dairy', diet: 'veg', serving: '1 katori (150 g)', hiServing: '1 कटोरी (150 ग्राम)', g: 150, p: 3.5, k: 60, c: 4.7, f: 3.3, buyG: 150, price: 70 },
  { slug: 'milk', name: 'Milk (toned)', hi: 'दूध (टोन्ड)', cat: 'dairy', diet: 'veg', serving: '1 glass (250 ml)', hiServing: '1 गिलास (250 मि.ली.)', g: 258, p: 3.1, k: 58, c: 4.7, f: 3, buyG: 258, price: 56 },
  { slug: 'egg', name: 'Egg (boiled)', hi: 'अंडा (उबला)', cat: 'nonveg', diet: 'egg', serving: '1 large egg (50 g)', hiServing: '1 बड़ा अंडा (50 ग्राम)', g: 50, p: 12.6, k: 155, c: 1.1, f: 10.6, buyG: 57, price: 115 },
  { slug: 'chicken-breast', name: 'Chicken breast (cooked)', hi: 'चिकन ब्रेस्ट (पका)', cat: 'nonveg', diet: 'nonveg', serving: '100 g cooked', hiServing: '100 ग्राम पका', g: 100, p: 31, k: 165, c: 0, f: 3.6, buyG: 130, price: 260 },
  { slug: 'fish-rohu', name: 'Fish, rohu (cooked)', hi: 'रोहू मछली (पकी)', cat: 'nonveg', diet: 'nonveg', serving: '100 g cooked', hiServing: '100 ग्राम पकी', g: 100, p: 19, k: 125, c: 0, f: 4, buyG: 140, price: 250 },
  { slug: 'tofu', name: 'Tofu', hi: 'टोफू', cat: 'soy', diet: 'veg', serving: '100 g', hiServing: '100 ग्राम', g: 100, p: 8, k: 76, c: 1.9, f: 4.8, buyG: 100, price: 300 },
  { slug: 'whey-protein', name: 'Whey protein powder', hi: 'व्हे प्रोटीन पाउडर', cat: 'soy', diet: 'veg', serving: '1 scoop (30 g)', hiServing: '1 स्कूप (30 ग्राम)', g: 30, p: 80, k: 400, c: 8, f: 6, buyG: 30, price: 2500 },
  { slug: 'peanuts', name: 'Peanuts (roasted)', hi: 'मूंगफली (भुनी)', cat: 'nuts', diet: 'veg', serving: '30 g (a handful)', hiServing: '30 ग्राम (एक मुट्ठी)', g: 30, p: 26, k: 585, c: 21, f: 49, buyG: 30, price: 130 },
  { slug: 'peanut-butter', name: 'Peanut butter', hi: 'पीनट बटर', cat: 'nuts', diet: 'veg', serving: '2 tbsp (32 g)', hiServing: '2 बड़े चम्मच (32 ग्राम)', g: 32, p: 25, k: 588, c: 20, f: 50, buyG: 32, price: 250 },
  { slug: 'almonds', name: 'Almonds', hi: 'बादाम', cat: 'nuts', diet: 'veg', serving: '30 g (about 25 nuts)', hiServing: '30 ग्राम (लगभग 25 बादाम)', g: 30, p: 21, k: 579, c: 22, f: 50, buyG: 30, price: 900 },
  { slug: 'cashews', name: 'Cashews', hi: 'काजू', cat: 'nuts', diet: 'veg', serving: '30 g (about 18 nuts)', hiServing: '30 ग्राम (लगभग 18 काजू)', g: 30, p: 18, k: 553, c: 30, f: 44, buyG: 30, price: 900 },
  { slug: 'sunflower-seeds', name: 'Sunflower seeds', hi: 'सूरजमुखी के बीज', cat: 'nuts', diet: 'veg', serving: '30 g', hiServing: '30 ग्राम', g: 30, p: 21, k: 584, c: 20, f: 51, buyG: 30, price: 350 },
  { slug: 'flax-seeds', name: 'Flax seeds (alsi)', hi: 'अलसी के बीज', cat: 'nuts', diet: 'veg', serving: '1 tbsp (15 g)', hiServing: '1 बड़ा चम्मच (15 ग्राम)', g: 15, p: 18, k: 534, c: 29, f: 42, buyG: 15, price: 200 },
  { slug: 'oats', name: 'Oats', hi: 'ओट्स', cat: 'grains', diet: 'veg', serving: '40 g dry', hiServing: '40 ग्राम सूखे', g: 40, p: 13, k: 389, c: 66, f: 7, buyG: 40, price: 150, staple: true },
  { slug: 'roti', name: 'Roti / chapati (wheat)', hi: 'रोटी / चपाती (गेहूं)', cat: 'grains', diet: 'veg', serving: '1 medium roti (40 g)', hiServing: '1 मध्यम रोटी (40 ग्राम)', g: 40, p: 8.5, k: 264, c: 46, f: 3.7, buyG: 27, price: 45, staple: true },
  { slug: 'rice', name: 'Rice (cooked)', hi: 'चावल (पका)', cat: 'grains', diet: 'veg', serving: '1 katori (150 g) cooked', hiServing: '1 कटोरी (150 ग्राम) पका', g: 150, p: 2.7, k: 130, c: 28, f: 0.3, buyG: 55, price: 55, staple: true },
  { slug: 'bajra-atta', name: 'Bajra flour (pearl millet)', hi: 'बाजरे का आटा', cat: 'grains', diet: 'veg', serving: '40 g flour (1 roti)', hiServing: '40 ग्राम आटा (1 रोटी)', g: 40, p: 11.6, k: 361, c: 67, f: 5, buyG: 40, price: 40, staple: true },
];

export const CATS: Record<Cat, { en: string; hi: string; icon: string }> = {
  pulses: { en: 'Pulses & legumes', hi: 'दालें और फलियाँ', icon: '🫘' },
  dairy: { en: 'Dairy', hi: 'डेयरी', icon: '🥛' },
  nonveg: { en: 'Eggs, chicken & fish', hi: 'अंडा, चिकन और मछली', icon: '🍗' },
  grains: { en: 'Grains & staples', hi: 'अनाज', icon: '🌾' },
  nuts: { en: 'Nuts & seeds', hi: 'मेवे और बीज', icon: '🥜' },
  soy: { en: 'Soy & supplements', hi: 'सोया और सप्लीमेंट', icon: '💪' },
};

export const getFood = (slug: string) => FOODS.find(f => f.slug === slug);
const r1 = (n: number) => Math.round(n * 10) / 10;
/** Nutrition for one serving as eaten. */
export const perServing = (f: Food) => ({ p: r1(f.p * f.g / 100), k: Math.round(f.k * f.g / 100), c: r1(f.c * f.g / 100), f: r1(f.f * f.g / 100) });
/** Rupee cost of one serving. */
export const costOf = (f: Food) => f.buyG / 1000 * f.price;
/** Grams of protein you get for Rs 10 spent. */
export const proteinPer10 = (f: Food) => r1(perServing(f).p / costOf(f) * 10);
export const rupees = (n: number) => n < 10 ? `₹${n.toFixed(1)}` : `₹${Math.round(n)}`;
export const dietLabel = (d: Diet) => (d === 'veg' ? 'Vegetarian' : d === 'egg' ? 'Eggetarian' : 'Non-vegetarian');
