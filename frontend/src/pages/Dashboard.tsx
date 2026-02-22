import { Clock, Loader2, Package, TrendingUp } from 'lucide-react';
import { useDashboardSummary, useSalesReport, useTopProducts } from '../lib/queries';
import { useAuthStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import type { SalesReportData, TopProduct } from '../types';

export function Dashboard() {
  const { user } = useAuthStore();
  const { data: summary, isLoading: isSummaryLoading } = useDashboardSummary();
  const { data: topProducts, isLoading: isTopProductsLoading } = useTopProducts();
  const { data: recentOrdersData, isLoading: isRecentOrdersLoading } = useSalesReport({ limit: 5 });
  
  const recentOrders = recentOrdersData?.data || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.role === 'ADMIN' ? 'Admin' : 'Cashier'}</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your store today.</p>
        </div>
      </div>

      {/* Hero / Alert Banner */}
      {/* {summary?.low_stock_count ? (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 flex items-start gap-4">
          <div className="p-3 bg-orange-100/50 rounded-xl text-orange-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-orange-900 mb-1">Low Stock Alert</h3>
            <p className="text-orange-800/80 text-sm">{summary.low_stock_count} products are running low on inventory. Please restock soon to avoid missing sales.</p>
          </div>
        </div>
      ) : null} */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Today\'s Revenue', value: summary ? formatCurrency(summary.today_revenue) : '...', icon: TrendingUp, trend: '+12.5%', color: 'text-green-600', bg: 'bg-green-100' },
          { title: 'Orders Today', value: summary ? summary.orders_today.toString() : '...', icon: Package, trend: '+5.2%', color: 'text-primary-600', bg: 'bg-primary-100' },
          { title: 'Avg. Order Value', value: summary ? formatCurrency(summary.average_order_value) : '...', icon: TrendingUp, trend: '+2.1%', color: 'text-blue-600', bg: 'bg-blue-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'} bg-green-50 px-2 py-1 rounded-md`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">
                {isSummaryLoading ? <Loader2 className="w-6 h-6 animate-spin text-gray-300" /> : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity / Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {isTopProductsLoading ? (
              <div className="flex py-4 justify-center items-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : topProducts?.length === 0 ? (
              <p className="text-sm text-gray-500">No sales data yet.</p>
            ) : (
              topProducts?.map((product: TopProduct, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">
                      {i+1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{product.product_name}</p>
                      <p className="text-xs text-gray-500">{product.sales_count} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(product.total_revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {isRecentOrdersLoading ? (
              <div className="flex py-4 justify-center items-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No recent orders.</p>
            ) : (
              recentOrders.map((order: SalesReportData, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.order_id.substring(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                       <Clock className="w-3 h-3" />
                       {new Date(order.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {order.cashier_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{formatCurrency(order.total_amount)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase tracking-wider ${
                      order.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
