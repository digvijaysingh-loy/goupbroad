// import { useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import { GraduationCap, Mail, Lock, Eye, EyeOff, RefreshCw, Edit2 } from 'lucide-react';
// import OTPInput from 'react-otp-input';
// import { sendEmailOtp, registerUser } from '@/services/api.services';
// import { setAuth, isAuthenticated } from '@/lib/auth';
// import logo from '../../assets/logo.svg'
// import { toast } from 'sonner';

// const SignUp = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [passwordError, setPasswordError] = useState('');
//   const [otpError, setOtpError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiError, setApiError] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [editingEmail, setEditingEmail] = useState(false);
//   const [countdown, setCountdown] = useState(30);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: '',
//   });
//   const [otp, setOtp] = useState('');
//   const [termsAccepted, setTermsAccepted] = useState(false);

//   useEffect(() => {
//     if (isAuthenticated()) {
//       navigate('/dashboard');
//     }
//   }, [navigate]);

//   useEffect(() => {
//     if (otpSent && !editingEmail) {
//       setCountdown(30);
//       const timer = setInterval(() => {
//         setCountdown((prev) => {
//           if (prev <= 1) {
//             clearInterval(timer);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//       return () => clearInterval(timer);
//     } else {
//       setCountdown(30);
//     }
//   }, [otpSent, editingEmail]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (name === 'password' || name === 'confirmPassword') {
//       setPasswordError('');
//     }
//     if (apiError) {
//       setApiError('');
//     }
//   };

//   const handleResendOtp = async () => {
//     if (isLoading) return;
//     setIsLoading(true);
//     setOtpError('');
//     const result = await sendEmailOtp(formData.email);
//     setIsLoading(false);
//     if (result.success) {
//       toast.success('OTP resent successfully');
//       setOtp('');
//       // Restart countdown
//       setCountdown(30);
//     } else {
//       setOtpError(result.error);
//     }
//   };

//   const handleEditEmail = () => {
//     setEditingEmail(true);
//     setOtpSent(false);
//     setOtpError('');
//     setOtp('');
//     setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
//     setTermsAccepted(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setPasswordError('');
//     setOtpError('');
//     setApiError('');

//     if (!otpSent) {
//       // Step 1: Validate and send OTP
//       if (formData.password !== formData.confirmPassword) {
//         setPasswordError('Passwords do not match');
//         return;
//       }

