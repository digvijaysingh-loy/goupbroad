import { Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-1 text-gray-300 py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="h-6 w-6 text-primary-1" />
          <span className="text-xl font-bold text-primary-2">Goupbroad</span>
        </div>
        <p className="text-gray-200">
          © {new Date().getFullYear()} Goupbroad. Maintained by{' '}
          <span className="text-primary-2 font-semibold">Goupbroad</span>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;