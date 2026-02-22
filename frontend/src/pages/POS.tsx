import { Loader2, Minus, Package, Plus, Receipt, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCategories, useProducts, useSubmitOrder } from '../lib/queries';
import { useCartStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';

export function POS() {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const cart = useCartStore();
  
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts(activeCategoryId, searchQuery);
  const submitOrderMutation = useSubmitOrder();

  const displayCategories = [
    { id: 'all', name: 'All Dishes', icon: '🍱', color: 'bg-blue-100' },
    ...categories.map(cat => ({
      ...cat,
      icon: cat.name.includes('Drink') ? '🥤' : '🍛',
      color: 'bg-green-100',
    }))
  ];

  const handleCheckout = () => {
    if (cart.items.length === 0) return;
    
    submitOrderMutation.mutate({
      items: cart.items.map(i => ({ 
        product_id: i.product.id, 
        quantity: i.quantity
      })),
      payment_method: 'CASH'
    }, {
      onSuccess: () => {
        toast.success('Order completed successfully!');
        cart.clearCart();
      },
      onError: (err: Error) => {
        toast.error(`Failed to complete order: ${err.message}`);
      }
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      
      {/* Left Menu Area */}
      <div className="flex-1 flex flex-col p-6 pr-4 overflow-hidden">
        
        {/* Search & Categories */}
        <div className="mb-6 space-y-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search product by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-transparent rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
            {isLoadingCategories ? (
              <div className="flex items-center gap-2 text-gray-400 p-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading categories...
              </div>
            ) : (
              displayCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all shadow-sm border ${
                    activeCategoryId === cat.id 
                      ? 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600' 
                      : 'bg-white text-gray-700 border-gray-100 hover:border-primary-200'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-6">
          {isLoadingProducts ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Package className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <button 
                  key={product.id}
                  onClick={() => cart.addItem(product)}
                  className="bg-white rounded-2xl p-3 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-md hover:border-primary-200 transition-all text-left flex flex-col items-center group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary-500/0 group-active:bg-primary-500/10 transition-colors pointer-events-none z-10"></div>
                  
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-[3px] border-gray-50 group-hover:border-primary-100 transition-colors shadow-sm">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <span className="text-xs">No img</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full text-center">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 truncate">{product.name}</h3>
                    <p className="font-bold text-primary-600">{formatCurrency(product.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Ordering Cart */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10 relative">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Current Order</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Order #8821 • Walk-in</p>
          </div>
          <button 
            onClick={cart.clearCart}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Clear Order"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
              <Receipt className="w-12 h-12 text-gray-300" />
              <p className="font-medium">Order is empty</p>
              <p className="text-sm text-gray-400 text-center px-8">Click on products to add them to the current order</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <img src={item.product.image_url} alt={item.product.name} className="w-14 h-14 rounded-xl object-cover" />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</h4>
                  <p className="font-bold text-primary-600 mt-0.5">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>

                <div className="flex flex-col items-center justify-between gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <button 
                    onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:text-primary-600 hover:shadow-sm rounded-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-sm w-7 text-center text-gray-900">{item.quantity}</span>
                  <button 
                    onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-md transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout Panel */}
        <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-20 flex-shrink-0">
          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Tax (8%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center bg-green-50/50 -mx-5 px-5 py-4 mt-2">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-primary-600">{formatCurrency(total)}</span>
            </div>
          </div>
          {/* Checkout Button */}
          <button 
            onClick={handleCheckout}
            disabled={cart.items.length === 0 || submitOrderMutation.isPending}
            className="w-full py-4 mt-6 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {submitOrderMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            Checkout Now
          </button>
        </div>
      </div>
      
    </div>
  );
}
