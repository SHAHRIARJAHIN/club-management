import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import SignInForm from '@/components/auth/SignInForm';
import Head from 'next/head';
import { Database } from '@/types/supabase'; // Add your Database type if available

interface SignInPageProps {
  preferredEmail?: string;
}

export default function SignIn({ preferredEmail }: SignInPageProps) {
  return (
    <>
      <Head>
        <title>Sign In | University Club Management</title>
        <meta name="description" content="Sign in to your University Club Management account" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
        <SignInForm preferredEmail={preferredEmail} />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<SignInPageProps> = async (context) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient<Database>(context);
  
  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    return {
      redirect: {
        destination: context.query.returnUrl?.toString() || '/dashboard',
        permanent: false,
      },
    };
  }

  // Check for email from magic link or OAuth callback
  const preferredEmail = context.query.email?.toString() || null;

  return {
    props: {
      preferredEmail: preferredEmail || null,
    },
  };
};