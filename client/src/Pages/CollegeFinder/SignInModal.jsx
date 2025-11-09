// src/components/questionnaire/SignInModal.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '@/services/api.services';
import { toast } from 'sonner';

const SignInModal = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setIsLoading(true);
    
    try {
      const userData = { email, password };
      const response = await loginUser(userData);
      console.log('Login response:', response); // Debug log
      
      if (response.success) {
        // Handle wrapped response: response.data = { accessToken, user }
        const { accessToken, user } = response.data;
        if (accessToken && user) {
          onSuccess(accessToken, user);
          toast.success('Welcome back!');
        } else {
          // Fallback if structure differs
          const fallbackToken = response.data?.accessToken || response.accessToken;
          const fallbackUser = response.data?.user || response.user;
          if (fallbackToken && fallbackUser) {
            onSuccess(fallbackToken, fallbackUser);
            toast.success('Welcome back!');
          } else {
            throw new Error('Invalid response structure');
          }
        }
      } else {
        const errorMessage = response.error || 'Invalid email or password. Please try again.';
        setApiError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Invalid email or password. Please try again.';
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {apiError}
        </div>
      )}
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
      </div>
      <Button
        type="submit"
        className="w-full h-12 bg-primary-800 text-white font-semibold"
        disabled={isLoading}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default SignInModal;