import { Clock, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { useSalesReport } from '../lib/queries';
import { formatCurrency } from '../lib/utils';
import type { SalesReportData } from '../types';

export function Reports() {
  const [dateRange, setDateRange] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: reportData, isLoading } = useSalesReport({ 
    date_range: dateRange, 
    search: searchQuery, 
    page, 
    limit: 10 
  });

  const orders = reportData?.data || [];
  const meta = reportData?.meta || { total_results: 0, page: 1, limit: 10 };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-gray-500 mt-1">Detailed breakdown of your store's performance.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {[
              { label: 'Today', value: 'today' },
              { label: '7D', value: '7D' },
              { label: '30D', value: '30D' },
              { label: 'YTD', value: 'YTD' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => {
                  setDateRange(range.value);
                  setPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  dateRange === range.value 
                    ? 'bg-primary-50 text-primary-700 font-bold border-b-2 border-primary-500' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between flex-shrink-0">
        <div className="flex gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by Order ID or Cashier..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cashier</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading report data...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders found for the selected criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order: SalesReportData) => (
                  <tr key={order.order_id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      #{order.order_id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(order.date_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                           {order.cashier_name.charAt(0).toUpperCase()}
                         </div>
                         {order.cashier_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.total_items} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                        order.status === 'COMPLETED' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-white mt-auto">
          <div className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{orders.length > 0 ? ((page - 1) * meta.limit) + 1 : 0}</span> to <span className="font-semibold text-gray-900">{Math.min(page * meta.limit, meta.total_results)}</span> of <span className="font-semibold text-gray-900">{meta.total_results}</span> results
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page * meta.limit >= meta.total_results || isLoading}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
