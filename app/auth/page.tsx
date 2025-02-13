'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LucideNotebook } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (isLogin) {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/notebooks');
      }
    } else {
      const username = formData.get('username') as string;
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Registration failed');
        }

        // Login after successful registration
        await signIn('credentials', {
          email,
          password,
          callbackUrl: '/notebooks',
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isLogin ? 'Sign in' : 'Register'}
              </button>
            </div>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:text-primary/90"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
        <div className="max-w-lg px-8">
          <div className="text-center">
            <LucideNotebook className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Collaborative Notebook
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Create, organize, and collaborate on notes and sketches in one place. Join our community of creative minds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
