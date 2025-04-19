import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Layout from '@/components/ui/Layout';
import { supabase } from '@/lib/supabase/client';
import { Bell, CreditCard, Calendar, User, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/types/supabase'; // Import your Database type
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  membership_status: 'active' | 'pending' | 'expired' | 'rejected';
  membership_tier?: string;
  photo_url?: string;
  valid_until?: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user profile
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('No authenticated user');

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);

        // Get upcoming events (limit to 3)
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, name, date, time, location')
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(3);
        
        if (eventsError) throw eventsError;
        setEvents(eventsData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const menuItems = [
    { icon: User, label: 'My Profile', href: '/profile', color: 'bg-blue-100 text-blue-600' },
    { icon: Users, label: 'Membership', href: '/membership', color: 'bg-green-100 text-green-600' },
    { icon: CreditCard, label: 'Payments', href: '/payments', color: 'bg-purple-100 text-purple-600' },
    { icon: Calendar, label: 'Events', href: '/events', color: 'bg-yellow-100 text-yellow-600' },
    { icon: Bell, label: 'Notifications', href: '/notifications', color: 'bg-red-100 text-red-600' },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'bg-gray-100 text-gray-600' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout title="Dashboard | University Club Management">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-gray-600">Loading your dashboard...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center">
                {profile?.photo_url && (
                  <img 
                    src={profile.photo_url} 
                    alt="Profile" 
                    className="h-16 w-16 rounded-full object-cover mr-4"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Welcome, {profile?.full_name || 'Member'}</h1>
                  <div className="mt-2 flex items-center flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile?.membership_status === 'active' ? 'bg-green-100 text-green-800' : 
                      profile?.membership_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {profile?.membership_status === 'active' ? 'Active' : 
                       profile?.membership_status === 'pending' ? 'Pending Approval' : 
                       'Membership Issue'}
                    </span>
                    {profile?.membership_tier && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {profile.membership_tier} Tier
                      </span>
                    )}
                    {profile?.valid_until && profile.membership_status === 'active' && (
                      <span className="text-xs text-gray-500">
                        Valid until: {formatDate(profile.valid_until)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link 
                    href={item.href} 
                    key={index}
                    className="group flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className={`${item.color} p-3 rounded-full mr-4 group-hover:opacity-90`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{item.label}</h3>
                      <p className="mt-1 text-sm text-gray-500">Manage your {item.label.toLowerCase()}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {profile?.membership_status === 'pending' && (
              <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Your membership application is being reviewed</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Our administrators are reviewing your application. You'll receive an email notification once it's processed.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Upcoming Events</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {events.length > 0 ? (
                  events.map((event) => (
                    <li key={event.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">{event.name}</p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Upcoming
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              {formatDate(event.date)} at {event.time}
                            </p>
                            {event.location && (
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {event.location}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <Link href={`/events/${event.id}`} className="text-blue-600 hover:text-blue-800">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>
                    <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
                      No upcoming events scheduled
                    </div>
                  </li>
                )}
              </ul>
              {events.length > 0 && (
                <div className="px-4 py-4 sm:px-6 bg-gray-50 text-right">
                  <Link href="/events" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    View all events →
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient<Database>(context);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?returnUrl=/dashboard',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
};