import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Users, Award, University, Globe, Heart, Target, Lightbulb, CheckCircle, ArrowRight, Phone, Mail } from 'lucide-react';
import Navigation from './components/Navigation';
import { Link, useNavigate } from 'react-router-dom';
import CTA from '@/components/static/CTA';
import Footer from '@/components/static/Footer';

const About = () => {
  console.log('About component rendering');
  const navigate = useNavigate()

  const impactStats = [
    {
      number: '20,000+',
      label: 'Students Guided',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      number: '700+',
      label: 'Partner Universities',
      icon: University,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      number: '₹100+ Cr',
      label: 'Scholarships Secured',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      number: '98%',
      label: 'Visa Success Rate',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const values = [
    {
      title: 'Student-Centric',
      description: 'We prioritize our students\' dreams and aspirations above all else.',
      icon: Heart,
      gradient: 'from-red-400 to-pink-400'
    },
    {
      title: 'Transparency',
      description: 'Complete transparency in processes, fees, and guidance.',
      icon: Lightbulb,
      gradient: 'from-yellow-400 to-orange-400'
    },
    {
      title: 'Excellence',
      description: 'Committed to excellence in every aspect of service delivery.',
      icon: Award,
      gradient: 'from-blue-400 to-indigo-400'
    },
    {
      title: 'Innovation',
      description: 'Continuously evolving with latest technology and practices.',
      icon: Target,
      gradient: 'from-green-400 to-teal-400'
    }
  ];

  // const achievements = [
  //   { label: "Years of Excellence", value: "15+", icon: Clock },
  //   { label: "Success Stories", value: "20K+", icon: Star },
  //   { label: "Global Reach", value: "25+", icon: Globe },
  //   { label: "Expert Counselors", value: "50+", icon: Users }
  // ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Minimalistic Hero Section */}
      <section className="pt-24 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge variant="outline" className="border-primary-700 text-primary-700 rounded-full px-3 py-1">
                  About GoupBroad
                </Badge>

                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  To bring everyone&apos;s{' '}
                  <span className="text-primary">study abroad dream</span>{' '}
                  to life
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed">
                  GoupBroad is an all-in-one platform for aspirants to connect and collaborate
                  with fellow students and counselling experts creating a community that strives
                  to make every study abroad aspiration a dream come true.
                </p>
              </div>

              {/* Simple Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">20,000+</div>
                  <div className="text-sm text-gray-600">Students Guided</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">700+</div>
                  <div className="text-sm text-gray-600">Partner Universities</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3">
                  <Link to='/signin'> Learn More</Link>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {/* <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3">
                  Contact Us
                </Button> */}
              </div>
            </div>

            {/* Right Image Section */}
            <div className="relative">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Students collaborating and studying together"
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />

                {/* Simple overlay card */}
                <Card className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Global Community</div>
                        <div className="text-xs text-gray-600">25+ Countries Connected</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-lg text-gray-600">Transforming lives through education, one student at a time</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-4 border-primary-700 rounded-full text-primary-700 ">Our Story</Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  15+ Years of Excellence in Global Education
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    GoupBroad was founded with a vision to democratize access to world-class education for Indian students.
                    What started as a mission to help a few students has grown into India&apos;s most trusted study abroad consultancy.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    With a team of experienced counselors and a network spanning across the globe,
                    we continue to innovate and evolve our services to meet the changing landscape of international education.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3"
                alt="Team collaboration"
                className="rounded-lg shadow-lg w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Founders */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary-700 text-primary-700 rounded-full">Leadership</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Founders</h2>
            <p className="text-lg text-gray-600">Meet the visionaries behind GoupBroad</p>
          </div>

          <Tabs defaultValue="anushk" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8 overflow-y-hidden h-fit">
              <TabsTrigger value="anushk" className="text-lg py-3">Anushk Sharma</TabsTrigger>
              <TabsTrigger value="shrey" className="text-lg py-3">Shrey Choksi</TabsTrigger>
            </TabsList>

            <TabsContent value="anushk">
              <Card className="border-0 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-8 bg-white">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <GraduationCap className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Anushk Sharma</h3>
                        <p className="text-primary font-medium">Co-Founder & CEO</p>
                      </div>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                      <p>
                        Anushk completed his bachelor&apos;s degree in Mechanical Engineering from Medi Caps University in India.
                        However, feeling dissatisfied with the quality of education, he sought to enhance his academic journey
                        by pursuing his master&apos;s degree at the University of Notre Dame.
                      </p>
                      <p>
                        In his quest for admission, Anushk sought assistance from a &quot;reputed local consultancy service in Indore&quot;.
                        Unfortunately, he found their approach to be generic and lacking relevant industry knowledge, despite
                        investing nearly 1 lakh rupees in their services. Consequently, he navigated the admissions process independently.
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2 items-center space-x-3">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">University of Notre Dame</Badge>
                      <Badge variant="secondary" className="bg-green-50 text-green-700">Mechanical Engineering</Badge>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-8 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=300&h=300&fit=crop&crop=face"
                      alt="Anushk Sharma"
                      className="w-48 h-48 rounded-full object-cover shadow-lg"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="shrey">
              <Card className="border-0 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-8 bg-white">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <Globe className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Shrey Choksi</h3>
                        <p className="text-primary font-medium">Co-Founder & CTO</p>
                      </div>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                      <p>
                        After completing his Bachelor&apos;s in Electronics and Communication, Shrey embarked on a transformative
                        journey to pursue an M.S. in Computer Science at Florida State University, driven by a passion for
                        cutting-edge technology and software development.
                      </p>
                      <p>
                        Like many students, Shrey initially sought help from traditional agencies to navigate the study abroad process,
                        but he encountered numerous challenges and setbacks. Determined to overcome these obstacles, he took matters into
                        his own hands, gaining crucial insights through his personal experiences. Now, with UpBroad, he is committed to
                        helping others overcome similar hurdles and achieve their educational goals abroad.
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2 items-center space-x-3">
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700">Florida State University</Badge>
                      <Badge variant="secondary" className="bg-orange-50 text-orange-700">Computer Science</Badge>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-8 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=300&h=300&fit=crop&crop=face"
                      alt="Shrey Choksi"
                      className="w-48 h-48 rounded-full object-cover shadow-lg"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary-700 text-primary-700 rounded-full">Our Values</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Drives Us</h2>
            <p className="text-lg text-gray-600">Core principles that guide our mission</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${value.gradient} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {/* <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of successful students who have achieved their dreams with GroupBroad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-6 py-3" onClick={() => {
              navigate('/signin')
            }}>
              <Mail className="mr-2 h-4 w-4" />
              Get Started Today
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-6 py-3" onClick={() => {
              navigate('/signin')
            }}>
              <Phone className="mr-2 h-4 w-4" />
              Free Consultation
            </Button>
          </div>
        </div>
      </section> */}
      <CTA/>
      <Footer/>

    </div>
  );
};

export default About;