//       const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
//       if (!passwordRegex.test(formData.password)) {
//         setPasswordError('Password must be at least 8 characters with a number and a special character');
//         return;
//       }
//       if (!termsAccepted) {
//         toast.error('You must agree to the Terms of Service and Privacy Policy');
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const result = await sendEmailOtp(formData.email);
//         if (result.success) {
//           setOtpSent(true);
//           setEditingEmail(false);
//           toast.success('OTP sent to your email');
//         } else {
//           setApiError(result.error);
//         }
//       } catch (error) {
//         setApiError('Failed to send OTP. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     } else {
//       // Step 2: Validate OTP and register
//       if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
//         setOtpError('Please enter a valid 6-digit OTP');
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const userData = {
//           email: formData.email,
//           password: formData.password,
//           otp: otp,
//         };

//         const registerResult = await registerUser(userData);
//         console.log(registerResult)
//         if (registerResult.success) {
//           // Auto-login using register response
//           setAuth({
//             accessToken: registerResult?.data?.data?.accessToken,
//             user: registerResult?.data?.data?.user
//           });

//           const userRole = registerResult?.data?.data?.user?.role;

//           if (userRole === 'ADMIN' || userRole === 'EDITOR' || userRole === 'VIEWER') {
//             navigate('/admin/dashboard');
//           } else {
//             if (!registerResult?.data?.data?.user?.isFeePaid || !registerResult?.data?.data?.user?.isVerified) {
//               navigate('/pricing', { state: { fromAuth: true, user: registerResult?.data?.data?.user } });
//             } else {
//               const redirectPath = location.state?.from || '/dashboard';
//               navigate(redirectPath);
//             }
//           }
//         } else {
//           setApiError(registerResult.error);
//         }
//       } catch (error) {
//         console.error('Signup failed:', error);
//         if (error.response && error.response.data) {
//           setApiError(error.response?.data?.message || 'Signup failed. Please try again.');
//         } else {
//           setApiError('Network error. Please check your connection and try again.');
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const isResendDisabled = isLoading || countdown > 0;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
//         {/* Left Side - Branding & Info */}
//         <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
//           <div className="space-y-6">
//             <div className="flex items-center space-x-3">
//               <img src={logo} alt="Goupbroadlogo" className='w-[50px] h-[50px] ' />
//               <h1 className="text-3xl font-bold text-primary-700">Goupbroad</h1>
//             </div>

//             <div className="space-y-4">
//               <h2 className="text-4xl font-bold text-gray-800 leading-tight">
//                 Begin Your
//                 <span className="text-primary-700 block">Global Education Journey</span>
//               </h2>
//               <p className="text-lg text-gray-600 leading-relaxed">
//                 Join thousands of students worldwide who have found their perfect university match and started their international education adventure.
//               </p>
//             </div>
//           </div>

//           {/* Features */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="bg-white p-4 rounded-lg shadow-sm">
//               <div className="text-2xl font-bold text-primary-700">10,000+</div>
//               <div className="text-sm text-gray-600">Universities</div>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm">
//               <div className="text-2xl font-bold text-primary-700">50+</div>
//               <div className="text-sm text-gray-600">Countries</div>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm">
//               <div className="text-2xl font-bold text-primary-700">100k+</div>
//               <div className="text-sm text-gray-600">Students</div>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm">
//               <div className="text-2xl font-bold text-primary-700">24/7</div>
//               <div className="text-sm text-gray-600">Support</div>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Sign Up Form */}
//         <div className="flex items-center justify-center">
//           <Card className="w-full max-w-md shadow-2xl border-0">
//             <CardHeader className="space-y-2 text-center">
//               <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
//                 <div className="bg-primary p-2 rounded-lg">
//                   <GraduationCap className="h-6 w-6 text-white" />
//                 </div>
//                 <span className="text-xl font-bold text-primary">StudyAbroad</span>
//               </div>
//               <CardTitle className="text-2xl font-bold text-gray-800">
//                 {otpSent && !editingEmail ? 'Verify OTP' : 'Create Account'}
//               </CardTitle>
//               <CardDescription className="text-gray-600">
//                 {otpSent && !editingEmail
//                   ? 'Enter the 6-digit code sent to your email'
//                   : 'Enter your details to create your account'
//                 }
//               </CardDescription>
//             </CardHeader>

//             <CardContent className="space-y-6">
//               {apiError && (
//                 <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
//                   {apiError}
//                 </div>
//               )}

//               <form onSubmit={handleSubmit} className="space-y-4">
//                 {/* Email Field */}
//                 <div className="space-y-2">
//                   <Label htmlFor="email" className="text-sm font-medium text-gray-700">
//                     Email Address
//                   </Label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="email"
//                       name="email"
//                       type="email"
//                       placeholder="Enter your email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       className="pl-10 h-12 border-gray-200 focus:border-primary"
//                       required
//                       disabled={otpSent && !editingEmail}
//                     />
//                   </div>
//                 </div>

//                 {/* Password Field - Disabled after OTP sent unless editing */}
//                 <div className="space-y-2">
//                   <Label htmlFor="password" className="text-sm font-medium text-gray-700">
//                     Password
//                   </Label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="password"
//                       name="password"
//                       type={showPassword ? 'text' : 'password'}
//                       placeholder="Create a password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
//                       required
//                       disabled={otpSent && !editingEmail}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                       disabled={otpSent && !editingEmail}
//                     >
//                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                     </button>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     Password must be at least 8 characters with a number and a special character
//                   </p>
//                 </div>

//                 {/* Confirm Password Field - Only show if not otpSent or editing */}
//                 {!otpSent || editingEmail ? (
//                   <div className="space-y-2">
//                     <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
//                       Confirm Password
//                     </Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                       <Input
//                         id="confirmPassword"
//                         name="confirmPassword"
//                         type={showConfirmPassword ? 'text' : 'password'}
//                         placeholder="Confirm your password"
//                         value={formData.confirmPassword}
//                         onChange={handleChange}
//                         className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary"
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                       >
//                         {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                       </button>
//                     </div>
//                     {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
//                   </div>
//                 ) : null}

//                 {/* OTP Field - Only show if otpSent and not editing */}
//                 {otpSent && !editingEmail ? (
//                   <div className="space-y-2">
//                     <Label className="text-sm font-medium text-gray-700">
//                       Verification Code
//                     </Label>
//                     <div className="flex justify-center mb-4">
//                       <OTPInput
//                         value={otp}
//                         onChange={setOtp}
//                         numInputs={6}
//                         inputStyle={{
//                           width: '3rem',
//                           height: '3rem',
//                           margin: '0 0.5rem',
//                           fontSize: '1.25rem',
//                           border: '2px solid #e5e7eb',
//                           borderRadius: '0.5rem',
//                           textAlign: 'center',
//                           outline: 'none',
//                         }}
//                         inputType="text"
//                         containerStyle={{ justifyContent: 'center' }}
//                         inputMode="numeric"
//                         renderInput={(props) => <input {...props} />}
//                       />
//                     </div>
//                     {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}
//                   </div>
//                 ) : null}

//                 {/* Terms and Conditions - Only show if not otpSent or editing */}
//                 {!otpSent || editingEmail ? (
//                   <div className="flex items-start space-x-2">
//                     <Checkbox
//                       id="terms"
//                       checked={termsAccepted}
//                       onCheckedChange={setTermsAccepted}
//                     />
//                     <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
//                       I agree to the <Link to="#" className="text-primary hover:underline">Terms of Service</Link> and <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
//                     </Label>
//                   </div>
//                 ) : null}

//                 {/* Edit Email and Resend OTP Buttons - Side by side if otpSent and not editing */}
//                 {otpSent && !editingEmail ? (
//                   <div className="flex justify-between items-center space-x-4">
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       className="flex-1 justify-start h-10 px-2 text-primary hover:bg-primary/5 cursor-pointer"
//                       onClick={handleEditEmail}
//                     >
//                       <Edit2 className="h-4 w-4 mr-2" />
//                       Edit Email
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       className="flex-1 h-10 cursor-pointer"
//                       onClick={handleResendOtp}
//                       disabled={isResendDisabled}
//                     >
//                       {isLoading ? (
//                         <>
//                           <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//                           Sending...
//                         </>
//                       ) : isResendDisabled ? (
//                         `Resend in ${countdown}s`
//                       ) : (
//                         <>
//                           <RefreshCw className="h-4 w-4 mr-2" />
//                           Resend OTP
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 ) : null}

