export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: 'graphic-design' | 'web-ai';
  images: string[];
  externalUrl?: string;
  githubUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  phone: string;
  location: string;
  heroImage?: string;
  aboutImage?: string;
  titleIcon?: string;
}

export interface AdminUser {
  username: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  featured?: boolean;
}
