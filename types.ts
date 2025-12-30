
export interface ProductOption {
  name: string;
  price?: number; // Preço opcional se for diferente do preço base
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  options?: ProductOption[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  fee: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedOption?: ProductOption;
}

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao';
export type OrderType = 'entrega' | 'retirada';

export interface OrderDetails {
  customerName: string;
  type: OrderType;
  neighborhoodId?: string;
  street?: string;
  number?: string;
  reference?: string;
  address?: string;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  customMessage?: string;
}
