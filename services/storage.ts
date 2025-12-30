
import { Product, Neighborhood, Category } from '../types';
import { INITIAL_PRODUCTS, INITIAL_NEIGHBORHOODS, INITIAL_CATEGORIES, WHATSAPP_NUMBER } from '../constants';

const PRODUCTS_KEY = 'app_products_v8';
const NEIGHBORHOODS_KEY = 'app_neighborhoods_v8';
const CATEGORIES_KEY = 'app_categories_v8';
const WHATSAPP_KEY = 'app_whatsapp_v8';
const ADMIN_PWD_KEY = 'app_admin_pwd_v8';

export const getStoredProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getStoredNeighborhoods = (): Neighborhood[] => {
  const stored = localStorage.getItem(NEIGHBORHOODS_KEY);
  return stored ? JSON.parse(stored) : INITIAL_NEIGHBORHOODS;
};

export const saveNeighborhoods = (neighborhoods: Neighborhood[]) => {
  localStorage.setItem(NEIGHBORHOODS_KEY, JSON.stringify(neighborhoods));
};

export const getStoredCategories = (): Category[] => {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  return stored ? JSON.parse(stored) : INITIAL_CATEGORIES;
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const getStoredWhatsAppNumber = (): string => {
  const stored = localStorage.getItem(WHATSAPP_KEY);
  return stored || WHATSAPP_NUMBER;
};

export const saveWhatsAppNumber = (number: string) => {
  localStorage.setItem(WHATSAPP_KEY, number);
};

export const getStoredAdminPassword = (): string => {
  const stored = localStorage.getItem(ADMIN_PWD_KEY);
  return stored || 'dev123';
};

export const saveAdminPassword = (password: string) => {
  localStorage.setItem(ADMIN_PWD_KEY, password);
};
