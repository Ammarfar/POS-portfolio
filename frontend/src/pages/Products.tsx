import { LayoutGrid, List, Loader2, Package, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCategories, useProducts } from '../lib/queries';
import { formatCurrency } from '../lib/utils';

export function Products() {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts(activeCategoryId, searchQuery);

  const displayCategories = [
    { id: 'all', name: 'All Dishes', count: products.length, icon: '🍱', color: 'bg-blue-100' },
    ...categories.map(cat => ({
      ...cat,
      count: products.filter(p => p.category_id === cat.id).length,
      icon: cat.name.includes('Drink') ? '🥤' : '🍛',
      color: 'bg-green-100'
    }))
  ];

  return (
    <div className="flex h-full bg-white">
      {/* Middle Column: Categories */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Dish Category</h2>
        </div>
        <div className="px-4 pb-6 space-y-1">
          {isLoadingCategories ? (
            <div className="flex items-center justify-center p-4 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : (
            displayCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                  activeCategoryId === cat.id
                    ? 'bg-transparent border-2 border-primary-500 shadow-sm'
                    : 'bg-transparent border-2 border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg ${
                    activeCategoryId === cat.id ? 'bg-white shadow-sm' : cat.color
                  }`}>
                    {cat.icon}
                  </div>
                  <span className={`font-semibold ${
                    activeCategoryId === cat.id ? 'text-primary-600' : 'text-gray-700'
                  }`}>
                    {cat.name}
                  </span>
                </div>
                {cat.count > 0 && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    activeCategoryId === cat.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            ))
          )}
          
          <div className="pt-4 mt-2 border-t border-gray-100">
            <button 
              onClick={() => toast.info('Add category feature coming soon!')}
              className="w-full flex items-center justify-center gap-2 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Dish Category
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Products Grid */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
        
        {/* Banner */}
        <div className="p-8 pb-4 flex-shrink-0">
          <div className="bg-[#FFEFE2] rounded-3xl p-8 flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Effortlessly Manage Your Menu!</h1>
              <p className="text-gray-700 font-medium">Quick access to every dish—add, update, and organize your menu with ease.</p>
            </div>
            {/* Banner Deco (Mockup Illustration slot) */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(200, 100, 50, 0.4), transparent 60%)'
            }}></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-8 pb-6 bg-transparent flex items-center justify-between flex-shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Look up any dish you desire..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-1 flex">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {isLoadingProducts ? (
            <div className="h-full flex items-center justify-center text-primary-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              
              {/* Add New Card */}
              <button 
                onClick={() => toast.info('Add product feature coming soon!')}
                className="h-[280px] border-2 border-dashed border-primary-300 bg-primary-50/50 hover:bg-primary-50 rounded-3xl flex flex-col items-center justify-center gap-4 transition-colors group"
              >
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900 text-base">Add New Dish</span>
              </button>

              {products.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 h-[280px] flex flex-col items-center justify-center text-gray-400">
                  <Package className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="font-medium text-lg text-gray-500">No dishes found in this category</p>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="h-[280px] bg-white border border-gray-100 rounded-3xl p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow relative group">
                    {/* Image */}
                    <div className="flex-1 flex justify-center items-center overflow-hidden mb-4 mt-2">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner flex items-center justify-center bg-gray-100">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover object-center" />
                        ) : (
                          <span className="text-gray-400 text-xs">No Image</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="mt-auto px-2">
                      <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
                      <p className="font-extrabold text-xl text-gray-900">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
