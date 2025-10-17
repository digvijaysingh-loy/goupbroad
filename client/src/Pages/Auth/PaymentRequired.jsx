import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api.services';
import { getUser, clearAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useRazorpay } from '@/hooks/use-razorpay';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Clock,
    Shield,
    CheckCircle,
    Loader2,
    ArrowLeft,
    University,
    Globe
} from 'lucide-react';

const PaymentRequired = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [countdown, setCountdown] = useState(8);
    const [loading, setLoading] = useState(false);
    
    // Get plan details from location state or use default values
    const planType = location.state?.planType || 'basic';
    const planCategory = location.state?.category || 'masters';
    const planPrice = location.state?.price || 0;
    const planDetails = location.state?.planDetails || {};
    
    // Get user data either from location state or from auth
    const userFromState = location.state?.user;
    const user = userFromState || getUser();
    
    const razorpayLoaded = useRazorpay();

    const handleProceed = useCallback(async () => {
        if (loading || !razorpayLoaded) return;

        try {
            setLoading(true);
            // Initialize payment with the selected plan details
            const response = await apiService.post('/payment/initiate', {
                "planType": planType,
                "category": planCategory
            });

            // If fee is already paid, clear auth and redirect to login to refresh user data
            if (response.message === 'Already Fee Paid') {
                toast.success('Payment already completed! Redirecting to signin...');
                clearAuth();
                navigate('/signin');
                return;
            }

            if (!response.data?.orderId || !response.data?.key) {
                throw new Error('Invalid payment details received');
            }

            const options = {
                key: response.data.key,
                amount: response.data.amount,
                currency: response.data.currency || 'INR',
                name: 'GoupBroad',
                description: `${planCategory.charAt(0).toUpperCase() + planCategory.slice(1)} ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
                order_id: response.data.orderId,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phoneNumber || ''
                },
                handler: async function (response) {
                    try {
                        const verifyResponse = await apiService.post('/payment/verify', {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature
                        });
                        if (verifyResponse.success) {
                            toast.success('Payment successful!');
                            
                            // Store the current user data before clearing auth
                            const currentUser = getUser();
                            
                            // Clear auth tokens
                            localStorage.removeItem('user');
                            localStorage.removeItem('authToken');
                            Cookies.remove('accessToken');
                            
                            // Navigate to order confirmation with payment details
                            navigate('/order-confirmation', {
                                state: {
                                    orderDetails: verifyResponse.data.orderDetails
                                }
                            });
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setCountdown(5);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function () {
                toast.error('Payment failed');
                setLoading(false);
                navigate('/auth/payment-failed');
            });
            razorpay.open();
        } catch (error) {
            console.error('Payment initiation failed:', error);
            toast.error(error.message || 'Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    }, [loading, navigate, user, razorpayLoaded]);

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }

        if (user.isVerified && user.isFeePaid) {
            clearAuth();
            navigate('/signin');
            return;
        }

        let timer;
        if (!user.isFeePaid) {
            if (countdown > 0 && razorpayLoaded) {
                timer = setInterval(() => setCountdown(c => c - 1), 1000);
            } else if (countdown === 0 && !loading && razorpayLoaded) {
                handleProceed();
            }
        }

        return () => {
            if (timer) clearInterval(timer);
            if (window.Razorpay && window.Razorpay.cleanup) {
                window.Razorpay.cleanup();
            }
        };
    }, [countdown, user, navigate, loading, handleProceed, razorpayLoaded]);

    // Loading state for Razorpay
    if (!razorpayLoaded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-slate-100"
                >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-8 h-8 text-primary-1 animate-spin" />
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-800 mb-4">
                        Loading Payment Gateway...
                    </h1>
                    <p className="text-slate-600">
                        Please wait while we set up the secure payment system.
                    </p>
                </motion.div>
            </div>
        );
    }

    // Verification pending state
    if (user?.isFeePaid && !user?.isVerified) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-slate-100"
                >
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-800 mb-4">
                        Verification Pending
                    </h1>
                    <p className="text-slate-600 mb-4">
                        Your payment has been received successfully. Our team will verify your details shortly.
                    </p>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                        <p className="text-emerald-700 text-sm">
                            <strong>Next Steps:</strong> You&apos;ll receive an email confirmation once verification is complete.
                        </p>
                    </div>
                    <p className="text-slate-500 text-sm mb-6">
                        For any queries, contact us at <span className="font-medium text-primary-1">support@goupbroad.com</span>
                    </p>
                    <Button asChild variant="outline" className="w-full">
                        <Link to="/auth/sigin" className="flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Signin
                        </Link>
                    </Button>
                </motion.div>
            </div>
        );
    }

    // Main payment required state 
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-primary-1 rounded-lg flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-800">GoupBroad</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Complete Your Registration</h1>
                    <p className="text-slate-600">Secure your spot and unlock access to premium university guidance</p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Left side - Features */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <University className="w-5 h-5 text-primary-1" />
                                What You&apos;ll Get Access To
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-primary-1 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-slate-800">Personalized University Shortlist</p>
                                        <p className="text-slate-600 text-sm">Get matched with 46+ universities based on your profile</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-primary-1 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-slate-800">Expert Guidance & Support</p>
                                        <p className="text-slate-600 text-sm">Direct access to education consultants and advisors</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-primary-1 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-slate-800">Application Tracking</p>
                                        <p className="text-slate-600 text-sm">Monitor your application progress and deadlines</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-primary-1 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-slate-800">Document Management</p>
                                        <p className="text-slate-600 text-sm">Secure storage and organization of all your documents</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-5 h-5 text-primary-1" />
                                <span className="font-medium text-emerald-800">Secure Payment</span>
                            </div>
                            <p className="text-emerald-700 text-sm">
                                Your payment is protected by industry-standard encryption and security measures.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right side - Payment Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-primary-1" />
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Registration Payment</h2>
                            <p className="text-slate-600">Complete your payment to access the dashboard</p>
                            <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-primary font-semibold">{planCategory.charAt(0).toUpperCase() + planCategory.slice(1)} {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan</p>
                                <p className="text-2xl font-bold text-primary mt-1">₹{planPrice.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        {/* Countdown Timer */}
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4 mb-6 border border-emerald-200"
                        >
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-primary-1" />
                                <span className="font-medium text-emerald-800">Auto-redirect in</span>
                            </div>
                            <div className="text-center">
                                <motion.div
                                    key={countdown}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    className="text-3xl font-bold text-primary-1 mb-1"
                                >
                                    {countdown}
                                </motion.div>
                                <p className="text-emerald-700 text-sm">seconds</p>
                            </div>
                        </motion.div>

                        {/* User Info */}
                        <div className="bg-slate-50 rounded-lg p-4 mb-6">
                            <p className="text-slate-600 text-sm mb-1">Registering as:</p>
                            <p className="font-medium text-slate-800">{user?.name}</p>
                            <p className="text-slate-600 text-sm">{user?.email}</p>
                        </div>

                        {/* Payment Button */}
                        <Button
                            onClick={handleProceed}
                            disabled={loading}
                            className="w-full h-12 bg-primary-1 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing Payment...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Proceed to Secure Payment
                                </div>
                            )}
                        </Button>

                        <p className="text-center text-slate-500 text-xs mt-4">
                            By proceeding, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-8 text-slate-500 text-sm"
                >
                    <p>Need help? Contact us at <span className="text-primary-1 font-medium">support@goupbroad.com</span></p>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentRequired;