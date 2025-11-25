// src/components/questionnaire/QuestionnaireForm.jsx
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/static/Navigation';
import Footer from '@/components/static/Footer';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  validateUniversityData,
} from '@/lib/universityDataLoader';
import { QuestionnaireSteps } from './QuestionnaireSteps';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';
import { isAuthenticated, setAuth, getUser } from '@/lib/auth';
import { updateUserProfile, getUserProfile } from '@/services/api.services';
import { toast } from 'sonner';
import LLMCreditUpgradeModal from './LLMCreditUpgradeModal';


// MUST MATCH THE KEY USED IN CollegeFinderResults.jsx
const CACHE_KEY_PREFIX = 'college_finder_cache_';

const QuestionnaireForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataValidation, setDataValidation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('signin');
  const [userProfile, setUserProfile] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formData, setFormData] = useState({
    degreeLevel: '',
    program: '',
    intakeMode: '',
    stemRequired: '',
    f1Required: '',
    gpa: '',
    gpaScale: '',
    university: '',
    universityTier: '',
    undergradDegree: '',
    mathProgrammingStats: '',
    degreeLength: '',
    mastersDegree: '',
    greTotal: '',
    greQuant: '',
    greVerbal: '',
    greAWA: '',
    gmatTotal: '',
    gmatQuant: '',
    englishTest: '',
    toefl: { reading: '', writing: '', speaking: '', listening: '' },
    ielts: { reading: '', writing: '', speaking: '', listening: '' },
    duolingo: { reading: '', writing: '', speaking: '', listening: '', total: '' },
    intake: '',
    duration: '',
    schoolBoard: '',
    averageMarks: '',
    satScore: '',
    actScore: '',
    extracurriculars: '',
    intakeTarget: '',
    testTaken: '',
    experienceYears: '',
    experienceIndustry: '',
    leadership: { has: '', details: '' },
    researchProjects: '',
    certifications: { has: '', details: '' },
    schoolSystem: '',
    classesMarks: '',
    satBreakdown: { ebrw: '', math: '', total: '' },
    actBreakdown: { english: '', math: '', reading: '', science: '', composite: '' },
    awards: '',
    specialCircumstances: '',
  });

  const [errors, setErrors] = useState({});

  const isAdvanced = formData.intakeMode?.includes('Advanced');
  const TOTAL_STEPS = useMemo(() => (isAdvanced ? 8 : 7), [isAdvanced]);
  const user = getUser();
  const getUserId = user?._id;                    // safe, returns undefined if no user
  const currentUserId = isAuthenticated() ? getUserId : 'guest';

  // console.log("user", currentUserId)
  // Check if user already has cached results
  const checkExistingCache = useCallback(() => {
    try {
      const cachedRaw = localStorage.getItem(`${CACHE_KEY_PREFIX}${currentUserId}`);
      if (!cachedRaw) return null;

      const cached = JSON.parse(cachedRaw);

      // Expire cache after 24 hours
      if (Date.now() - cached.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${currentUserId}`);
        return null;
      }

      if (cached.userId !== currentUserId) return null;

      return cached; // contains recommendations + aiInsights
    } catch (e) {
      console.warn('Failed to read cache:', e);
      return null;
    }
  }, [currentUserId]);

  useEffect(() => {
    try {
      const validation = validateUniversityData();
      setDataValidation(validation);
      if (validation.isValid) {
        setDataLoaded(true);
      }
    } catch (error) {
      setDataValidation({ isValid: false, issues: [error.message] });
    }
  }, []);

  // Clear irrelevant fields when degree changes
  useEffect(() => {
    if (formData.degreeLevel === 'Master') {
      setFormData(prev => ({
        ...prev,
        schoolBoard: '',
        averageMarks: '',
        satScore: '',
        actScore: '',
        testTaken: '',
        schoolSystem: '',
        classesMarks: '',
        satBreakdown: { ebrw: '', math: '', total: '' },
        actBreakdown: { english: '', math: '', reading: '', science: '', composite: '' },
        awards: '',
        specialCircumstances: '',
      }));
    } else if (formData.degreeLevel === 'Bachelor') {
      setFormData(prev => ({
        ...prev,
        gpa: '',
        gpaScale: '',
        university: '',
        universityTier: '',
        undergradDegree: '',
        mathProgrammingStats: '',
        degreeLength: '',
        mastersDegree: '',
        greTotal: '',
        greQuant: '',
        greVerbal: '',
        greAWA: '',
        gmatTotal: '',
        gmatQuant: '',
        experienceYears: '',
        experienceIndustry: '',
        leadership: { has: '', details: '' },
        researchProjects: '',
        certifications: { has: '', details: '' },
      }));
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      if (formData.degreeLevel === 'Master') {
        delete newErrors.schoolBoard;
        delete newErrors.averageMarks;
        delete newErrors.satScore;
        delete newErrors.actScore;
      } else if (formData.degreeLevel === 'Bachelor') {
        delete newErrors.gpa;
        delete newErrors.gpaScale;
        delete newErrors.university;
        delete newErrors.universityTier;
      }
      return newErrors;
    });
  }, [formData.degreeLevel]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateStep = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    const isMaster = formData.degreeLevel === 'Master';
    const isBachelor = formData.degreeLevel === 'Bachelor';

    switch (currentStep) {
      case 1:
        if (!formData.degreeLevel) {
          newErrors.degreeLevel = 'Please select Bachelor or Master';
          isValid = false;
        }
        break;
      case 2:
        if (!formData.program) {
          newErrors.program = 'Required';
          isValid = false;
        }
        break;
      case 3:
        if (!formData.intakeMode) {
          newErrors.intakeMode = 'Required';
          isValid = false;
        }
        break;
      case 4:
        if (isMaster) {
          if (!formData.stemRequired) newErrors.stemRequired = 'Required';
          if (!formData.f1Required) newErrors.f1Required = 'Required';
          if (!formData.gpa) newErrors.gpa = 'Required';
          if (!formData.gpaScale) newErrors.gpaScale = 'Required';
          if (!formData.university) newErrors.university = 'Required';
        } else if (isBachelor) {
          if (!formData.stemRequired) newErrors.stemRequired = 'Required';
          if (!formData.f1Required) newErrors.f1Required = 'Required';
          if (!formData.schoolBoard) newErrors.schoolBoard = 'Required';
          if (!formData.averageMarks) newErrors.averageMarks = 'Required';
        }
        break;
      case 5:
        if (isMaster) {
          if (!formData.universityTier) newErrors.universityTier = 'Required';
          if (!formData.undergradDegree) newErrors.undergradDegree = 'Required';
          if (['MSCS', 'MS Data Science'].includes(formData.program) && !formData.mathProgrammingStats) {
            newErrors.mathProgrammingStats = 'Required';
          }
          if (!formData.degreeLength) newErrors.degreeLength = 'Required';
          if (!formData.mastersDegree) newErrors.mastersDegree = 'Required';
        } else if (isBachelor) {
          if (!formData.testTaken) newErrors.testTaken = 'Required';
        }
        break;
      case 6:
        if (!formData.englishTest) {
          newErrors.englishTest = 'Please select an option';
          isValid = false;
        } else if (formData.englishTest === 'Yes') {
          const hasTOEFL = formData.toefl.reading && formData.toefl.writing && formData.toefl.speaking && formData.toefl.listening;
          const hasIELTS = formData.ielts.reading && formData.ielts.writing && formData.ielts.speaking && formData.ielts.listening;
          const hasDuolingo = formData.duolingo.reading && formData.duolingo.writing && formData.duolingo.speaking && formData.duolingo.listening && formData.duolingo.total;

          if (!hasTOEFL && !hasIELTS && !hasDuolingo) {
            newErrors.englishTest = 'Please fill at least one test completely';
            isValid = false;
          }
        }
        break;
      case 7:
        if (isBachelor) {
          if (!formData.extracurriculars) newErrors.extracurriculars = 'Required';
          if (!formData.intakeTarget) newErrors.intakeTarget = 'Required';
        }
        break;
      case 8:
        if (isMaster && !formData.intake) newErrors.intake = 'Required';
        break;
    }

    if (Object.keys(newErrors).length > 0) isValid = false;
    setErrors(newErrors);
    return isValid;
  }, [currentStep, formData]);

  const nextStep = () => {
    if (!validateStep()) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetUniversities();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getUserProfile();
      console.log(response)
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

  const checkAndHandleLimit = useCallback(async (profile) => {
    const limit = profile?.universityFinderLlmResponseLimit ?? 0;
    if (limit <= 0) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  }, []);

  const handleAuthSuccess = async (token, user) => {
    setAuth({ accessToken: token, user });
    setShowAuthModal(false);
    const profile = await fetchUserProfile();
    if (profile && !(await checkAndHandleLimit(profile))) {
      return;
    }
    await handleGetUniversities(true);
  };
  useEffect(() => {
    if (isAuthenticated() && !userProfile) {
      fetchUserProfile();
    }
  }, [isAuthenticated, userProfile]);
  useEffect(() => {
    if (userProfile?.universityFinderLlmResponseLimit > 0) {
      setShowUpgradeModal(false);
    }
  }, [userProfile]);
  // MAIN FUNCTION: Get Universities (with cache-first logic)
  const handleGetUniversities = async (skipAuthCheck = false) => {
    // 1. Check cache first — instant redirect if exists
    const cached = checkExistingCache();
    if (cached) {
      toast.success('Welcome back! Loading your saved recommendations...');
      navigate('/university-finder/results', {
        state: {
          recommendations: cached.recommendations,
          aiInsights: cached.aiInsights || 'Your personalized university matches are ready!',
        }
      });
      return;
    }

    // 2. Normal flow if no cache
    if (!skipAuthCheck && !isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }

    let profile = userProfile;
    if (!profile) {
      profile = await fetchUserProfile();
    }
    if (!profile || !(await checkAndHandleLimit(profile))) {
      return;
    }

    setIsSubmitting(true);
    try {
      const isMaster = formData.degreeLevel === 'Master';
      const isBachelor = formData.degreeLevel === 'Bachelor';

      const num = (v) => (v ? Number(v) : null);
      const boolEnum = (v) => (v === 'Yes' ? 'YES' : v === 'No' ? 'NO' : null);
      const tierMap = { 'IIT': 'IIT', 'NIT': 'NIT', 'Tier-1': 'TIER 1', 'Tier-2': 'TIER 2', 'Tier-3': 'TIER 3' };

      const transformedData = {
        degree: isMaster ? 'MASTER' : isBachelor ? 'BACHELOR' : null,
        degreeLength: isMaster
          ? formData.degreeLength === '3 years' ? '3 YEARS' : formData.degreeLength === '4 years' ? '4 YEARS' : null
          : null,
        intakeMode: formData.intakeMode?.includes('Advanced') ? 'ADVANCED' : 'BASIC',
        stemRequired: boolEnum(formData.stemRequired),
        f1Required: boolEnum(formData.f1Required),
        programDetails: {
          program: formData.program || null,
          intake: formData.intake || formData.intakeTarget || null,
          duration: formData.duration || null,
          validity: null,
        },
        schoolDetails: isBachelor
          ? {
            schoolName: formData.schoolSystem || null,
            board: formData.schoolBoard || null,
            yearOfPassing: null,
            percentage: formData.averageMarks ? num(formData.averageMarks.replace('%', '').trim()) : null,
          }
          : { schoolName: null, board: null, yearOfPassing: null, percentage: null },
        satDetails: {
          satPlan: null,
          satDate: null,
          satScoreCard: null,
          satScore: {
            readingWriting: num(formData.satBreakdown?.ebrw) || num(formData.satScore),
            math: num(formData.satBreakdown?.math),
            total: num(formData.satBreakdown?.total) || num(formData.satScore),
          },
        },
        actDetails: {
          actPlan: null,
          actDate: null,
          actScoreCard: null,
          actScore: {
            english: num(formData.actBreakdown?.english) || num(formData.actScore),
            math: num(formData.actBreakdown?.math),
            total: num(formData.actBreakdown?.composite) || num(formData.actScore),
          },
        },
        collegeDetails: isMaster
          ? {
            branch: formData.undergradDegree || null,
            highestDegree: formData.mastersDegree === 'Yes' ? 'MASTER' : 'BACHELOR',
            university: formData.university || null,
            college: formData.university || null,
            tier: formData.universityTier ? tierMap[formData.universityTier] || null : null,
            gpa: num(formData.gpa),
            gpaScale: formData.gpaScale === '4.0' ? 4 : formData.gpaScale === '10.0' ? 10 : formData.gpaScale === 'Percentage' ? 100 : null,
            toppersGPA: null,
            noOfBacklogs: null,
            admissionTerm: formData.intake || formData.intakeTarget || null,
            coursesApplying: formData.program ? [formData.program] : [],
          }
          : {
            branch: null,
            highestDegree: null,
            university: null,
            college: null,
            tier: null,
            gpa: null,
            gpaScale: null,
            toppersGPA: null,
            noOfBacklogs: null,
            admissionTerm: formData.intakeTarget || null,
            coursesApplying: formData.program ? [formData.program] : [],
          },
        greDetails: isMaster
          ? {
            grePlan: null,
            greDate: null,
            greScoreCard: null,
            greScore: {
              verbal: num(formData.greVerbal),
              quant: num(formData.greQuant),
              awa: num(formData.greAWA),
            },
            retakingGRE: null,
          }
          : {
            grePlan: null,
            greDate: null,
            greScoreCard: null,
            greScore: { verbal: null, quant: null, awa: null },
            retakingGRE: null,
          },
        gmatDetails: isMaster
          ? {
            gmatPlan: null,
            gmatDate: null,
            gmatScoreCard: null,
            gmatScore: {
              verbal: null,
              quant: num(formData.gmatQuant),
              total: num(formData.gmatTotal),
            },
            retakingGMAT: null,
          }
          : {
            gmatPlan: null,
            gmatDate: null,
            gmatScoreCard: null,
            gmatScore: { verbal: null, quant: null, total: null },
            retakingGMAT: null,
          },
        toeflDetails: {
          toeflPlan: null,
          toeflDate: null,
          toeflScore: formData.toefl.reading ? {
            reading: num(formData.toefl.reading),
            writing: num(formData.toefl.writing),
            speaking: num(formData.toefl.speaking),
            listening: num(formData.toefl.listening),
          } : null,
          retakingTOEFL: null
        },
        ieltsDetails: {
          ieltsPlan: null,
          ieltsDate: null,
          ieltsScore: formData.ielts.reading ? {
            reading: num(formData.ielts.reading),
            writing: num(formData.ielts.writing),
            speaking: num(formData.ielts.speaking),
            listening: num(formData.ielts.listening),
          } : null,
          retakingIELTS: null
        },
        duolingoDetails: {
          duolingoPlan: null,
          duolingoDate: null,
          duolingoScore: formData.duolingo.reading ? {
            reading: num(formData.duolingo.reading),
            writing: num(formData.duolingo.writing),
            speaking: num(formData.duolingo.speaking),
            listening: num(formData.duolingo.listening),
          } : null,
          retakingDuolingo: null
        },
        experienceDetails: isMaster
          ? {
            totalExperience: formData.experienceYears ? num(formData.experienceYears) : null,
            experienceIndustry: formData.experienceIndustry || null,
          }
          : { totalExperience: null, experienceIndustry: null },
        leadershipActivities: formData.leadership?.has === 'Yes'
          ? formData.leadership.details || 'Yes'
          : formData.leadership?.has === 'No' ? 'No' : null,
        researchPublications: formData.researchProjects || null,
        certifications: formData.certifications?.has === 'Yes'
          ? formData.certifications.details || 'Yes'
          : formData.certifications?.has === 'No' ? 'No' : null,
        visa: {
          countriesPlanningToApply: ['USA'],
          visaInterviewDate: null,
          visaInterviewLocation: null,
        },
      };

      await updateUserProfile(transformedData);

      const summary = isMaster
        ? `Your profile is competitive for mid-tier ${formData.program} programs with strong safe/backup options.`
        : `You have a solid high school profile with good chances at regional and mid-tier schools.`;

      navigate('/university-finder/results', {
        state: { responses: formData, aiInsights: summary }
      });
      toast.success('Profile updated and recommendations ready!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => (
    <QuestionnaireSteps
      currentStep={currentStep}
      formData={formData}
      errors={errors}
      handleInputChange={handleInputChange}
      dataValidation={dataValidation}
      isLastStep={currentStep === TOTAL_STEPS}
      setErrors={setErrors}
    />
  );

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-[#145044] rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Brain className="h-8 w-8 text-white" />
            <Loader2 className="absolute h-6 w-6 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold">Processing Your Profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[#145044] rounded-xl flex items-center justify-center mx-auto mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">University Questionnaire</h1>
            <p className="text-gray-600 mt-2">Complete to get AI-powered recommendations.</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-center items-center space-x-4 mb-4">
              {[...Array(TOTAL_STEPS)].map((_, i) => (
                <div key={i + 1} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= i + 1 ? 'bg-[#145044] text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {currentStep > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < TOTAL_STEPS - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${currentStep > i + 1 ? 'bg-[#145044]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">Step {currentStep} of {TOTAL_STEPS}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 md:p-8">{renderStepContent()}</div>
            <div className="px-6 md:px-8 py-4 bg-gray-50 border-t flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <Button onClick={prevStep} disabled={currentStep === 1} variant="outline" className="w-full md:w-auto">
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> Previous
              </Button>
              <div className="flex space-x-2">
                {[...Array(TOTAL_STEPS)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i + 1 <= currentStep ? 'bg-[#145044]' : 'bg-gray-300'}`} />
                ))}
              </div>
              <Button onClick={nextStep} className="w-full md:w-auto bg-[#145044] hover:bg-[#0f3c34]">
                {currentStep === TOTAL_STEPS ? (
                  <> <Sparkles className="h-4 w-4 mr-2" /> Get Universities </>
                ) : (
                  <> Continue <ArrowRight className="h-4 w-4 ml-2" /> </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-2xl font-bold text-center">Access Your Recommendations</DialogTitle>
            <p className="text-center text-gray-600 mt-2">Sign in or create an account to save your profile and get personalized universities.</p>
          </DialogHeader>
          <Tabs value={authTab} onValueChange={setAuthTab} className="p-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <SignInModal onSuccess={handleAuthSuccess} />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignUpModal onSuccess={handleAuthSuccess} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      {showUpgradeModal && (
        <LLMCreditUpgradeModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={async () => {
            await fetchUserProfile();
            setShowUpgradeModal(false);        // This line fixes everything
            await handleGetUniversities(true);
          }}
        />
      )}
    </div>
  );
};

export default QuestionnaireForm;