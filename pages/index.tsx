import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import Link from 'next/link';
import { Users, Calendar, CreditCard, BookOpen, ArrowRight } from 'lucide-react';
import { Database } from '@/types/supabase'; // Import your Database type

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Membership Management",
      description: "Easily manage member registrations, approvals, and categorize by membership tiers.",
      color: "blue"
    },
    {
      icon: CreditCard,
      title: "Fee Collection",
      description: "Automate application and monthly fee collection with multiple payment options.",
      color: "green"
    },
    {
      icon: Calendar,
      title: "Event Management",
      description: "Create, schedule, and manage events with RSVPs, tickets, and attendance tracking.",
      color: "yellow"
    },
    {
      icon: BookOpen,
      title: "Reports & Analytics",
      description: "Get insights on membership, finances, and engagement with detailed reports.",
      color: "purple"
    }
  ];

  return (
    <>
      <Head>
        <title>University Club Management System</title>
        <meta name="description" content="Manage your university club efficiently with our all-in-one platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="University Club Management System" />
        <meta property="og:description" content="Streamline your university club operations with our comprehensive management platform" />
        <meta property="og:image" content="/images/og-image.jpg" />
      </Head>

      <main className="overflow-hidden">
        {/* Hero section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-[length:70px_70px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Streamline Your <span className="text-blue-200">University Club</span> Management
                </h1>
                <p className="text-lg md:text-xl mb-8 text-blue-100">
                  The all-in-one platform to handle memberships, payments, events, and communications for your university organization.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/auth/signup"
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center"
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="bg-transparent hover:bg-blue-700 border-2 border-white text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
              <div className="hidden md:block relative">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-1 rounded-xl shadow-2xl border border-white/20">
                  <img
                    src="/images/dashboard-preview.png"
                    alt="Club Management Dashboard Preview"
                    className="rounded-lg shadow-lg"
                    width={600}
                    height={400}
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Everything You Need to Run Your Club</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our comprehensive platform provides all the tools to efficiently manage your university organization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                >
                  <div className={`bg-${feature.color}-100 text-${feature.color}-600 p-3 rounded-full inline-block mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Trusted by University Clubs Worldwide</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Join hundreds of organizations that have streamlined their operations with our platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "This platform revolutionized how we manage our 200+ member club. Everything is so much easier now!",
                  name: "Sarah Johnson",
                  role: "President, Computer Science Club",
                  university: "Stanford University"
                },
                {
                  quote: "The event management features saved us countless hours of paperwork and coordination.",
                  name: "Michael Chen",
                  role: "Treasurer, Debate Society",
                  university: "University of Toronto"
                },
                {
                  quote: "Our membership retention increased by 40% after implementing this system. Highly recommend!",
                  name: "Emma Williams",
                  role: "Secretary, Engineering Society",
                  university: "Imperial College London"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <div className="mb-4">
                    <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-medium text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-gray-500">{testimonial.university}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Club Management?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
              Join hundreds of university organizations that have streamlined their operations with our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/signup"
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center"
              >
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="bg-transparent hover:bg-blue-700 border-2 border-white text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                Request a Demo
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">University Club Management</h3>
              <p className="text-gray-400 mb-4">
                The all-in-one platform for managing university clubs and organizations.
              </p>
              <p className="text-gray-400">© {new Date().getFullYear()} All rights reserved</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="text-gray-400 hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/updates" className="text-gray-400 hover:text-white transition-colors">Updates</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>Made with ❤️ for university organizations worldwide</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient<Database>(context);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
};