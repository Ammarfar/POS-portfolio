export type Role = 'ADMIN' | 'CASHIER';

export interface User {
  id: string;
  tenant_id: string;
  role: Role;
  email: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  price: number;
  stock: number;
  category_id: string;
  image_url?: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DashboardSummary {
  today_revenue: number;
  orders_today: number;
  average_order_value: number;
  low_stock_count: number;
}

export interface TopProduct {
  product_name: string;
  sales_count: number;
  total_revenue: number;
}

export interface SalesReportData {
  order_id: string;
  date_time: string;
  cashier_name: string;
  total_items: number;
  total_amount: number;
  status: string;
}

export interface SalesReportResponse {
  data: SalesReportData[];
  meta: {
    total_results: number;
    page: number;
    limit: number;
  };
}