//                 {/* Submit Button */}
//                 <Button
//                   type="submit"
//                   className="w-full h-12 bg-primary-800 cursor-pointer text-white font-semibold"
//                   disabled={isLoading}
//                 >
//                   {isLoading
//                     ? (otpSent ? 'Verifying...' : 'Sending OTP...')
//                     : (otpSent ? 'Verify & Create Account' : 'Continue')
//                   }
//                 </Button>
//               </form>

//               {/* Divider */}
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <span className="w-full border-t border-gray-200" />
//                 </div>
//                 <div className="relative flex justify-center text-xs uppercase">
//                   <span className="bg-white px-2 text-gray-500">Or sign up with</span>
//                 </div>
//               </div>

//               {/* Social Sign Up */}
//               <div className="grid grid-cols-1 gap-3">
//                 <Button
//                   variant="outline"
//                   className="h-12"
//                   onClick={() => window.location.href = `${import.meta.env.VITE_SERVER_URL}/v1/auth/google`}
//                   type="button"
//                 >
//                   <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//                     <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//                     <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//                     <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//                     <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//                   </svg>
//                   Google
//                 </Button>
//                 {/* <Button 
//                   variant="outline" 
//                   className="h-12"
//                   onClick={() => window.location.href = `${import.meta.env.VITE_SERVER_URL}/v1/auth/facebook`}
//                   type="button"
//                 >
//                   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//                   </svg>
//                   Facebook
//                 </Button> */}
//               </div>

