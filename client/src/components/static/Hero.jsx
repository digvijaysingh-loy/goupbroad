
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Globe, Users, Award, GraduationCap, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
      {/* Circular Gradients Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large primary gradient - top left */}
        <div className="absolute -top-10 -left-20 w-30 h-30 bg-primary-600 rounded-full blur-3xl"></div>

        {/* Medium secondary gradient - top right */}
        <div className="absolute -top-10 -right-10 w-30 h-30 bg-primary-600 rounded-full blur-3xl"></div>

        {/* Small accent gradient - middle left */}
        <div s  style={{
        backgroundImage: 'radial-gradient(circle, #58BCA880, #88D3C440, #88D3C400)'
      }} className="absolute  top-1/2 -left-20 w-40 h-40 rounded-full blur-sm"></div>

        {/* Large bottom gradient - bottom right */}
        {/* <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-600 rounded-full blur-3xl"></div> */}

        {/* Small floating gradient - center */}
        <div  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 w-20 h-20 bg-primary-600 rounded-full blur-3xl animate-pulse"></div>

        {/* Additional small gradients for depth */}
        <div style={{
        backgroundImage: 'radial-gradient(circle, #58BCA880, #88D3C440, #88D3C400)'
      }} className="absolute bottom-1/4 left-1/4 w-20 h-20  rounded-full blur-sm"></div>
        <div  style={{
        backgroundImage: 'radial-gradient(circle, #58BCA880, #88D3C440, #88D3C400)'
      }}  className="absolute top-1/4 right-1/3 w-20 h-20  rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-md:gap-12 items-center">

          {/* Left Section - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="bg-primary-1/10 text-primary border-primary/20 px-4 py-2 text-sm">
              🎓 #1 Study Abroad Platform
            </Badge>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Your Gateway to{' '}
              <span className="text-gradient bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                International
              </span>{' '}
              Universities
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Transform your international education dreams into reality. Find the perfect university,
              secure scholarships, and connect with a global community of ambitious students.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-gray-600">Universities</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-gray-600">Students Helped</div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signin">
                <Button
                  size="lg"
                  className="bg-primary-1 hover:bg-primary-1-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/college-finder">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary-1 hover:text-white px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300"
                >
                  Explore Universities
                </Button></Link>
            </div>
          </div>

          {/* Right Section - University Campus with Students */}
          <div className="relative flex justify-center items-center max-lg:h-[350px] max-sm:h-[300px] max-lg:mx-[60px] max-sm:mx-[40px] max-lg:mt-10 pb-10">
            {/* Main University Image - Rectangular with Academic Frame */}
            <div className="relative">
              <div className="w-96 h-96 max-sm:w-60 max-sm:h-60 max-lg:w-72 max-lg:h-72 shadow-2xl   rounded-full overflow-hidden  border-8 border-white bg-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="University campus with students"
                  className="w-full h-full object-cover"
                />
                {/* Overlay for university atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
              </div>

              {/* Academic Frame Effect */}
              {/* <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary-300/20 rounded-2xl -z-10 blur-xl"></div> */}
            </div>

            {/* Floating Academic Achievement Elements */}
            {/* Top Left - University Ranking */}
            <Card className="absolute -top-4 -left-6 max-sm:p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float">
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700">Success Rate</span>
                </div>
                <div className="text-xl max-sm:text-[14px] font-bold text-primary-800">98%</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500">Students get admitted</div>
              </CardContent>
            </Card>

            {/* Top Right - Global Recognition */}
            <Card className="absolute -top-6 -right-8 max-sm:p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700">Global Reach</span>
                </div>
                <div className="text-xl  max-sm:text-[14px] font-bold text-primary-800">25+</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500">Countries</div>
              </CardContent>
            </Card>

            {/* Middle Left - Academic Programs */}
            <Card className="absolute top-1/3 -left-12 max-sm:p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '2s' }}>
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700">Programs</span>
                </div>
                <div className="text-xl  max-sm:text-[14px] font-bold text-primary-800">1000+</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500">Study options</div>
              </CardContent>
            </Card>

            {/* Middle Right - Student Community */}
            <Card className="absolute top-1/3 -right-12 max-sm:p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '3s' }}>
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700">Scholarships</span>
                </div>
                <div className="text-xl  max-sm:text-[14px] font-bold text-primary-800">$50M+</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500">Available funding</div>
              </CardContent>
            </Card>

            {/* Bottom Left - Scholarships */}
            <Card className="absolute -bottom-4 max-lg:bottom-1 max-sm:bottom-4 -left-8 max-sm:p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '4s' }}>
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700">Community</span>
                </div>
                <div className="text-xl  max-sm:text-[14px] font-bold text-primary-800">50K+</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500">Active students</div>
              </CardContent>
            </Card>

            {/* Bottom Right - Graduation Success */}
            <Card className="absolute -bottom-6 max-lg:bottom-1 max-sm:bottom-5 -right-4 max-sm:p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '5s' }}>
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700">Graduates</span>
                </div>
                <div className="text-xl  max-sm:text-[14px] font-bold text-primary-800">15K+</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500">Success Stories</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
