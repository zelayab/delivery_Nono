export interface RouterType {
  push: (url: string) => void;
  refresh: () => void;
  replace: (url: string) => void;
  back: () => void;
  forward: () => void;
  prefetch: (url: string) => Promise<void>;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  description: string;
}

export interface Promotion {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  description: string;
}

export interface Coupon {
  id: string;
  discount: number;
  isActive: boolean;
  expiresAt: number;
  name: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  description: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  deliveryId: string;
  items: CartItem[];
  total: number;
  status: 'pendiente' | 'confirmado' | 'entregado' | 'cancelado' | 'rechazado' | 'en camino';
  userId: string;
  createdAt: number;
  discount: number;
  address: string;
  comments?: string;
}

export interface EditingItem {
  type: string;
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  description: string;
}

export interface EditingCoupon extends Coupon {
  type: string;
}
export interface FirebaseUser {
  role: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  uid: string;
}

export type Item = MenuItem | Coupon | Promotion;