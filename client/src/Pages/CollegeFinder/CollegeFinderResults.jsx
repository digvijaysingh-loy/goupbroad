import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '@/components/static/Navigation';
import Footer from '@/components/static/Footer';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Clock,
  DollarSign,
  Award,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Target,
  Shield,
  ArrowLeft,
  Download,
  Heart,
  ExternalLink,
  BookOpen,
  Users,
  Globe,
  Trophy,
  Brain
} from 'lucide-react';

const CollegeFinderResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recommendations, responses, aiInsights } = location.state || {};

  const [selectedTier, setSelectedTier] = useState('all');
  const [favoriteColleges, setFavoriteColleges] = useState(new Set());

  if (!recommendations) {
    navigate('/college-finder');
    return null;
  }

  const toggleFavorite = (collegeId) => {
    const newFavorites = new Set(favoriteColleges);
    if (newFavorites.has(collegeId)) {
      newFavorites.delete(collegeId);
    } else {
      newFavorites.add(collegeId);
    }
    setFavoriteColleges(newFavorites);
  };

  const tierConfig = {
    ambitious: {
      title: 'Ambitious',
      subtitle: '10-25% Admission Chance',
      color: 'bg-red-100 text-red-700',
      borderColor: 'border-red-200',
      icon: TrendingUp,
      description: 'Reach for the stars! These are highly competitive programs.'
    },
    target: {
      title: 'Target',
      subtitle: '25-50% Admission Chance',
      color: 'bg-orange-100 text-orange-700',
      borderColor: 'border-orange-200',
      icon: Target,
      description: 'Well-matched programs with good admission prospects.'
    },
    safe: {
      title: 'Safe',
      subtitle: '50-80% Admission Chance',
      color: 'bg-blue-100 text-blue-700',
      borderColor: 'border-blue-200',
      icon: Shield,
      description: 'Solid choices with high probability of acceptance.'
    },
    backup: {
      title: 'Backup',
      subtitle: '80%+ Admission Chance',
      color: 'bg-green-100 text-green-700',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Secure options to ensure you have acceptance letters.'
    }
  };

  const getAllColleges = () => {
    const { ambitious = [], target = [], safe = [], backup = [] } = recommendations;
    return [...ambitious, ...target, ...safe, ...backup];
  };

  const getFilteredColleges = () => {
    if (selectedTier === 'all') return getAllColleges();
    return recommendations[selectedTier] || [];
  };

  const filteredColleges = getFilteredColleges();

  const CollegeCard = ({ college }) => {
    const tierInfo = tierConfig[college.tier];
    const TierIcon = tierInfo.icon;

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 group">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {college.university}
              </h3>
              <p className="text-lg text-primary-600 font-semibold mb-2">
                {college.program}
              </p>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{college.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <button
                onClick={() => toggleFavorite(college.id)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors mb-2"
              >
                <Heart
                  className={`h-6 w-6 ${
                    favoriteColleges.has(college.id)
                      ? 'text-red-500 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              </button>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${tierInfo.color}`}>
                {tierInfo.title}
              </div>
            </div>
          </div>

          {/* Probability */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <TierIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span className="font-medium text-gray-700">Admission Probability</span>
            </div>
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary-600 mr-2">
                {college.probability}%
              </div>
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                  style={{ width: `${college.probability}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{college.length}</p>
              </div>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tuition</p>
                <p className="font-semibold">{college.tuition}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Ranking</p>
                <p className="font-semibold">#{college.ranking?.national || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Acceptance Rate</p>
                <p className="font-semibold">{college.acceptanceRate}</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
            <div className="flex flex-wrap gap-2">
              {college.features?.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Requirements Status */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Requirements Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">STEM Designated</span>
                {college.stemDesignated ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">F-1 Eligible</span>
                {college.f1Eligible ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">3-Year Degree Accepted</span>
                {college.accepts3Year ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
              onClick={() => {
                window.open(`https://www.${college.university.toLowerCase().replace(/\s+/g, '')}.edu`, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
            <Button
              variant="outline"
              className="px-4 border-2 border-gray-300 hover:border-primary-300"
              onClick={() => {
                console.log('Save for comparison:', college.id);
              }}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </div> */}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-primary-600 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Your University Recommendations
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Based on your profile, here are the best-matched universities with admission probabilities
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(recommendations).map(([tier, colleges]) => {
              if (tier === 'total') return null;
              const config = tierConfig[tier];
              const count = colleges?.length || 0;

              return (
                <div key={tier} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${config.color}`}>
                      <config.icon className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{config.title}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Insights */}
          {aiInsights && (
            <div className="mb-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary-900 mb-3">
                    AI Analysis of Your Profile
                  </h3>
                  <div className="text-primary-800 leading-relaxed whitespace-pre-line">
                    {aiInsights}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/university-finder')}
                variant="outline"
                className="border-2 border-gray-300 hover:border-gray-400"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start Over
              </Button>
              <Button
                onClick={() => {
                  // Generate PDF report
                  console.log('Generate PDF report');
                }}
                variant="outline"
                className="border-2 border-primary-300 text-primary-600 hover:border-primary-400"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTier('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTier === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                All ({recommendations.total})
              </button>
              {Object.entries(tierConfig).map(([tier, config]) => {
                const count = recommendations[tier]?.length || 0;
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTier === tier
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {config.title} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredColleges.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {filteredColleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No universities found for this filter
              </h3>
              <p className="text-gray-600">
                Try selecting a different tier or view all recommendations
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Disclaimer:</strong> These recommendations are estimates based on available data and your profile.
            </p>
            <p>
              Admission decisions depend on many factors. Always verify requirements on official university websites before applying.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CollegeFinderResults;