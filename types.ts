
export enum OrderStatus {
  PENDING = 'Pendente',
  ACCEPTED = 'Recebido',
  ON_ROUTE = 'Em Rota',
  ARRIVED = 'No Local',
  DELIVERED = 'Entregue',
  CANCELLED = 'Cancelado',
  CLIENT_ABSENT = 'Cliente Ausente'
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tenantId: string;
  customerName: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  address: string; // Maintain full address for display/compatibility
  items: OrderItem[];
  timestamp: string;
  date: string;
  status: OrderStatus;
  driver?: string;
  avatar: string;
  waitTime: string;
  paymentMethod: 'Dinheiro' | 'Pix' | 'Cartão' | 'Carteira';
  interestRate?: number;
  paymentTerm?: 15 | 30;
  deliveryType: 'Entrega' | 'Retirada';
  notes?: string;
  total: number;
  lat?: number;
  lng?: number;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  category: 'Gás' | 'Água' | 'Acessórios';
  icon: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  address: string; // Maintain full address for display/compatibility
  avatar: string;
  orderHistory: string[];
  creditLimit: number;
  totalDebts: number;
}


export interface Vehicle {
  model: string;
  plate: string;
  type: 'Carro';
  currentKM: number;
  startShiftKM: number;
  endShiftKM: number;
  lastOilChangeKM: number;
  nextOilChangeKM: number;
  lastOilChangeDate: string;
  observations?: string;
}

export interface Driver {
  id: string;
  tenantId: string;
  name: string;
  login: string;
  password?: string;
  email: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  distance?: string;
  avatar: string;
  vehicle: Vehicle;
  activeShift?: {
    startTime: string;
    orderCount: number;
    totalEarnings: number;
  };
  lat?: number;
  lng?: number;
}

export interface AdminUser {
  id: string;
  tenantId: string;
  name: string;
  login: string;
  password?: string;
  email: string;
  role: 'admin' | 'operator' | 'supervisor';
  avatar: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  type: 'login' | 'logout';
  timestamp: string;
  date: string;
}

export interface AuthSession {
  user: Driver | AdminUser;
  type: 'admin' | 'driver';
  token: string;
}

export interface WhatsAppNumber {
  id: string;
  number: string;
  label: string;
  status: 'active' | 'inactive';
}

export interface AutoMessage {
  id: 'saudacao' | 'cadastro' | 'pedido' | 'pagamento' | 'endereco' | 'finalizacao' | 'rota';
  text: string;
}

export interface ChatMessage {
  id: string;
  fromNumber: string;
  toNumber: string; // Qual número do escritório recebeu
  text: string;
  type: 'in' | 'out';
  timestamp: string;
}

export interface Tenant {
  id: string; // The Tenant ID used for login
  name: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  status: 'Ativo' | 'Bloqueado';
  adminLogin: string;
  adminPassword: string;
  createdAt: string;
  billingDay: number;
  maxUsers: number;
  logo?: string;
  backupEnabled: boolean;
  storageEnabled: boolean;
  apiEnabled: boolean;
  databaseSize: string;
}

export interface BackupConfig {
  googleDriveConnected: boolean;
}

export type View = 'dashboard' | 'orders' | 'settings' | 'order-detail' | 'driver-panel' | 'drivers' | 'map' | 'clients' | 'inventory' | 'financial' | 'users' | 'whatsapp' | 'super-admin';
