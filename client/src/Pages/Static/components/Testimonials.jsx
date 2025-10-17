
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      university: 'University of Toronto, Canada',
      course: 'Computer Science',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
      text: 'GoupBroad made my dream of studying in Canada a reality. Their personalized university matching helped me find the perfect program, and I secured a $15,000 scholarship through their platform!',
      rating: 5,
      achievement: 'Secured $15K Scholarship'
    },
    {
      name: 'Rahul Patel',
      university: 'University of Melbourne, Australia',
      course: 'Business Administration',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      text: 'The application tracker was a game-changer! I was able to manage applications to 8 universities simultaneously and never missed a deadline. Now I\'m pursuing my MBA in Australia.',
      rating: 5,
      achievement: '8 University Applications'
    },
    {
      name: 'Ananya Singh',
      university: 'Technical University of Munich, Germany',
      course: 'Mechanical Engineering',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      text: 'The community forum connected me with seniors already studying in Germany. Their guidance was invaluable in my preparation and helped me get admission with a full scholarship.',
      rating: 5,
      achievement: 'Full Scholarship Recipient'
    },
    {
      name: 'Arjun Kumar',
      university: 'Stanford University, USA',
      course: 'Data Science',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      text: 'The test score calculator helped me strategize my GRE preparation perfectly. I knew exactly what score I needed and achieved it, securing admission to my dream university!',
      rating: 5,
      achievement: 'Stanford Admission'
    },
    {
      name: 'Kavya Reddy',
      university: 'University of Edinburgh, UK',
      course: 'International Relations',
      image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
      text: 'GoupBroad\'s scholarship finder helped me discover funding opportunities I never knew existed. I\'m now studying in the UK with 70% of my tuition covered!',
      rating: 5,
      achievement: '70% Tuition Covered'
    },
    {
      name: 'Vikram Mehta',
      university: 'University of British Columbia, Canada',
      course: 'Environmental Engineering',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      text: 'From university selection to visa guidance, GoupBroad supported me at every step. Their comprehensive approach made what seemed impossible, possible!',
      rating: 5,
      achievement: 'End-to-End Support'
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Success Stories from Our Students
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of students who have successfully transformed their international education dreams into reality with GoupBroad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>

                {/* Achievement Badge */}
                <div className="bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  {testimonial.achievement}
                </div>

                {/* Student Info */}
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.course}</p>
                    <p className="text-sm text-primary font-medium">{testimonial.university}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-700 mb-2">98%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-700 mb-2">4.9/5</div>
              <div className="text-sm text-gray-600">Student Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-700 mb-2">15K+</div>
              <div className="text-sm text-gray-600">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-700 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
