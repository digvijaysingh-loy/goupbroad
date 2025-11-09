// src/pages/college-finder/CollegeFinderResults.jsx
'use client';

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Navigation from '@/components/static/Navigation';
import Footer from '@/components/static/Footer';
import { Button } from '@/components/ui/button';
import { getAssignedUniversities } from '@/services/api.services';
import {
  MapPin,
  Clock,
  DollarSign,
  Award,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
  Shield,
  ArrowLeft,
  Download,
  Brain,
  Loader2,
  Users,
  Trophy
} from 'lucide-react';

const CollegeFinderResults = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTier, setSelectedTier] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [recommendations, setRecommendations] = useState({
    ambitious: [],
    target: [],
    safe: [],
    backup: [],
    total: 0
  });
  const [aiInsights, setAiInsights] = useState('');
  const [error, setError] = useState(null);


  const loadingMessages = [
    "Analyzing your academic profile and test scores...",
    "Evaluating your work experience and leadership roles...",
    "Matching you with top programs based on your goals and background...",
    "Calculating admission probabilities using advanced algorithms...",
    "Identifying scholarships and financial aid opportunities...",
    "Finalizing your personalized university recommendations...",
    "Scanning global university databases for best-fit options...",
    "Assessing program curriculum alignment with your career aspirations...",
    "Reviewing application deadlines and intake cycles...",
    "Evaluating campus location, culture, and international student support...",
    "Cross-referencing your preferences with alumni success outcomes...",
    "Generating your custom admission roadmap and next steps..."
  ];

  // Cycle loading message every 5 seconds
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Fetch university recommendations from backend
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAssignedUniversities(); 

        if (response?.success && response?.data?.universityResults) {
          const results = response.data.universityResults;
          setRecommendations({
            ambitious: results.ambitious || [],
            target: results.target || [],
            safe: results.safe || [],
            backup: results.backup || [],
            total: results.total || 0
          });
        } else {
          throw new Error('Invalid response from server');
        }

        // Use AI insights passed from form (optional)
        setAiInsights(location.state?.aiInsights || 'Your profile has been successfully analyzed. Here are your personalized university matches.');

      } catch (err) {
        console.error('Failed to fetch university recommendations:', err);
        setError('Unable to load recommendations. Please try again later or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [location.state]);

  // Filter logic
  const getAllColleges = () => [
    ...(recommendations.ambitious || []),
    ...(recommendations.target || []),
    ...(recommendations.safe || []),
    ...(recommendations.backup || [])
  ];

  const getFilteredColleges = () => {
    if (selectedTier === 'all') return getAllColleges();
    return recommendations[selectedTier] || [];
  };

  const filteredColleges = getFilteredColleges();

  // Export to Excel
  const exportToExcel = () => {
    const colleges = selectedTier === 'all' ? getAllColleges() : recommendations[selectedTier] || [];
    if (colleges.length === 0) {
      alert('No universities to export.');
      return;
    }

    const rows = colleges.map(c => ({
      'University': c.university || 'N/A',
      'Program': c.program || 'N/A',
      'Tier': tierConfig[c.tier]?.title || c.tier,
      'Location': c.location || 'N/A',
      'Duration': c.length || 'N/A',
      'Admission Probability (%)': c.probability ?? 'N/A',
      'National Ranking': c.ranking?.national ? `#${c.ranking.national}` : 'N/A',
      'Tuition': c.tuition ? `$${c.tuition.toLocaleString()}` : 'N/A',
      'Acceptance Rate': c.acceptanceRate ? `${c.acceptanceRate}%` : 'N/A',
      'STEM Designated': c.stemDesignated ? 'Yes' : 'No',
      'F-1 Eligible': c.f1Eligible ? 'Yes' : 'No',
      'Accepts 3-Year Degree': c.accepts3Year ? 'Yes' : 'No',
      'Key Features': (c.features || []).join(', ')
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(wb, ws, 'University Recommendations');

    const fileName = `University-Recommendations-${new Date().toISOString().split('T')[0]}.xlsx`;
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, fileName);
  };

  // Tier configuration
  const tierConfig = {
    ambitious: { title: 'Ambitious', color: 'bg-red-100 text-red-700', icon: TrendingUp },
    target: { title: 'Target', color: 'bg-orange-100 text-orange-700', icon: Target },
    safe: { title: 'Safe', color: 'bg-blue-100 text-blue-700', icon: Shield },
    backup: { title: 'Backup', color: 'bg-green-100 text-green-700', icon: CheckCircle }
  };

  // College Card Component
  const CollegeCard = ({ college }) => {
    const cfg = tierConfig[college.tier] || tierConfig.safe;
    const Icon = cfg.icon;

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 group">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {college.university}
              </h3>
              <p className="text-lg text-primary-600 font-semibold mb-2">{college.program}</p>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{college.location}</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.color}`}>
              {cfg.title}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-2 text-gray-600" />
              <span className="font-medium text-gray-700">Admission Probability</span>
            </div>
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary-600 mr-2">
                {college.probability}%
              </div>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${college.probability}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, label: 'Duration', value: college.length || 'N/A' },
              { icon: DollarSign, label: 'Tuition', value: college.tuition ? `$${college.tuition.toLocaleString()}` : 'N/A' },
              { icon: Award, label: 'Ranking', value: college.ranking?.national ? `#${college.ranking.national}` : 'N/A' },
              { icon: Users, label: 'Acceptance Rate', value: college.acceptanceRate ? `${college.acceptanceRate}%` : 'N/A' }
            ].map((item, i) => (
              <div key={i} className="flex items-center">
                <item.icon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">{item.label}</p>
                  <p className="font-medium text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key Features */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
            <div className="flex flex-wrap gap-2">
              {(college.features || []).length > 0 ? (
                college.features.map((f, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                    {f}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-xs">No features listed</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {college.description || 'No description available.'}
            </p>
          </div>

          {/* Requirements Status */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Eligibility Check</h4>
            <div className="space-y-2 text-sm">
              {[
                { label: 'STEM Designated', ok: college.stemDesignated },
                { label: 'F-1 Visa Eligible', ok: college.f1Eligible },
                { label: 'Accepts 3-Year Degree', ok: college.accepts3Year }
              ].map((req, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-600">{req.label}</span>
                  {req.ok ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navigation />

      {/* LOADING STATE */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center px-6">
          <div className="relative mb-8">
            <Loader2 className="h-20 w-20 animate-spin text-primary-600" strokeWidth={1.5} />
            <Brain className="absolute inset-0 m-auto h-10 w-10 text-primary-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-gray-800 text-center max-w-3xl">
            {loadingMessages[currentMessageIndex]}
          </h2>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-3">Something Went Wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
              <Button onClick={() => navigate('/college-finder')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Form
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS PAGE */}
      {!isLoading && !error && (
        <>
          {/* Header */}
          <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="h-12 w-12 text-primary-600 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Your Personalized University Matches
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                AI-powered recommendations based on your profile, test scores, and preferences.
              </p>
            </div>
          </section>

          {/* Summary Stats */}
          <section className="px-4 sm:px-6 lg:px-8 mb-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(recommendations).map(([tier, list]) => {
                  if (tier === 'total') return null;
                  const cfg = tierConfig[tier];
                  const count = Array.isArray(list) ? list.length : 0;
                  return (
                    <div key={tier} className="bg-white rounded-xl p-5 shadow-md border border-gray-100 text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${cfg.color}`}>
                        <cfg.icon className="h-6 w-6" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600">{cfg.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* AI Insights */}
          {/* {aiInsights && (
            <section className="px-4 sm:px-6 lg:px-8 mb-10">
              <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary-900 mb-2">AI Profile Analysis</h3>
                      <p className="text-primary-800 leading-relaxed">{aiInsights}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )} */}

          {/* Action Buttons & Filters */}
          <section className="px-4 sm:px-6 lg:px-8 mb-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/college-finder')}
                  variant="outline"
                  className="border-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="border-2 border-primary-300 text-primary-600 hover:bg-primary-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setSelectedTier('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTier === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`}
                >
                  All ({recommendations.total})
                </button>
                {Object.entries(tierConfig).map(([tier, cfg]) => {
                  const count = recommendations[tier]?.length || 0;
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTier === tier
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border'
                      }`}
                    >
                      {cfg.title} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* University Cards */}
          <section className="pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {filteredColleges.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-8">
                  {filteredColleges.map((college) => (
                    <CollegeCard key={college.id} college={college} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gray-100 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No universities found
                  </h3>
                  <p className="text-gray-600">
                    Try selecting a different tier or refresh the page.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Disclaimer */}
          <section className="py-8 bg-gray-100 border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
              <p className="font-medium mb-1">Disclaimer:</p>
              <p>
                These are AI-generated estimates. Always verify deadlines, requirements, and eligibility on official university websites before applying.
              </p>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default CollegeFinderResults;