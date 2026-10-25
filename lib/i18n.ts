export type Lang = 'en' | 'hi';
export const T = {
  en: {
    foodsTitle: 'Protein and calories in Indian foods', foodsH1: 'Indian food protein & calorie database',
    foodsIntro: 'Protein, calories, carbs and fat for everyday Indian foods per serving, with the cost of each serving. Tap a food for its full page.',
    search: 'Search foods…', all: 'All', veg: 'Vegetarian', nonveg: 'Eggs & non-veg', cat: 'Category', food: 'Food', serving: 'Serving', protein: 'Protein', kcal: 'Calories', carbs: 'Carbs', fat: 'Fat', per10: 'Protein per ₹10', cost: 'Cost', none: 'No foods match your search.',
    pprTitle: 'Protein per rupee: cheapest protein foods in India', pprH1: 'Protein per ₹10: the cheapest protein foods',
    pprIntro: 'Grams of protein you get for every ₹10 spent, ranked. Prices are indicative averages and change by city and brand.',
    staples: 'Include everyday staples (roti, rice, oats)', onlyVeg: 'Vegetarian only', share: 'Share on WhatsApp', rank: 'Rank', sort: 'Sort by', g: 'g',
    perServing: 'Per serving', per100: 'Per 100 g', priceNote: 'Prices are indicative estimates', related: 'Similar foods', backAll: '← All foods', calcLink: 'Work out your daily protein target', ppr: 'Protein per ₹10',
    disclaimer: 'General information, not medical advice. Values are approximate and vary by recipe and brand. Check with a doctor or dietitian if you have a health condition.',
    home: 'Home', foods: 'Foods', toolsLink: 'More tools',
  },
  hi: {
    foodsTitle: 'भारतीय खाने में प्रोटीन और कैलोरी', foodsH1: 'भारतीय खाने में प्रोटीन और कैलोरी की तालिका',
    foodsIntro: 'रोज़ के भारतीय खाने में प्रति सर्विंग प्रोटीन, कैलोरी, कार्ब्स और फैट, साथ में हर सर्विंग की लागत। पूरी जानकारी के लिए खाने पर टैप करें।',
    search: 'खाना खोजें…', all: 'सभी', veg: 'शाकाहारी', nonveg: 'अंडा और मांसाहारी', cat: 'श्रेणी', food: 'खाना', serving: 'मात्रा', protein: 'प्रोटीन', kcal: 'कैलोरी', carbs: 'कार्ब्स', fat: 'फैट', per10: '₹10 में प्रोटीन', cost: 'लागत', none: 'कोई खाना नहीं मिला।',
    pprTitle: 'प्रति रुपये प्रोटीन: भारत में सबसे सस्ते प्रोटीन वाले खाने', pprH1: '₹10 में प्रोटीन: सबसे सस्ते प्रोटीन स्रोत',
    pprIntro: 'हर ₹10 खर्च करने पर कितने ग्राम प्रोटीन मिलता है, क्रम से। कीमतें अनुमानित औसत हैं और शहर व ब्रांड के हिसाब से बदलती हैं।',
    staples: 'रोज़ के मुख्य अनाज भी दिखाएं (रोटी, चावल, ओट्स)', onlyVeg: 'सिर्फ़ शाकाहारी', share: 'WhatsApp पर शेयर करें', rank: 'क्रम', sort: 'क्रमबद्ध करें', g: 'ग्राम',
    perServing: 'प्रति सर्विंग', per100: 'प्रति 100 ग्राम', priceNote: 'कीमतें अनुमानित हैं', related: 'मिलते-जुलते खाने', backAll: '← सभी खाने', calcLink: 'अपना रोज़ का प्रोटीन लक्ष्य जानें', ppr: '₹10 में प्रोटीन',
    disclaimer: 'यह सामान्य जानकारी है, चिकित्सकीय सलाह नहीं। मान अनुमानित हैं और रेसिपी व ब्रांड से बदलते हैं। कोई बीमारी हो तो डॉक्टर या डायटीशियन से पूछें।',
    home: 'होम', foods: 'खाने', toolsLink: 'और टूल',
  },
} as const;
export const base = (lang: Lang) => (lang === 'hi' ? '/hi' : '');
