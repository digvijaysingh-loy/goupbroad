import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { isAuthenticated, subscribeToAuth, logout } from '@/lib/auth';
import logo from '../../../assets/logo.svg';

const Navigation = () => {
  const navigate = useNavigate(); // renamed from navigator for consistency
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());

    const unsubscribe = subscribeToAuth((authenticated) => {
      setIsLoggedIn(authenticated);
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { name: 'University Finder', href: '/university-finder' },
    { name: 'CGPA To GPA', href: '/cgp-to-gpa-converter' },
    { name: 'About', href: '/about' },
    { name: 'Plans & Pricing', href: '/pricing' },
  ];

  const isPricingPage = location.pathname === '/pricing';

  // ---------- Primary Button Logic ----------
  let primaryText = isLoggedIn ? 'Dashboard' : 'Get Started';
  let primaryPath = isLoggedIn ? '/dashboard' : '/signup';
  let primaryOnClick = undefined;

  // Special case: Pricing page + logged in → Logout button
  if (isPricingPage && isLoggedIn) {
    primaryText = 'Logout';
    primaryPath = '#';
    primaryOnClick = () => {
      logout();
      navigate('/');
    };
  }

  // ------------------------------------------

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex items-center justify-center gap-2">
              <img src={logo} alt="Goupbroad logo" className="w-[50px] h-[50px]" />
              <h1 className="text-3xl font-bold text-[#145044]">Goupbroad</h1>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) =>
                item.href.startsWith('/') ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-700 hover:bg-primary-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:bg-primary-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                  >
                    {item.name}
                  </a>
                )
              )}
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Primary Button */}
                {/* Login Button - Shown everywhere if not logged in */}
            {!isLoggedIn && (
              <Link to="/signin">
                <Button
                  variant="outline"
                  className="border-primary-700 text-primary-700 cursor-pointer  "
                >
                  Sign In
                </Button>
              </Link>
            )}
            {primaryOnClick ? (
              <Button
                onClick={primaryOnClick}
                className="bg-primary-700 text-white hover:bg-primary-800 cursor-pointer"
              >
                {primaryText}
              </Button>
            ) : (
              <Link to={primaryPath}>
                <Button className="bg-primary-700 text-white hover:bg-primary-800 cursor-pointer">
                  {primaryText}
                </Button>
              </Link>
            )}

        
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navItems.map((item) =>
                item.href.startsWith('/') ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-700 hover:bg-primary-700 hover:text-white block px-4 py-3 rounded-md text-base font-medium transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:bg-primary-700 hover:text-white block px-4 py-3 rounded-md text-base font-medium transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              )}

              {/* Mobile CTA Buttons */}
              <div className="pt-4 space-y-3">
                {/* Primary Action */}
                  {/* Login Button in Mobile - Always if not logged in */}
                {!isLoggedIn && (
                  <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-primary-700 mb-2 text-primary-700 ">
                      Sign In
                    </Button>
                  </Link>
                )}
                {primaryOnClick ? (
                  <Button
                    onClick={() => {
                      primaryOnClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-primary-700 text-white"
                  >
                    {primaryText}
                  </Button>
                ) : (
                  <Link to={primaryPath} onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-primary-700 text-white">
                      {primaryText}
                    </Button>
                  </Link>
                )}

              
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;