import { useMutation } from '@tanstack/react-query';
import { Loader2, Store, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/store';
import type { Role, User } from '../types';

interface LoginResponse {
  access_token: string;
  user: User;
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('ADMIN');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // The backend login expects email and password.
  // We'll toggle the default email placeholder based on role strictly for UX,
  // but let the user type custom credentials if needed.
  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: email || (role === 'ADMIN' ? 'admin@example.com' : 'cashier@example.com'),
        password: password || 'password123',
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      toast.success('Welcome back!');
      if (data.user.role === 'CASHIER') {
        navigate('/pos');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary-600">
          <Store className="w-16 h-16" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to POS<span className="text-primary-600">Portfolio</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
            start your 14-day free trial
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* Role Toggle for Demo Purposes */}
          <div className="flex p-1 mb-8 bg-gray-100 rounded-xl">
            <button
              onClick={() => setRole('ADMIN')}
              className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                role === 'ADMIN' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Store className="w-4 h-4" /> Admin
            </button>
            <button
              onClick={() => setRole('CASHIER')}
              className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                role === 'CASHIER' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserCircle className="w-4 h-4" /> Cashier
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder={role === 'ADMIN' ? 'admin@example.com' : 'cashier@example.com'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
              >
                {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign in
              </button>
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p>Demo credentials will be used if left blank.</p>
              <p>Admin: <span className="font-semibold text-gray-700">admin@example.com</span> | <span className="font-semibold text-gray-700">password123</span></p>
              <p>Cashier: <span className="font-semibold text-gray-700">cashier@example.com</span> | <span className="font-semibold text-gray-700">password123</span></p>
              {loginMutation.isError && (
                <p className="mt-2 text-red-600 font-medium">
                  Login failed: {loginMutation.error instanceof Error ? loginMutation.error.message : 'Invalid credentials'}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