//               {/* Sign In Link */}
//               <div className="text-center">
//                 <span className="text-sm text-gray-600">
//                   Already have an account?{' '}
//                   <Link to="/signin" className="text-primary hover:text-primary-600 font-medium">
//                     Sign in
//                   </Link>
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUp;

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Mail, Lock, Eye, EyeOff, RefreshCw, Edit2 } from 'lucide-react';
import OTPInput from 'react-otp-input';
import { sendEmailOtp, registerUser } from '@/services/api.services';
import { setAuth, isAuthenticated } from '@/lib/auth';
import logo from '../../assets/logo.svg'
import { toast } from 'sonner';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [googleWidth, setGoogleWidth] = useState(320);
  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
  useEffect(() => {
    const updateWidth = () => {
      const card = document.getElementById("signup-card");
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const clamped = Math.max(280, Math.min(400, Math.floor(rect.width - 48)));
      setGoogleWidth(clamped);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

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
      // Restart countdown
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
        console.log(registerResult)
        if (registerResult.success) {
          // Auto-login using register response
          setAuth({
            accessToken: registerResult?.data?.data?.accessToken,
            user: registerResult?.data?.data?.user
          });

          const userRole = registerResult?.data?.data?.user?.role;

          if (userRole === 'ADMIN' || userRole === 'EDITOR' || userRole === 'VIEWER') {
            navigate('/admin/dashboard');
          } else {
            if (!registerResult?.data?.data?.user?.isFeePaid || !registerResult?.data?.data?.user?.isVerified) {
              navigate('/pricing', { state: { fromAuth: true, user: registerResult?.data?.data?.user } });
            } else {
              const redirectPath = location.state?.from || '/dashboard';
              navigate(redirectPath);
            }
          }
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
      console.log(registerResult)
      if (registerResult.success) {
        setAuth({
          accessToken: registerResult?.data?.data?.accessToken,
          user: registerResult?.data?.data?.user
        });

        const userRole = registerResult?.data?.data?.user?.role;

        if (userRole === 'ADMIN' || userRole === 'EDITOR' || userRole === 'VIEWER') {
          navigate('/admin/dashboard');
        } else {
          if (!registerResult?.data?.data?.user?.isFeePaid || !registerResult?.data?.data?.user?.isVerified) {
            navigate('/pricing', { state: { fromAuth: true, user: registerResult?.data?.data?.user } });
          } else {
            const redirectPath = location.state?.from || '/dashboard';
            navigate(redirectPath);
          }
        }
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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="mx-auto w-full max-w-6xl px-2 py-6 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} alt="Goupbroadlogo" className='w-[50px] h-[50px] ' />
                <h1 className="text-3xl font-bold text-primary-700">Goupbroad</h1>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                  Begin Your
                  <span className="text-primary-700 block">Global Education Journey</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Join thousands of students worldwide who have found their perfect university match and started their international education adventure.
                </p>
              </div>
            </div>

            {/* Features */}
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

          {/* Right Side - Sign Up Form */}
          <div className="flex items-center flex-col justify-center">
            <div className="flex mx-auto  md:hidden mb-2  items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="Goupbroadlogo" className='w-[40px] h-[40px] ' />
              <h1 className="text-[26px] font-bold text-primary-700">Goupbroad</h1>
            </div>
            <Card id="signup-card" className="w-full max-w-md shadow-2xl border-0">
              <CardHeader className="space-y-2 text-center">
                <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                  <div className="bg-primary p-2 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-primary">StudyAbroad</span>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {otpSent && !editingEmail ? 'Verify OTP' : 'Create Account'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {otpSent && !editingEmail
                    ? 'Enter the 6-digit code sent to your email'
                    : 'Enter your details to create your account'
                  }
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
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
                        className="pl-10 h-12 border-gray-200 focus:border-primary"
                        required
                        disabled={otpSent && !editingEmail}
                      />
                    </div>
                  </div>

                  {/* Password Field - Disabled after OTP sent unless editing */}
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

                  {/* Confirm Password Field - Only show if not otpSent or editing */}
                  {!otpSent || editingEmail ? (
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
                  ) : null}

                  {/* OTP Field - Only show if otpSent and not editing */}
                  {otpSent && !editingEmail ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Verification Code
                      </Label>
                      <div className="w-full overflow-hidden">
                        <div className="flex justify-center">
                          <OTPInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={6}
                            renderInput={(props) => <input {...props} />}
                            containerStyle={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              flexWrap: 'wrap', // ✅ allows wrapping on very small screens
                              maxWidth: '100%',
                            }}
                            inputStyle={{
                              width: '2.5rem',   // ✅ smaller, mobile-safe
                              height: '2.5rem',
                              fontSize: '1.1rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              textAlign: 'center',
                              outline: 'none',
                            }}
                            inputMode="numeric"
                          />
                        </div>
                      </div>

                      {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}
                    </div>
                  ) : null}

                  {/* Terms and Conditions - Only show if not otpSent or editing */}
                  {!otpSent || editingEmail ? (
                    <div className="flex items-start space-x-2" >
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={setTermsAccepted}
                      />
                      <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                        <span> I agree to the <Link to="/terms-and-conditions" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link></span>
                      </Label>
                    </div>
                  ) : null}

                  {/* Edit Email and Resend OTP Buttons - Side by side if otpSent and not editing */}
                  {otpSent && !editingEmail ? (
                    <div className="flex justify-between items-center space-x-4">
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex-1 justify-start h-10 px-2 text-primary hover:bg-primary/5 cursor-pointer"
                        onClick={handleEditEmail}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Email
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex-1 h-10 cursor-pointer"
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
                    className="w-full h-12 bg-primary-800 cursor-pointer text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? (otpSent ? 'Verifying...' : 'Sending OTP...')
                      : (otpSent ? 'Verify & Create Account' : 'Continue')
                    }
                  </Button>
                </form>
                {(!otpSent || editingEmail) && (
                  <>
                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                      </div>
                    </div>

                    {/* Social Sign Up */}
                    <div className="w-full overflow-hidden">
                      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                        <div className="w-full flex justify-center overflow-hidden">
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                            ux_mode="popup"
                            shape="rectangular"
                            text="continue_with"
                            width={googleWidth}   // ✅ number (px)
                            containerProps={{
                              className: "w-full flex justify-center overflow-hidden"
                            }}
                          />
                        </div>
                      </GoogleOAuthProvider>
                    </div>
                  </>
                )}




                {/* Sign In Link */}
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/signin" className="text-primary hover:text-primary-600 font-medium">
                      Sign in
                    </Link>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;