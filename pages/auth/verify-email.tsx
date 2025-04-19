import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Check for email in query params
  useEffect(() => {
    if (router.query.email) {
      setEmail(router.query.email as string);
    }
  }, [router.query]);

  // Check verification status periodically
  useEffect(() => {
    if (!email) return;

    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setIsVerified(true);
        setTimeout(() => {
          router.push(router.query.returnUrl?.toString() || '/dashboard');
        }, 2000);
      }
    };

    const interval = setInterval(checkVerification, 5000);
    return () => clearInterval(interval);
  }, [email, router]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!email) {
        throw new Error('No email address found');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      // Success notification
      setError('Verification email resent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Verify Email | University Club Management</title>
        <meta name="description" content="Verify your email address to access your University Club Management account" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
          {isVerified ? (
            <>
              <div className="mb-6">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Email Verified!</h2>
              <p className="text-gray-600 mb-6">
                Your email has been successfully verified. Redirecting you to your dashboard...
              </p>
              <div className="flex justify-center">
                <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Check your email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to <span className="font-semibold">{email || 'your email'}</span>. 
                Please check your inbox and click the link to verify your account.
              </p>
              
              {error && (
                <div className={`mb-4 p-3 rounded text-sm ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Sending...
                    </span>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>

                <div className="text-sm text-gray-600">
                  <p>Didn't receive the email?</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Check your spam folder</li>
                    <li>• Make sure you entered the correct email</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Link 
                    href="/auth/signin" 
                    className="text-blue-500 hover:text-blue-700 font-medium"
                  >
                    Return to sign in
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}