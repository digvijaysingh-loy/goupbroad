import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '@/services/api.services';
import { setAuth, isAuthenticated, getUser, clearAuth } from '@/lib/auth';
import logo from '../../assets/logo.svg';
import { toast } from 'sonner'; // 1. Import the toast function

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Clear any previous session data on component mount
    clearAuth();
  }, []);

  // This effect handles messages passed via state or URL parameters
  useEffect(() => {
    let urlWasCleaned = false;

    // Handle success messages from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clean the state from history
      window.history.replaceState({}, document.title);
    }

    // 2. Check for 'expired' or 'error' parameters in the URL
    const tokenExpired = searchParams.get('expired');
    const authError = searchParams.get('error');

    if (tokenExpired === 'true') {
       setTimeout(() => {
    toast.error('Your session has expired. Please sign in again.');
  }, 0);
      urlWasCleaned = true;
    }
    
    if (authError) {
      // 3. Display the error from the URL as a toast
       setTimeout(() => {
    toast.error(decodeURIComponent(authError));
  }, 0);
      urlWasCleaned = true;
    }
    
    // 4. If we showed a toast from a URL param, clean the URL
    if (urlWasCleaned) {
      navigate('/signin', { replace: true });
    }
    
  }, [location.state, searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setIsLoading(true);
    
    try {
      const userData = { email, password };
      const response = await loginUser(userData);
      
      if (response.success) {
        setAuth({
          accessToken: response.data.accessToken,
          user: response.data.user
        });
        
        const userRole = response.data.user.role;
        
        if (userRole === 'ADMIN' || userRole === 'EDITOR' || userRole === 'VIEWER') {
          navigate('/admin/dashboard');
        } else {
          if (!response.data.user.isFeePaid || !response.data.user.isVerified) {
            navigate('/pricing', { state: { fromAuth: true, user: response.data.user } });
          } else {
            const redirectPath = location.state?.from || '/dashboard';
            navigate(redirectPath);
          }
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Invalid email or password. Please try again.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="goupbroadlogo" className='w-[50px] h-[50px] '/>
              <h1 className="text-3xl font-bold text-primary-700">GoupBroad</h1>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                Welcome Back to Your
                <span className="text-primary-700 block">Study Journey</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Continue exploring thousands of universities worldwide and connect with a global community of students pursuing their dreams.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary-700">10,000+</div>
              <div className="text-sm text-gray-600">Universities</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary-700">50+</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary-700">100k+</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary-700">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="space-y-2 text-center">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-primary">StudyAbroad</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Sign In</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
                  {successMessage}
                </div>
              )}
              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {apiError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (apiError) setApiError('');
                      }}
                      className="pl-10 h-12 border-gray-200 focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (apiError) setApiError('');
                      }}
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked)}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-600 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary-800 cursor-pointer text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => window.location.href = `${import.meta.env.VITE_SERVER_URL}/v1/auth/google`}
                  type="button"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="text-primary hover:text-primary-600 font-medium">
                    Sign up here
                  </Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignIn;