import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });
  
  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (authError) {
        throw authError;
      }

      // Check if email is verified (if you require email confirmation)
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('Please verify your email before signing in. Check your inbox.');
      }

      // Redirect to dashboard or intended page
      const returnUrl = router.query.returnUrl as string || '/dashboard';
      router.push(returnUrl);
      
    } catch (err: any) {
      // Handle specific Supabase errors
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      if (err.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.message.includes('Email not confirmed')) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign in to your account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('email')}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('password')}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <div className="text-right">
          <Link 
            href="/auth/forgot-password" 
            className="text-blue-500 hover:text-blue-700 text-sm inline-block"
          >
            Forgot your password?
          </Link>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
        
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              href="/auth/signup" 
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

