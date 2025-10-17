import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { isAuthenticated } from '@/lib/auth';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Forgot password submitted for:', email);
      setSubmitted(true);
    } catch (error) {
      console.error('Error requesting password reset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row">

      <div className="w-full md:w-full p-6 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">

          <div className="mb-10">
            <img src="/logo.svg" alt="GoupBroad Logo" className="h-10 w-10" />
          </div>

          {!submitted ? (
            <>
              <h1 className="text-2xl font-semibold mb-2">Reset Password</h1>
              <p className="text-gray-600 mb-8">
                Enter your email address and we&apos;ll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-1/50 focus:border-primary-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full cursor-pointer bg-primary-1 hover:bg-primary-1/90 text-white py-2 rounded-md transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                If an account exists for {email}, you will receive a password reset link shortly.
              </p>
              <Button 
                onClick={() => setSubmitted(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md transition-colors"
              >
                Back to Reset Password
              </Button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/signin" className="text-sm text-primary-1 hover:underline">
              ← Back to Signin
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 bg-gray-900 relative overflow-hidden">
        <img
          src="/auth.png"
          alt="Abstract 3D shapes"
          className="w-full h-screen object-center"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;