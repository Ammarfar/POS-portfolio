import { useMutation, useQuery } from '@tanstack/react-query';
import type { Category, Product } from '../types';
import { api } from './api';

export const useSubmitOrder = () => {
  return useMutation({
    mutationFn: async (orderData: {
      items: { product_id: string; quantity: number }[];
      payment_method: string;
    }) => {
      const response = await api.post('/orders', orderData);
      return response.data;
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<Category[]>('/categories');
      return response.data;
    },
  });
};

export const useProducts = (categoryId?: string, search?: string) => {
  return useQuery({
    queryKey: ['products', { categoryId, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId && categoryId !== 'all') {
        params.append('category_id', categoryId);
      }
      if (search) {
        params.append('search', search);
      }
      const response = await api.get<Product[]>('/products', { params });
      return response.data;
    },
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/summary');
      return data;
    },
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['analytics', 'top-products'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/top-products');
      return data;
    },
  });
};

export const useSalesReport = (params: { date_range?: string; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: async () => {
      const { data } = await api.get('/reports/sales', { params });
      return data;
    },
  });
};
