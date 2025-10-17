
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Calendar, Mail, Home, Phone } from 'lucide-react';
import Navigation from './components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Safely access orderDetails with fallbacks
  const { orderDetails } = location.state || {};

  // If no orderDetails at all, redirect to pricing
  if (!orderDetails) {
    navigate('/pricing');
    return null;
  }

  // Safely destructure with default values to prevent errors
  const { 
    planDetails = { 
      name: 'Plan', 
      price: 0, 
      features: ['Feature information not available']
    }, 
    customerData = { 
      firstName: 'User', 
      lastName: '', 
      email: 'email@example.com' 
    }, 
    orderId = 'N/A', 
    paymentId = 'N/A', 
    price = 0, 
    category = 'plan', 
    receiptUrl = null 
  } = orderDetails;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#145044' }}>
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-600">
              Thank you for choosing UpBroad. Your journey to success starts now!
            </p>
          </div>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: '#145044' }} />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{planDetails.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: '#145044' }}>
                      ₹{price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-gray-500">Paid</div>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono font-medium">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono font-medium">{paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" style={{ color: '#145044' }} />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#145044' }}>
                    <span className="text-white text-sm font-medium">
                      {customerData.firstName.charAt(0)}{customerData.lastName ? customerData.lastName.charAt(0) : ''}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {customerData.firstName} {customerData.lastName || ''}
                    </div>
                    <div className="text-sm text-gray-500">{customerData.email}</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{customerData.email}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Our team will contact you via email for further assistance.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What's Included */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>What&apos;s Included in Your Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {planDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#145044' }} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: '#145044' }} />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: '#145044' }}>
                    1
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Confirmation Email</h4>
                    <p className="text-gray-600 text-sm">You&apos;ll receive a detailed confirmation email within 10 minutes with your order details and next steps.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: '#145044' }}>
                    2
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Counselor Assignment</h4>
                    <p className="text-gray-600 text-sm">Our team will assign a dedicated counselor to your case within 24-48 hours.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: '#145044' }}>
                    3
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Initial Consultation</h4>
                    <p className="text-gray-600 text-sm">Your counselor will schedule an initial consultation call to understand your goals and create a personalized plan.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: '#145044' }}>
                    4
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Get Started</h4>
                    <p className="text-gray-600 text-sm">Begin your journey with expert guidance every step of the way!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-[#145044] hover:bg-[#145044]/90 text-white"
              onClick={() => receiptUrl ? window.open(receiptUrl, '_blank') : window.print()}
            >
              <Download className="w-5 h-5 mr-2" />
              Download Receipt
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-[#145044] text-[#145044] hover:bg-[#145044]/10"
              onClick={() => navigate('/signin')}
            >
              <Home className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>

          {/* Support Information */}
          <div className="mt-12 text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">Our support team is here to assist you</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" style={{ color: '#145044' }} />
                <span className="text-sm">support@upbroad.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: '#145044' }} />
                <span className="text-sm">+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
