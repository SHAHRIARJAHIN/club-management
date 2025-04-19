import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import SignUpForm from '@/components/auth/SignUpForm';
import Head from 'next/head';
import { Database } from '@/types/supabase'; // Import your Database type if available

interface SignUpPageProps {
  allowedDomains?: string[];
  invitationToken?: string | null;
}

export default function SignUp({ allowedDomains, invitationToken }: SignUpPageProps) {
  return (
    <>
      <Head>
        <title>Sign Up | University Club Management</title>
        <meta name="description" content="Create your University Club Management account" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
        <SignUpForm 
          allowedDomains={allowedDomains} 
          invitationToken={invitationToken} 
        />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<SignUpPageProps> = async (context) => {
  const supabase = createServerSupabaseClient<Database>(context);
  
  // Check for existing session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    return {
      redirect: {
        destination: context.query.returnUrl?.toString() || '/dashboard',
        permanent: false,
      },
    };
  }

  // Check if registration is open to public or invite-only
  const { data: settings } = await supabase
    .from('settings')
    .select('allow_public_signups, allowed_email_domains')
    .single();

  // If invite-only system, verify the invitation token
  let invitationToken = null;
  if (!settings?.allow_public_signups) {
    invitationToken = context.query.token?.toString() || null;
    if (invitationToken) {
      const { error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', invitationToken)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error) {
        return {
          redirect: {
            destination: '/auth/signin?error=invalid_invitation',
            permanent: false,
          },
        };
      }
    } else {
      return {
        redirect: {
          destination: '/auth/signin?error=invitation_required',
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      allowedDomains: settings?.allowed_email_domains || [],
      invitationToken: invitationToken || null,
    },
  };
};