// src/pages/college-finder/CollegeFinderResults.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Navigation from '@/components/static/Navigation';
import Footer from '@/components/static/Footer';
import { Button } from '@/components/ui/button';
import { getAssignedUniversities, getUserProfile } from '@/services/api.services';
import { isAuthenticated, getUser, clearCollegeFinderCache } from '@/lib/auth';
import { toast } from 'sonner';
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
  Trophy,
  Sparkles,
  Zap
} from 'lucide-react';

const CACHE_KEY_PREFIX = 'college_finder_cache_';

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when the message changes
    setDisplayedText('');
    setCurrentIndex(0);

    if (!text) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next <= text.length) {
          setDisplayedText(text.slice(0, next));
          return next;
        }
        clearInterval(interval);
        return prev;
      });
    }, 40); // Adjust speed here (40ms = natural typing speed)

    return () => clearInterval(interval);
  }, [text]);

  return (
    <h2 className="text-xl text-center max-w-2xl px-6 font-medium text-gray-800 leading-relaxed">
      <span>{displayedText}</span>
      {/* Blinking cursor */}
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-7 bg-primary-600 ml-1 animate-pulse align-middle" />
      )}
    </h2>
  );
};
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
  const [showApplyPopup, setShowApplyPopup] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const hasShownPopup = useRef(false);
  const user = getUser();
  const getUserId = user?._id;                    // safe, returns undefined if no user

  const userId = isAuthenticated() ? getUserId : 'guest';
  // console.log(user)
  const loadingMessages = [
    "Analyzing your academic profile and test scores...",
    "Evaluating your work experience and leadership roles...",
    "Matching you with top programs based on your goals...",
    "Calculating admission probabilities using advanced algorithms...",
    "Identifying scholarships and financial aid opportunities...",
    "Finalizing your personalized university recommendations...",
    "Scanning global university databases for best-fit options...",
    "Assessing program alignment with your career aspirations...",
    "Reviewing application deadlines and intake cycles...",
    "Evaluating campus culture and international support...",
    "Cross-referencing with alumni success outcomes...",
    "Generating your custom admission roadmap..."
  ];
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getUserProfile();
      if (response.success) {
        setUserProfile(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to fetch user profile.');
    }
    return null;
  }, []);
  useEffect(() => {
    if (isAuthenticated()) {
      fetchUserProfile();
    }
  }, [fetchUserProfile]);
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // FIXED: Save full backend data correctly
  const saveToCache = (results, insights = '') => {
    const cacheData = {
      recommendations: {
        ambitious: results.ambitious || [],
        target: results.target || [],
        safe: results.safe || [],
        backup: results.backup || [],
        total: results.total || 0
      },
      aiInsights: insights || 'Your personalized university matches are ready!',
      timestamp: Date.now(),
      userId
    };

    try {
      localStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(cacheData));
      console.log('Cache saved successfully for user:', userId);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  };

  // FIXED: Load full cached data
  const loadFromCache = () => {
    try {
      const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
      if (!raw) return false;

      const cached = JSON.parse(raw);

      // Expire after 24 hours
      if (Date.now() - cached.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
        return false;
      }

      if (cached.userId !== userId) return false;

      setRecommendations(cached.recommendations);
      setAiInsights(cached.aiInsights);
      setIsLoading(false);
      // toast.success('Welcome back!');
      return true;
    } catch (e) {
      console.warn('Cache load failed:', e);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      // 1. Try cache first → instant load
      if (loadFromCache()) return;

      // 2. Try location.state (from form)
      if (location.state?.recommendations) {
        const recs = location.state.recommendations;
        setRecommendations(recs);
        setAiInsights(location.state.aiInsights || '');
        saveToCache(recs, location.state.aiInsights);
        setIsLoading(false);
        return;
      }

      // 3. Call API (only if no cache & no state)
      try {
        const response = await getAssignedUniversities();

        if (response?.success && response?.data?.universityResults) {
          const results = response.data.universityResults;

          const formatted = {
            ambitious: results.ambitious || [],
            target: results.target || [],
            safe: results.safe || [],
            backup: results.backup || [],
            total: results.total || 0
          };

          setRecommendations(formatted);
          setAiInsights('Your AI-powered university matches are ready!');
          saveToCache(formatted, 'Your AI-powered university matches are ready!');
          if (isAuthenticated()) {
            await fetchUserProfile();  // This updates userProfile → UI shows correct credits left
          }
        } else {
          throw new Error('Invalid response');
        }
      } catch (err) {
        setError('Failed to load your university recommendations. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [location.state, userId]);

  // 30-second popup
  useEffect(() => {
    if (isLoading || error || hasShownPopup.current) return;
    const timer = setTimeout(() => {
      setShowApplyPopup(true);
      hasShownPopup.current = true;
    }, 30000);
    return () => clearTimeout(timer);
  }, [isLoading, error]);

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

  const exportToExcel = () => {
    const colleges = selectedTier === 'all' ? getAllColleges() : recommendations[selectedTier] || [];
    if (colleges.length === 0) return alert('No data to export');

    const rows = colleges.map(c => ({
      'University': c.university || 'N/A',
      'Program': c.program || 'N/A',
      'Tier': tierConfig[c.tier]?.title || c.tier,
      'Location': c.location || 'N/A',
      'Duration': c.length || 'N/A',
      'Admission Probability (%)': c.probability ?? 'N/A',
      'Tuition': c.tuition ? `$${c.tuition.toLocaleString()}` : 'N/A',
      'Acceptance Rate': c.acceptanceRate ? `${c.acceptanceRate}%` : 'N/A',
      'STEM': c.stemDesignated ? 'Yes' : 'No',
      'F-1 Visa': c.f1Eligible ? 'Yes' : 'No',
      'Key Features': (c.features || []).join(', ')
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 25 }));
    XLSX.utils.book_append_sheet(wb, ws, 'Recommendations');
    const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `My-Universities-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const tierConfig = {
    ambitious: { title: 'Ambitious', color: 'bg-red-100 text-red-700', icon: TrendingUp },
    target: { title: 'Target', color: 'bg-orange-100 text-orange-700', icon: Target },
    safe: { title: 'Safe', color: 'bg-blue-100 text-blue-700', icon: Shield },
    backup: { title: 'Backup', color: 'bg-green-100 text-green-700', icon: CheckCircle }
  };

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
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, label: 'Duration', value: college.length || 'N/A' },
              { icon: DollarSign, label: 'Tuition', value: college.tuition ? `${college.tuition.toLocaleString()}` : 'N/A' },
              { icon: Award, label: 'Ranking', value: college.ranking?.natioal ? `#${college.ranking.national}` : 'N/A' },
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

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
            <div className="flex flex-wrap gap-2">
              {(college.features || []).length > 0 ? college.features.map((f, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">{f}</span>
              )) : <span className="text-gray-500 text-xs">No features listed</span>}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {college.description || 'No description available.'}
            </p>
          </div>

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
                  {req.ok ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
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

     {isLoading && (
  <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
    
    {/* Message ABOVE the loader */}
    <div className="text-center mb-12 px-6">
      <p className="text-2xl font-bold text-gray-800 mb-3">
        Please wait — do not refresh or go back
      </p>
      <p className="text-lg text-gray-700">
        Your personalized university results are coming soon!
      </p>
      <p className="text-sm text-gray-500 mt-5">
        This may take up to a minute
      </p>
    </div>

    {/* Existing loader + brain */}
    <div className="relative mb-8">
      <Loader2 className="h-20 w-20 animate-spin text-primary-600" />
      <Brain className="absolute inset-0 m-auto h-10 w-10 text-primary-600" />
    </div>

    {/* Your existing rotating message stays exactly here, below the loader */}
   <TypewriterText text={loadingMessages[currentMessageIndex]} />
  </div>
)}

      {error && !isLoading && (
        <div className="pt-24 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <section className="py-12 px-4">
            {/* <div className="max-w-7xl mx-auto text-center">
              <Button
                size="lg"
                onClick={() => navigate('/applications/dashboard')}
                className="bg-gradient-to-r from-[#145044] to-[#0f3c34] hover:from-[#0f3c34] hover:to-[#0b3029] text-white font-bold text-lg px-12 py-7 rounded-2xl shadow-2xl hover:scale-105 transition-all"
              >
                <Sparkles className="h-7 w-7 mr-3" />
                Start Applying Now
              </Button>
            </div> */}
          </section>

          <section className="pt-10 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <Trophy className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-gray-900">Your Personalized University Matches</h1>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {Object.entries(recommendations).map(([tier, list]) => {
                  if (tier === 'total') return null;
                  const cfg = tierConfig[tier];
                  const count = Array.isArray(list) ? list.length : 0;
                  return (
                    <div key={tier} className="bg-white rounded-xl p-5 shadow-md text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${cfg.color}`}>
                        <cfg.icon className="h-6 w-6" />
                      </div>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-gray-600">{cfg.title}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-start gap-4 mb-10">
                <Button onClick={() => {
                  // Clear this user's specific cache
                  localStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
                  // toast.success('Cache cleared! Starting fresh...');
                  navigate('/university-finder');
                }} variant="outline" className='cursor-pointer hover:scale-105 transition-all'>
                  <ArrowLeft className="h-4 w-4 mr-2" /> New Query
                </Button>
                <Button onClick={exportToExcel} variant="outline" className='cursor-pointer hover:scale-105 transition-all'>
                  <Download className="h-4 w-4 mr-2" /> Export to Excel
                </Button>
                <Button onClick={() => {
                  navigate('/dashboard');
                }} className="bg-gradient-to-r from-[#145044] to-[#0f3c34] text-white font-semibold text-base  rounded-md shadow-2xl cursor-pointer hover:scale-105 transition-all">
                  <Sparkles className="h-4 w-4 mr-2" /> Start Applying Now
                </Button>
                <div className="ml-auto flex items-center">
                  <div className="bg-gradient-to-r from-[#145044] to-[#0f3c34] border-2 border-[#145044] rounded-md px-5 py-0 shadow-md">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-white" />
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-white">
                          {userProfile?.universityFinderLlmResponseLimit != null
                            ? Math.max(0, userProfile.universityFinderLlmResponseLimit)
                            : user?.universityFinderLlmResponseLimit != null
                              ? Math.max(0, user.universityFinderLlmResponseLimit)
                              : 0}
                        </p>
                        <p className="text-base font-medium text-white">
                          {(userProfile?.universityFinderLlmResponseLimit ?? user?.universityFinderLlmResponseLimit ?? 0) === 1
                            ? 'Credit'
                            : 'Credits'}{' '}
                          Left
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {filteredColleges.map(college => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>
            </div>
            <Button
              size="lg"
              className="w-1/2 mx-auto flex  cursor-pointer mt-6 bg-gradient-to-r from-[#145044] to-[#0f3c34] hover:from-[#0f3c34] hover:to-[#0b3029] text-white font-bold text-xl py-8 rounded-2xl shadow-xl"
              onClick={() => {
                setShowApplyPopup(false);
                navigate('/dashboard');
              }}
            >
              <Sparkles className="h-7 w-7 mr-3" />
              Start Applying Now
            </Button>
          </section>

          {showApplyPopup && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowApplyPopup(false)}>
              <div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 text-center animate-in fade-in zoom-in relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowApplyPopup(false)}
                  className="absolute top-6 right-6 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close popup"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <Sparkles className="h-20 w-20 text-[#145044] mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Your Future Starts Today!
                </h3>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  You’ve got incredible university matches. Don’t wait — turn your profile into acceptances!
                </p>
                <Button
                  size="lg"
                  className="w-full cursor-pointer bg-gradient-to-r from-[#145044] to-[#0f3c34] hover:from-[#0f3c34] hover:to-[#0b3029] text-white font-bold text-xl py-8 rounded-2xl shadow-xl"
                  onClick={() => {
                    setShowApplyPopup(false);
                    navigate('/dashboard');
                  }}
                >
                  <Sparkles className="h-7 w-7 mr-3" />
                  Start Applying Now
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Footer />
    </div>
  );
};

export default CollegeFinderResults;