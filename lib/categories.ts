import { allCategories, type Category } from './db';
export type { Category };
/** Visible categories in the order set in Admin > Categories. */
export const getCategories = () => allCategories().filter(c => c.visible);
export const menuCategories = () => getCategories().filter(c => c.menu);
export const homeCategories = () => getCategories().filter(c => c.home);
/** Any category, including hidden ones (used for badges on existing articles). */
export const getCat = (slug: string) => allCategories().find(c => c.slug === slug);
/** Only categories that are switched on (used for category pages). */
export const getLiveCat = (slug: string) => getCategories().find(c => c.slug === slug);
