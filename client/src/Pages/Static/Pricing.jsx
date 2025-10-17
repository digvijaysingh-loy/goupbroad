
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import { fetchPlans, getPlanDetails } from '@/services/planService';
import { apiService } from '@/services/api.services';
import { toast } from 'sonner';
import { clearAuth } from '@/lib/auth';
import Footer from '@/components/static/Footer';

const Pricing = () => {
  const [selectedCategory, setSelectedCategory] = useState('masters');
  const [plansData, setPlansData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed processingPayment state as it's no longer needed
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is coming from auth flow and needs to make a payment
  const fromAuth = location.state?.fromAuth;
  const userData = location.state?.user;
  
  useEffect(() => {
    const getPlans = async () => {
      try {
        setLoading(true);
        const data = await fetchPlans();
        setPlansData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    getPlans();
  }, []);

  const handleSelectPlan = (planType, price, category) => {
    // Always navigate to payment page with plan details
    navigate('/auth/payment-required', {
      state: {
        planType,
        price,
        category,
        planDetails: getPlanDetailsForCategory(planType, category),
        user: userData || null
      }
    });
  };
  
  // Removed initiatePayment function as we're now handling payment in the PaymentRequired component

  const getPlanDetailsForCategory = (planType, category) => {
    return getPlanDetails(plansData, planType, category);
  };

  // If data is still loading or there's an error, provide fallback values
  const basicPlan = !loading && plansData ? getPlanDetailsForCategory('basic', selectedCategory) : { name: 'Basic Plan', price: 0, features: [] };
  const proPlan = !loading && plansData ? getPlanDetailsForCategory('pro', selectedCategory) : { name: 'Pro Plan', price: 0, features: [] };
  const premierPlan = !loading && plansData ? getPlanDetailsForCategory('premier', selectedCategory) : { name: 'Premier Plan', price: 0, features: [] };

  // Load Razorpay script if user is coming from auth flow
  useEffect(() => {
    if (fromAuth && userData) {
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };
      
      const loadScript = async () => {
        if (!window.Razorpay) {
          const res = await loadRazorpayScript();
          if (!res) {
            toast.error('Razorpay SDK failed to load. Please check your internet connection.');
          }
        }
      };
      
      loadScript();
    }
  }, [fromAuth, userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading plans...</h2>
          <p>Please wait while we fetch the latest pricing information.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Plans</h2>
          <p>We encountered an error while loading the pricing plans.</p>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button 
            className="mt-4 bg-[#145044] hover:bg-[#145044]/90 text-white"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {fromAuth && userData && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mx-auto max-w-7xl mt-24 mb-0">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
            <p className="text-amber-700">
              <span className="font-bold">Payment Required:</span> Please select a plan to complete your registration and access all features.
            </p>
          </div>
        </div>
      )}

      <main className={fromAuth && userData ? 'pt-8' : 'pt-24'}>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#145044]/5 to-[#145044]/10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <Badge className="bg-[#145044] text-white px-4 py-2 text-sm font-medium mb-6">
              🎓 Choose Your Plan
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Invest in Your
              <br />
              <span style={{ color: '#145044' }}>Academic Future</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Choose the perfect plan for your academic journey. From basic guidance to comprehensive support, we have everything you need to succeed.
            </p>

            {/* Category Selection */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Button
                variant={selectedCategory === 'masters' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('masters')}
                className={selectedCategory === 'masters' ? 'bg-[#145044] hover:bg-[#145044]/90' : 'border-[#145044] text-[#145044] hover:bg-[#145044]/10'}
                size="lg"
              >
                Masters
              </Button>
              <Button
                variant={selectedCategory === 'bachelors' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('bachelors')}
                className={selectedCategory === 'bachelors' ? 'bg-[#145044] hover:bg-[#145044]/90' : 'border-[#145044] text-[#145044] hover:bg-[#145044]/10'}
                size="lg"
              >
                Bachelors
              </Button>
              <Button
                variant={selectedCategory === 'mba' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('mba')}
                className={selectedCategory === 'mba' ? 'bg-[#145044] hover:bg-[#145044]/90' : 'border-[#145044] text-[#145044] hover:bg-[#145044]/10'}
                size="lg"
              >
                MBA
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Basic Plan */}
              <Card className="border-2 border-gray-200 hover:border-[#145044]/30 transition-colors">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">{basicPlan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold" style={{ color: '#145044' }}>₹{basicPlan.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 ml-2">/ one-time</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 mb-8">
                    {basicPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#145044' }} />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-[#145044] hover:bg-[#145044]/90 text-white cursor-pointer"
                    size="lg"
                    onClick={() => handleSelectPlan('basic', basicPlan.price, selectedCategory)}
                  >
                    Choose Basic
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border-2 border-[#145044] relative transform scale-105 shadow-xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#145044] text-white px-4 py-2">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">{proPlan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold" style={{ color: '#145044' }}>₹{proPlan.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 ml-2">/ one-time</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 mb-8">
                    {proPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#145044' }} />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-[#145044] hover:bg-[#145044]/90 text-white cursor-pointer"
                    size="lg"
                    onClick={() => handleSelectPlan('pro', proPlan.price, selectedCategory)}
                  >
                    Choose Pro
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>

              {/* Premier Plan */}
              <Card className="border-2 border-gray-200 hover:border-[#145044]/30 transition-colors">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900">{premierPlan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold" style={{ color: '#145044' }}>₹{premierPlan.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 ml-2">/ one-time</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 mb-8">
                    {premierPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#145044' }} />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-[#145044] hover:bg-[#145044]/90 text-white cursor-pointer"
                    size="lg"
                    onClick={() => handleSelectPlan('premier', premierPlan.price, selectedCategory)}
                  >
                    Choose Premier
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Add-Ons Section */}
            <div className="text-center">
              <Card className="max-w-2xl mx-auto border-2 border-orange-200 bg-orange-50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Add-Ons</h3>
                  <div className="text-3xl font-bold mb-4" style={{ color: '#145044' }}>₹7,000 / university</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-5 h-5" style={{ color: '#145044' }} />
                      <span>If you wish to apply to more universities than those included</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-5 h-5" style={{ color: '#145044' }} />
                      <span>We offer additional document preparation services at an extended price</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ or Trust Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Why Choose UpBroad?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#145044' }}>
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
                <p className="text-gray-600">Our experienced counselors have helped thousands of students achieve their dreams</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#145044' }}>
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Proven Success</h3>
                <p className="text-gray-600">95% of our students get accepted into their preferred universities</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#145044' }}>
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">End-to-End Support</h3>
                <p className="text-gray-600">From application to visa, we&apos;re with you every step of the way</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
