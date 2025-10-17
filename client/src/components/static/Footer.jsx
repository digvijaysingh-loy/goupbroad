
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated, subscribeToAuth } from '@/lib/auth';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    const unsubscribe = subscribeToAuth((authenticated) => {
      setIsLoggedIn(authenticated);
    });

    return () => unsubscribe();
  }, []);
  const buttonText = isLoggedIn ? 'Dashboard'  : 'Get Started';
  const buttonPath = isLoggedIn ? '/dashboard' : '/signin';
  const footerSections = [
    {
      title: 'Services',
      links: [
        {title :'University Finder', href:'/college-finder'},
        {title :'Community', href:'/community'}
        
      ]
    },
    // {
    //   title: 'Resources',
    //   links: [
    //     'Study Abroad Guide',
    //     'Visa Information',
    //     'Country Guides',
    //     'Success Stories',
    //     'Blog'
    //   ]
    // },
    // {
    //   title: 'Support',
    //   links: [
    //     'Help Center',
    //     'Contact Us',
    //     'Live Chat',
    //     'Webinars',
    //     'FAQ'
    //   ]
    // },
    {
      title: 'Company',
      links: [
        {title: 'About Us' , href:'/about'},
        {title: 'Terms & Conditons' , href:'/terms-and-conditions'},
        {title: 'Privacy Policy' , href:'/privacy-policy'}
       
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="flex justify-between items-top max-md:flex-col gap-8 max-md:gap-14 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 w-[400px] max-md:w-full">
            <h3 className="text-2xl font-bold text-white mb-4">GoupBroad</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering students worldwide to achieve their international education dreams 
              through personalized guidance, comprehensive resources, and a supportive community.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-600  text-primary-700  hover:text-primary-800  bg-white"
              >
                <Link to={buttonPath}>{buttonText}</Link>
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-20 max-md:gap-14'>
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href} 
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          </div>
        </div>

        {/* Newsletter Section */}
        {/* <div className="border-t border-gray-800 pt-12 mb-8">
          <div className="text-center">
            <h4 className="text-xl font-semibold text-white mb-4">
              Stay Updated with Latest Opportunities
            </h4>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Get weekly updates on new scholarships, university admissions, and study abroad opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
              <Button className="w-full sm:w-auto bg-primary-700 hover:bg-primary-700 text-white px-6 py-3 rounded-lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div> */}

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} GoupBroad. All rights reserved.
            </div>
            {/* <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Cookie Policy</a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
