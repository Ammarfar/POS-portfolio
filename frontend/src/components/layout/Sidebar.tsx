import clsx from 'clsx';
import {
    BarChart3,
    Home,
    LogOut,
    Package,
    ShoppingCart
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import type { Role } from '../../types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const NAVIGATION: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['ADMIN', 'CASHIER'] },
  { name: 'POS (Order)', href: '/pos', icon: ShoppingCart, roles: ['CASHIER', 'ADMIN'] },
  { name: 'Products', href: '/products', icon: Package, roles: ['ADMIN'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['ADMIN'] },
];



export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 flex flex-col h-screen border-r border-gray-200 bg-white sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-transparent">
        <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-2xl tracking-tighter">
          <span className="text-3xl">🥬</span> POS<span className="text-gray-900">Portfolio</span>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAVIGATION.filter(item => !user || item.roles.includes(user.role)).map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className={clsx("w-5 h-5", isActive ? "text-primary-600" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-2 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          Logout
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.email ? user.email.split('@')[0] : 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
