// components/ui/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">
              &copy; {currentYear} University Club Management System
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/about" className="text-gray-600 hover:text-blue-600">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600">
              Contact
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}