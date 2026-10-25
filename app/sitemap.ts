import { livePosts, allTags } from '@/lib/db';
import { getCategories } from '@/lib/categories';
import { FOODS } from '@/lib/foods';
export const dynamic = 'force-dynamic';
export default function sitemap() {
  const b = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const posts = livePosts();
  const last = posts[0] ? new Date(posts[0].created.replace(' ', 'T') + 'Z') : new Date();
  return [
    { url: b, lastModified: last, changeFrequency: 'daily' as const, priority: 1 },
    { url: `${b}/blog`, lastModified: last, changeFrequency: 'daily' as const, priority: 0.8 },
    ...['about', 'contact', 'protein-calculator', 'privacy', 'terms', 'disclaimer'].map(s => ({ url: `${b}/${s}`, priority: s === 'protein-calculator' ? 0.9 : 0.3 })),
    ...['tools', 'diet-plan', 'challenges', 'foods', 'protein-per-rupee', 'meal-plan', 'tracker', 'tools/calorie-calculator', 'tools/bmi-calculator', 'tools/water-intake-calculator', 'tools/weight-goal-planner', 'hi', 'hi/foods', 'hi/protein-per-rupee'].map(s => ({ url: `${b}/${s}`, priority: ['foods', 'protein-per-rupee', 'diet-plan', 'challenges'].includes(s) ? 0.9 : 0.7, changeFrequency: 'monthly' as const })),
    ...FOODS.flatMap(f => [`${b}/foods/${f.slug}`, `${b}/hi/foods/${f.slug}`].map(url => ({ url, priority: 0.7, changeFrequency: 'monthly' as const }))),
    ...getCategories().map(c => ({ url: `${b}/category/${c.slug}`, lastModified: last, changeFrequency: 'daily' as const, priority: 0.7 })),
    ...allTags().map(t => ({ url: `${b}/tag/${t.slug}`, changeFrequency: 'weekly' as const, priority: 0.4 })),
    ...posts.map(p => ({ url: `${b}/blog/${p.slug}`, lastModified: new Date((p.updated || p.created).replace(' ', 'T') + 'Z'), changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
}
