import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Navigation from '@/components/static/Navigation';
import Footer from '@/components/static/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Target, Globe, Sparkles, Brain, GraduationCap } from 'lucide-react';
import collegeData from '@/data/collegeData';

const NewCollegeFinder = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Initialize Gemini AI
  const initializeGemini = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not found. Using mock responses.');
      return null;
    }
    return new GoogleGenerativeAI(apiKey);
  };

  useEffect(() => {
    // Animation delay
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartJourney = () => {
    setIsLoading(true);

    // Simulate loading and then navigate to questionnaire form
    setTimeout(() => {
      navigate('/college-finder/questionnaire');
    }, 1500);
  };

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary-600" />,
      title: "AI-Powered Matching",
      description: "Advanced algorithms analyze your profile to find perfect university matches"
    },
    {
      icon: <Target className="h-8 w-8 text-primary-600" />,
      title: "Personalized Recommendations",
      description: "Get tailored suggestions based on your academic background and goals"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary-600" />,
      title: "Comprehensive Database",
      description: "Access to 500+ universities with real-time admission requirements"
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-primary-600" />,
      title: "Success Probability",
      description: "Know your chances with our sophisticated probability calculator"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Students Guided" },
    { number: "500+", label: "Universities" },
    { number: "95%", label: "Success Rate" },
    { number: "50+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-100/40 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            {/* Main Heading with Animation */}
            <div className={`transform transition-all duration-1000 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="h-12 w-12 text-primary-600 mr-4 animate-pulse" />
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
                  <span className="text-gray-900">Let </span>
                  <span className="text-primary-600">GoupBroad</span>
                  <span className="text-gray-900"> Guide You</span>
                </h1>
              </div>

              <h2 className="text-2xl md:text-4xl font-semibold text-gray-700 mb-8">
                Find the <span className="text-primary-600 relative">
                  Perfect University
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"></div>
                </span> for You
              </h2>

              <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Discover your ideal university match with our AI-powered recommendation engine.
                Get personalized suggestions based on your academic profile, preferences, and career goals.
              </p>
            </div>

            {/* CTA Button */}
            <div className={`transform transition-all duration-1000 delay-300 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Button
                onClick={handleStartJourney}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-12 py-6 text-lg font-semibold rounded-full shadow-2xl hover:shadow-primary-500/25 transform hover:scale-105 transition-all duration-300 group"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Preparing Your Journey...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <BookOpen className="h-6 w-6 mr-3 group-hover:animate-pulse" />
                    Start Your University Journey
                    <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transform transition-all duration-700 delay-${index * 100} ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our University Finder?
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI technology and comprehensive database ensure you find the perfect university match for your unique profile and aspirations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-primary-200 group ${animationComplete ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-primary-50 to-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-xl text-gray-600">
              Simple steps to find your perfect university match
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Share Your Profile
              </h4>
              <p className="text-gray-600">
                Tell us about your academic background, test scores, and preferences through our smart questionnaire.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                AI Analysis
              </h4>
              <p className="text-gray-600">
                Our advanced AI analyzes your profile against thousands of university programs and admission requirements.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Get Recommendations
              </h4>
              <p className="text-gray-600">
                Receive personalized university recommendations with admission probability and detailed insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Dream University?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who have found their perfect university match with our AI-powered platform.
          </p>
          <Button
            onClick={handleStartJourney}
            disabled={isLoading}
            className="bg-white text-primary-600 hover:bg-gray-100 px-12 py-6 text-lg font-semibold rounded-full shadow-2xl hover:shadow-white/25 transform hover:scale-105 transition-all duration-300"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3"></div>
                Loading...
              </div>
            ) : (
              "Start Finding Universities Now"
            )}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewCollegeFinder;