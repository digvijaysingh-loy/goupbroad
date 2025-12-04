// src/components/questionnaire/SignUpModal.jsx
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff, RefreshCw, Edit2 } from 'lucide-react';
import OTPInput from 'react-otp-input';
import { sendEmailOtp, registerUser } from '@/services/api.services';
import { toast } from 'sonner';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const SignUpModal = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

  // Countdown effect
  useEffect(() => {
    if (otpSent && !editingEmail) {
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCountdown(30);
    }
  }, [otpSent, editingEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleResendOtp = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setOtpError('');
    const result = await sendEmailOtp(formData.email);
    setIsLoading(false);
    if (result.success) {
      toast.success('OTP resent successfully');
      setOtp('');
      setCountdown(30);
    } else {
      setOtpError(result.error);
    }
  };

  const handleEditEmail = () => {
    setEditingEmail(true);
    setOtpSent(false);
    setOtpError('');
    setOtp('');
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    setTermsAccepted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPasswordError('');
    setOtpError('');
    setApiError('');

    if (!otpSent) {
      // Step 1: Validate and send OTP
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }

      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setPasswordError('Password must be at least 8 characters with a number and a special character');
        return;
      }
      if (!termsAccepted) {
        toast.error('You must agree to the Terms of Service and Privacy Policy');
        return;
      }

      try {
        setIsLoading(true);
        const result = await sendEmailOtp(formData.email);
        if (result.success) {
          setOtpSent(true);
          setEditingEmail(false);
          toast.success('OTP sent to your email');
        } else {
          setApiError(result.error);
        }
      } catch (error) {
        setApiError('Failed to send OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Step 2: Validate OTP and register
      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        setOtpError('Please enter a valid 6-digit OTP');
        return;
      }

      try {
        setIsLoading(true);
        const userData = {
          email: formData.email,
          password: formData.password,
          otp: otp,
        };

        const registerResult = await registerUser(userData);
        if (registerResult.success && registerResult.data?.data?.accessToken) {
          onSuccess(registerResult.data.data.accessToken, registerResult.data.data.user);
          toast.success('Account created successfully!');
        } else {
          setApiError(registerResult.error);
        }
      } catch (error) {
        console.error('Signup failed:', error);
        if (error.response && error.response.data) {
          setApiError(error.response?.data?.message || 'Signup failed. Please try again.');
        } else {
          setApiError('Network error. Please check your connection and try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse?.credential;
      if (!googleToken) {
        toast.error('Missing Google token');
        return;
      }

      setIsLoading(true);
      setApiError('');

      const userData = { google_credential: googleToken };
      const registerResult = await registerUser(userData);
      if (registerResult.success && registerResult.data?.data?.accessToken) {
        onSuccess(registerResult.data.data.accessToken, registerResult.data.data.user);
        toast.success('Account created successfully!');
      } else {
        setApiError(registerResult.error);
      }
    } catch (error) {
      console.error('Google signup failed:', error);
      if (error.response && error.response.data) {
        setApiError(error.response?.data?.message || 'Google signup failed. Please try again.');
      } else {
        setApiError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.error('Google signup was cancelled');
  };

  const isResendDisabled = isLoading || countdown > 0;

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
              required
              disabled={otpSent && !editingEmail}
            />
          </div>
        </div>

        {/* Password Field */}
        {!otpSent || editingEmail ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
                  required
                  disabled={otpSent && !editingEmail}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={otpSent && !editingEmail}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters with a number and a special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={setTermsAccepted}
              />
              <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
          </>
        ) : null}

        {/* OTP Field */}
        {otpSent && !editingEmail ? (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Verification Code
            </Label>
            <div className="flex justify-center mb-4 w-full overflow-x-auto px-4">
              <OTPInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                inputStyle={{
                  width: '2.5rem',
                  height: '3rem',
                  margin: '0 0.25rem',
                  fontSize: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  outline: 'none',
                  minWidth: '2.5rem',
                }}
                inputType="tel"
                containerStyle={{ justifyContent: 'center', minWidth: 'max-content' }}
                inputMode="numeric"
                renderInput={(props) => <input {...props} />}
              />
            </div>
            {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}
          </div>
        ) : null}

        {/* Edit Email and Resend OTP Buttons */}
        {otpSent && !editingEmail ? (
          <div className="flex justify-between items-center space-x-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 justify-start h-10 px-2 text-primary hover:bg-primary/5"
              onClick={handleEditEmail}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Email
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-10"
              onClick={handleResendOtp}
              disabled={isResendDisabled}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : isResendDisabled ? (
                `Resend in ${countdown}s`
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend OTP
                </>
              )}
            </Button>
          </div>
        ) : null}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-primary-800 text-white font-semibold"
          disabled={isLoading}
        >
          {isLoading 
            ? (otpSent ? 'Verifying...' : 'Sending OTP...') 
            : (otpSent ? 'Verify & Create Account' : 'Continue')
          }
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or sign up with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            ux_mode="popup"
            shape="rectangular"
            text="signup_with"
            size="large"
            theme="outline"
            width="100%"
            disabled={isLoading}
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default SignUpModal;