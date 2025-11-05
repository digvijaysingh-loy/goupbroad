


// import { useState, useCallback, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import OpenAI from 'openai';
// import Navigation from '@/components/static/Navigation';
// import Footer from '@/components/static/Footer';
// import { Button } from '@/components/ui/button';
// import {
//   BookOpen,
//   Brain,
//   Sparkles,
//   CheckCircle,
//   Clock,
//   User,
//   GraduationCap,
//   Briefcase,
//   Globe,
//   DollarSign,
//   Award,
//   Target,
//   ArrowRight,
//   AlertCircle,
//   Loader2,
//   Star,
//   TrendingUp,
//   BarChart3,
//   Users,
//   MapPin,
//   Calendar,
//   FileText,
//   Building2,
//   Lightbulb,
//   Shield,
//   Rocket,
//   ChevronRight,
//   Check
// } from 'lucide-react';
// import collegeData from '@/data/collegeData';
// import {
//   validateUniversityData,
//   getProgramDisplayNames
// } from '@/lib/universityDataLoader';

// // Custom hook to handle form inputs without cursor jumping
// const useFormInput = (initialValue = '') => {
//   const [value, setValue] = useState(initialValue);
//   const inputRef = useRef(null);

//   const handleChange = useCallback((newValue) => {
//     setValue(newValue);
//   }, []);

//   return [value, handleChange, inputRef];
// };

// // InputField component that doesn't lose cursor focus
// const InputField = ({ label, field, type = 'text', options = null, required = false, placeholder = '', description = '', value, onChange, hasError }) => {
//   const inputRef = useRef(null);

//   const handleInputChange = useCallback((e) => {
//     const newValue = e.target.value;
//     onChange(field, newValue);
//   }, [field, onChange]);

//   const handleRadioClick = useCallback((option) => {
//     onChange(field, option);
//   }, [field, onChange]);

//   if (type === 'select') {
//     return (
//       <div className="space-y-2">
//         <label className="block text-sm font-medium text-gray-900">
//           {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         {description && <p className="text-xs text-gray-500">{description}</p>}
//         <select
//           ref={inputRef}
//           value={value || ''}
//           onChange={handleInputChange}
//           className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
//             hasError
//               ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
//               : value
//               ? 'border-[#145044] focus:border-[#145044] focus:ring-[#145044]/20'
//               : 'border-gray-300 focus:border-[#145044] focus:ring-[#145044]/20'
//           }`}
//         >
//           <option value="">Select {label}</option>
//           {options.map(option => (
//             <option key={option} value={option}>{option}</option>
//           ))}
//         </select>
//         {hasError && (
//           <p className="text-red-600 text-xs flex items-center">
//             <AlertCircle className="h-3 w-3 mr-1" />
//             {hasError}
//           </p>
//         )}
//       </div>
//     );
//   }

//   if (type === 'radio') {
//     return (
//       <div className="space-y-2">
//         <label className="block text-sm font-medium text-gray-900">
//           {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         {description && <p className="text-xs text-gray-500">{description}</p>}
//         <div className="grid grid-cols-2 gap-2">
//           {options.map(option => (
//             <button
//               key={option}
//               type="button"
//               onClick={() => handleRadioClick(option)}
//               className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
//                 value === option
//                   ? 'border-[#145044] bg-[#145044] text-white'
//                   : 'border-gray-300 bg-white text-gray-700 hover:border-[#145044]'
//               }`}
//             >
//               {option}
//             </button>
//           ))}
//         </div>
//         {hasError && (
//           <p className="text-red-600 text-xs flex items-center">
//             <AlertCircle className="h-3 w-3 mr-1" />
//             {hasError}
//           </p>
//         )}
//       </div>
//     );
//   }

//   if (type === 'checkbox') {
//     const currentValue = Array.isArray(value) ? value : [];
//     return (
//       <div className="space-y-2">
//         <label className="block text-sm font-medium text-gray-900">
//           {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         {description && <p className="text-xs text-gray-500">{description}</p>}
//         <div className="space-y-2">
//           {options.map(option => (
//             <div key={option} className="flex items-center">
//               <input
//                 type="checkbox"
//                 id={`${field}-${option}`}
//                 checked={currentValue.includes(option)}
//                 onChange={(e) => {
//                   let newValue = [...currentValue];
//                   if (e.target.checked) {
//                     newValue.push(option);
//                   } else {
//                     newValue = newValue.filter(v => v !== option);
//                   }
//                   onChange(field, newValue);
//                 }}
//                 className="h-4 w-4 text-[#145044] focus:ring-[#145044] border-gray-300 rounded"
//               />
//               <label htmlFor={`${field}-${option}`} className="ml-2 text-sm text-gray-700">
//                 {option}
//               </label>
//             </div>
//           ))}
//         </div>
//         {hasError && (
//           <p className="text-red-600 text-xs flex items-center">
//             <AlertCircle className="h-3 w-3 mr-1" />
//             {hasError}
//           </p>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-2">
//       <label className="block text-sm font-medium text-gray-900">
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>
//       {description && <p className="text-xs text-gray-500">{description}</p>}
//       <input
//         ref={inputRef}
//         type={type}
//         value={value || ''}
//         onChange={handleInputChange}
//         placeholder={placeholder}
//         autoComplete="off"
//         className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
//           hasError
//             ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
//             : value
//             ? 'border-[#145044] focus:border-[#145044] focus:ring-[#145044]/20'
//             : 'border-gray-300 focus:border-[#145044] focus:ring-[#145044]/20'
//         }`}
//       />
//       {hasError && (
//         <p className="text-red-600 text-xs flex items-center">
//           <AlertCircle className="h-3 w-3 mr-1" />
//           {hasError}
//         </p>
//       )}
//     </div>
//   );
// };

// const QuestionnaireForm = () => {
//   const navigate = useNavigate();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [questionType, setQuestionType] = useState(''); // 'base' or 'advanced'
//   const [dataLoaded, setDataLoaded] = useState(false);
//   const [dataValidation, setDataValidation] = useState(null);
//   const [availablePrograms, setAvailablePrograms] = useState([]);
//   const [formData, setFormData] = useState({
//     // Base Questions (1-23)
//     program: '',
//     stemRequired: '',
//     f1Required: '',
//     gpa: '',
//     gpaScale: '',
//     university: '',
//     universityTier: '',
//     degree: '',
//     mathProgrammingStats: '',
//     degreeLength: '',
//     mastersDegree: '',
//     mastersDetails: '',
//     greTotal: '',
//     greQuant: '',
//     greVerbal: '',
//     greAWA: '',
//     gmatTotal: '',
//     gmatQuant: '',
//     gmatVerbal: '',
//     gmatAWA: '',
//     gmatIR: '',
//     englishTest: '',
//     englishScore: '',
//     intakeYear: '',
//     intakeSeason: '',
//     intakeMode: '',
//     preferredRegions: [],
//     citySize: '',
//     climate: '',
//     campusFactors: [],
//     careerGoal: '',
//     targetRoles: '',
//     intake: '',
//     duration: '',
//     targetIndustry: '',
//     salaryExpectation: '',
//     rankingImportance: '',
//     targetUniversities: '',
//     programFocus: '',
//     additionalRequirements: '',
//     // Advanced Questions (24-37)
//     workExperience: '',
//     industries: '',
//     brandFirms: '',
//     leadership: '',
//     promotions: '',
//     research: '',
//     publications: '',
//     certifications: '',
//     citizenship: '',
//     gender: '',
//     demographicGroup: '',
//     budgetConstraints: '',
//     maxBudget: '',
//     scholarships: '',
//     universityType: ''
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Load and validate university data on component mount
//   useEffect(() => {
//     console.log('🚀 Loading university data...');

//     try {
//       // Validate data
//       const validation = validateUniversityData();
//       setDataValidation(validation);

//       if (validation.isValid) {
//         // Load available programs
//         const programs = getProgramDisplayNames();
//         setAvailablePrograms(programs);
//         setDataLoaded(true);

//         console.log('✅ University data loaded successfully!');
//         console.log(`📊 Available programs: ${programs.length}`);
//         console.log('🎓 Programs:', programs);
//       } else {
//         console.error('❌ Data validation failed:', validation.issues);
//       }
//     } catch (error) {
//       console.error('❌ Error loading university data:', error);
//       setDataValidation({
//         isValid: false,
//         issues: ['Failed to load data: ' + error.message]
//       });
//     }
//   }, []);

//   // Stable callback for handling input changes
//   const handleInputChange = useCallback((field, value) => {
//     console.log(`📝 Field updated: ${field} = ${value}`);

//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));

//     // Clear error for this field
//     if (errors[field]) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }
//   }, [errors]);

//   // Parse AI response from web search into structured format
//   const parseAIResponseFromWebSearch = (aiText) => {
//     console.log('🔍 Parsing AI JSON response...');

//     try {
//       const rawList = JSON.parse(aiText);
//       if (!Array.isArray(rawList) || rawList.length !== 20) {
//         throw new Error('Invalid response format: Expected array of 20 objects');
//       }
//       console.log("rawList",rawList)
//       const tiers = { ambitious: [], target: [], safe: [], backup: [] };
//       rawList.forEach((item, index) => {
//         if (typeof item !== 'object' || item === null) return;
//         const tier = item.Chance ? item.Chance.toLowerCase() : '';
//         if (!tiers[tier]) return;
//         console.log("item listed", item)
//         const university = {
//           id: `${tier}-${tiers[tier].length}`,
//           name: item.University,
//           university: item.University,
//           program: item.Program || formData.program || 'MBA',
//           tier: tier,
//           length:item.Length,
//           probability: Math.round(tier === 'ambitious' ? 15 + Math.random() * 10 :
//                       tier === 'target' ? 35 + Math.random() * 15 :
//                       tier === 'safe' ? 60 + Math.random() * 20 :
//                       80 + Math.random() * 15),
//           ranking: { national: null },
//           location: item.Location,
//           tuition: item.Tuition,
//           description: `${formData.program || 'MBA'} program`,
//           acceptanceRate: null,
//           stemDesignated: item.STEM === 'Yes',
//           f1Eligible: item["F-1"] === 'Yes',
//           accepts3Year: true,
//           features: ['Research Opportunities', 'Career Services']
//         };

//         if (tiers[tier].length < 5) {
//           tiers[tier].push(university);
//         }
//       });

//       const total = Object.values(tiers).reduce((sum, tier) => sum + tier.length, 0);
//       console.log(`📊 Parsed ${total} web search recommendations:`, tiers);

//       return { ...tiers, total };
//     } catch (error) {
//       console.error('❌ Error parsing AI JSON response:', error);
//       return { ambitious: [], target: [], safe: [], backup: [], total: 0 };
//     }
//   };

//   const initializeOpenAI = () => {
//     const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
//     console.log('🔑 OpenAI API Key:', apiKey ? 'Available' : 'Missing');

//     if (!apiKey) {
//       console.warn('⚠️ OpenAI API key not found.');
//       return null;
//     }

//     try {
//       const client = new OpenAI({
//         apiKey: apiKey,
//         dangerouslyAllowBrowser: true
//       });
//       console.log('✅ OpenAI initialized successfully');
//       return client;
//     } catch (error) {
//       console.error('❌ Error initializing OpenAI:', error);
//       return null;
//     }
//   };

//   const generateRecommendations = async () => {
//     console.log('🚀 Starting AI recommendation generation with ChatML...');
//     setIsSubmitting(true);

//     try {
//       // Prepare ChatML prompt according to client specifications with web search
//       const systemPrompt = `You are an expert U.S. admissions consultant specializing in helping international students (esp. Indian applicants) secure admission into top U.S. universities.

// CRITICAL INSTRUCTIONS:
// - Use ONLY your most current knowledge from 2024-2025 to provide accurate, real-time information
// - Research current tuition fees, university rankings, and program details for 2024-2025 academic year
// - DO NOT use any pre-stored database or outdated information
// - Provide actual universities with real current data including exact tuition costs, admission requirements, and program details
// - Focus on universities that actually offer the requested program with current STEM designation and F-1 visa support status
// - IMPORTANT: Do NOT ask for additional information. Use the provided profile data to immediately generate recommendations
// - MUST respond with exactly 20 universities in the specified format - no questions, no additional requests

// SCORING FRAMEWORK BY PROGRAM GROUPS:

// GROUP 1: Business/Finance Programs (MS Finance, MS Accounting, MBA Finance & Accounting)
// Total: 1000 points
// • Standardized Tests (GMAT/GRE): 300 points (30%)
// • GPA: 250 points (25%)
// • Work Experience: 250 points (25%)
// • Professional Certifications: 100 points (10%)
// • Diversity/Leadership: 100 points (10%)

// GROUP 2: Marketing & Management Programs (MS Marketing, MS Management, MS Eng Management, MBA Marketing, MBA Management)
// Total: 1000 points
// • Work Experience: 350 points (35%)
// • Standardized Tests: 250 points (25%)
// • GPA: 200 points (20%)
// • Leadership Experience: 150 points (15%)
// • Industry Relevance: 50 points (5%)

// GROUP 3: Analytics & Data Programs (MS Business Analytics, MS Data Science, MBA Business Analytics)
// Total: 1000 points
// • Technical Skills/GPA: 300 points (30%)
// • Standardized Tests: 250 points (25%)
// • Work Experience: 200 points (20%)
// • Technical Certifications: 150 points (15%)
// • Projects/Portfolio: 100 points (10%)

// GROUP 4: Computer Science & Information Systems (CS, Information Systems & AI)
// Total: 1000 points
// • GPA: 300 points (30%)
// • GRE/Technical Tests: 250 points (25%)
// • Research/Projects: 250 points (25%)
// • Work Experience: 150 points (15%)
// • Technical Certifications: 50 points (5%)

// GROUP 5: Core Engineering (Civil, Industrial, Mechanical, Electrical, Biomedical Engineering)
// Total: 1000 points
// • GPA: 300 points (30%)
// • Research Experience: 250 points (25%)
// • GRE Score: 200 points (20%)
// • Work Experience: 150 points (15%)
// • Technical Projects: 100 points (10%)

// SCORING INTERPRETATION:
// • 900-1000: Extremely competitive for top programs
// • 800-899: Competitive for top programs, strong for mid-tier
// • 700-799: Competitive for mid-tier, strong for regional programs
// • 600-699: Competitive for regional programs
// • Below 600: May need to strengthen profile

// TIER ASSIGNMENT RULES:
// Calculate user's score based on their program group, then assign universities:
// - Ambitious (10–25% chance): Top universities where user score is 100-200 points below typical admits
// - Target (25–50% chance): Universities matching user's score range
// - Safe (50–80% chance): Universities where user score is 100-200 points above typical admits
// - Backup (>80% chance): Universities where user score significantly exceeds typical admits

// Output exactly 20 programs distributed as: 5 Ambitious, 5 Target, 5 Safe, 5 Backup

// Output Format:
// RESPOND ONLY with a valid JSON array of exactly 20 objects. Each object must have the following keys exactly as specified: "University", "Program", "Length", "Tuition", "Location", "STEM", "F-1", "Chance".
// The "Chance" value must be one of: "Ambitious", "Target", "Safe", "Backup".
// Include exactly 5 objects for each "Chance" category.
// Use real, accurate data from your web searches.
// Do not include any text, explanations, or content outside the JSON array. The response must be parseable as JSON directly.`;

//       // Create user profile message - let GPT search for real universities
//       const userMessage = `User Profile:
// Program: ${formData.program}
// Intake Mode: ${formData.intakeMode}
// STEM Required: ${formData.stemRequired}
// F-1 Required: ${formData.f1Required}
// GPA: ${formData.gpa} (${formData.gpaScale} scale)
// University: ${formData.university}
// University Tier: ${formData.universityTier}
// Degree: ${formData.degree}
// ${formData.mathProgrammingStats ? `Math/Programming/Stats: ${formData.mathProgrammingStats}` : ''}
// Degree Length: ${formData.degreeLength}
// Masters Degree: ${formData.mastersDegree}
// GRE Total: ${formData.greTotal || 'Not provided'}
// GRE Quant: ${formData.greQuant || 'Not provided'}
// GRE Verbal: ${formData.greVerbal || 'Not provided'}
// GRE AWA: ${formData.greAWA || 'Not provided'}
// GMAT Total: ${formData.gmatTotal || 'Not provided'}

// CRITICAL TASK:
// Immediately provide 20 real universities with ${formData.program} programs for 2024-2025. Do NOT ask questions.

// IMMEDIATE REQUIREMENTS:
// - Provide exactly 20 universities with current tuition fees (no estimates)
// - Use real 2024-2025 rankings and program data
// - Include only STEM-designated programs with F-1 eligibility
// - Distribute as: 5 Ambitious, 5 Target, 5 Safe, 5 Backup
// - Base scoring on provided profile data

// RESPOND ONLY with a valid JSON array of exactly 20 objects. Each object must have the following keys exactly as specified: "University", "Program", "Length", "Tuition", "Location", "STEM", "F-1", "Chance".
// The "Chance" value must be one of: "Ambitious", "Target", "Safe", "Backup".
// Include exactly 5 objects for each "Chance" category.
// Do not include any text, explanations, or content outside the JSON array. The response must be parseable as JSON directly.`;

//       console.log('📝 ChatML System Prompt:', systemPrompt);
//       console.log('📊 User Message:', userMessage);

//       const client = initializeOpenAI();
//       let aiRecommendations = '';

//       if (client) {
//         try {
//           const response = await client.responses.create({
//             model: "gpt-5",
//             reasoning: { effort: "low" },
//             tools: [
//               { type: "web_search" }
//             ],
//             input: `${systemPrompt}\n\n${userMessage}`
//           });

//           aiRecommendations = response.output_text || '';
//           console.log('🤖 AI Recommendations:', aiRecommendations);
//         } catch (apiError) {
//           console.error('❌ OpenAI API Error:', apiError);
//           alert('AI recommendation service is currently unavailable. Please try again later or contact support.');
//           setIsSubmitting(false);
//           return;
//         }
//       } else {
//         alert('AI recommendation service requires API configuration. Please contact support.');
//         setIsSubmitting(false);
//         return;
//       }

//       // Parse AI response and create structured recommendations
//       const structuredRecommendations = parseAIResponseFromWebSearch(aiRecommendations);

//       // Create a clean summary instead of full AI response
//       const aiSummary = `Based on your profile and the scoring framework for ${formData.program} programs, here are the 20 university recommendations distributed across the 4 tiers:

// Your calculated score puts you in a competitive position for mid-tier programs, with good opportunities at regional universities and reach potential for some top-tier institutions.

// The recommendations consider your:
// • GPA: ${formData.gpa} (${formData.gpaScale} scale)
// • Test Scores: GRE ${formData.greTotal || 'N/A'}, GMAT ${formData.gmatTotal || 'N/A'}
// • University Background: ${formData.university} (${formData.universityTier})
// • Program Focus: ${formData.program}

// This distribution provides a balanced selection of universities across different tiers, maximizing your chances of admission while considering your specific profile and program requirements.`;

//       // Navigate to results with AI-generated recommendations
//       navigate('/college-finder/results', {
//         state: {
//           recommendations: structuredRecommendations,
//           responses: formData,
//           aiInsights: aiSummary
//         }
//       });

//     } catch (error) {
//       console.error('❌ Error generating AI recommendations:', error);
//       alert('Error generating recommendations. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const nextStep = () => {
//     if (currentStep < 8) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       generateRecommendations();
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Program Selection</h2>
//               <p className="text-gray-600 text-sm">Which program do you want to apply for?</p>
//             </div>

//             <InputField
//               label="Q1. Which program do you want to apply for?"
//               field="program"
//               type="select"
//               options={['MSCS', 'MBA', 'MS Finance', 'MS Marketing', 'MS Data Science', 'Engineering', 'MS Business Analytics', 'MS Management', 'MS Accounting']}
//               required
//               description="Select your target program for higher education"
//               value={formData.program}
//               onChange={handleInputChange}
//               hasError={errors.program}
//             />
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Intake Mode Selection</h2>
//               <p className="text-gray-600 text-sm">Choose your questionnaire type</p>
//             </div>

//             <InputField
//               label="Q2. Do you want Base Questions (short intake) or Advanced Questions (detailed intake)?"
//               field="intakeMode"
//               type="radio"
//               options={['Base Questions (Quick)', 'Advanced Questions (Detailed)']}
//               required
//               description="Base Questions: Essential information only. Advanced Questions: Comprehensive profile analysis."
//               value={formData.intakeMode}
//               onChange={(field, value) => {
//                 handleInputChange(field, value);
//                 setQuestionType(value.includes('Base') ? 'base' : 'advanced');
//               }}
//               hasError={errors.intakeMode}
//             />
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Base Questions - Part 1</h2>
//               <p className="text-gray-600 text-sm">Essential requirements and eligibility</p>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="Q3. Do you require only STEM-designated programs?"
//                 field="stemRequired"
//                 type="radio"
//                 options={['Yes', 'No']}
//                 required
//                 value={formData.stemRequired}
//                 onChange={handleInputChange}
//                 hasError={errors.stemRequired}
//               />

//               <InputField
//                 label="Q4. Do you require only F-1 visa eligible programs?"
//                 field="f1Required"
//                 type="radio"
//                 options={['Yes', 'No']}
//                 required
//                 value={formData.f1Required}
//                 onChange={handleInputChange}
//                 hasError={errors.f1Required}
//               />
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="Q5. What is your undergraduate GPA?"
//                 field="gpa"
//                 placeholder="e.g., 3.5 or 8.5"
//                 required
//                 description="Your cumulative grade point average (with scale)"
//                 value={formData.gpa}
//                 onChange={handleInputChange}
//                 hasError={errors.gpa}
//               />

//               <InputField
//                 label="GPA Scale"
//                 field="gpaScale"
//                 type="select"
//                 options={['4.0', '10.0', 'Percentage']}
//                 required
//                 value={formData.gpaScale}
//                 onChange={handleInputChange}
//                 hasError={errors.gpaScale}
//               />
//             </div>

//             <InputField
//               label="Q6. What is the name of your undergraduate university?"
//               field="university"
//               placeholder="e.g., IIT Delhi, University of Mumbai"
//               required
//               value={formData.university}
//               onChange={handleInputChange}
//               hasError={errors.university}
//             />
//           </div>
//         );

//       case 4:
//         return (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Base Questions - Part 2</h2>
//               <p className="text-gray-600 text-sm">Academic background and degree information</p>
//             </div>

//             <InputField
//               label="Q7. What is the tier of your university?"
//               field="universityTier"
//               type="select"
//               options={['IIT', 'NIT', 'Tier-1', 'Tier-2', 'Tier-3']}
//               required
//               value={formData.universityTier}
//               onChange={handleInputChange}
//               hasError={errors.universityTier}
//             />

//             <InputField
//               label="Q8. What is the name of your undergraduate degree?"
//               field="degree"
//               placeholder="e.g., Computer Science, Mechanical Engineering, Commerce"
//               required
//               value={formData.degree}
//               onChange={handleInputChange}
//               hasError={errors.degree}
//             />

//             {(formData.program === 'MSCS' || formData.program === 'MS Data Science') && (
//               <InputField
//                 label="Q9. Did your degree include Mathematics, Programming, and Statistics coursework?"
//                 field="mathProgrammingStats"
//                 type="radio"
//                 options={['Yes', 'No']}
//                 required
//                 description="Required for MSCS and MS Data Science programs"
//                 value={formData.mathProgrammingStats}
//                 onChange={handleInputChange}
//                 hasError={errors.mathProgrammingStats}
//               />
//             )}

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="Q10. Was your undergraduate program 3 years or 4 years?"
//                 field="degreeLength"
//                 type="select"
//                 options={['3 years', '4 years']}
//                 required
//                 value={formData.degreeLength}
//                 onChange={handleInputChange}
//                 hasError={errors.degreeLength}
//               />

//               <InputField
//                 label="Q11. Have you completed any master's degree?"
//                 field="mastersDegree"
//                 type="radio"
//                 options={['Yes', 'No']}
//                 required
//                 value={formData.mastersDegree}
//                 onChange={handleInputChange}
//                 hasError={errors.mastersDegree}
//               />
//             </div>
//           </div>
//         );

//       case 5:
//         return (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Base Questions - Part 3</h2>
//               <p className="text-gray-600 text-sm">Standardized test scores</p>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="Q12. What is your GRE score (total)?"
//                 field="greTotal"
//                 placeholder="e.g., 320"
//                 description="Total GRE score out of 340"
//                 value={formData.greTotal}
//                 onChange={handleInputChange}
//                 hasError={errors.greTotal}
//               />

//               <InputField
//                 label="Q13. GRE Quant score?"
//                 field="greQuant"
//                 placeholder="e.g., 165"
//                 description="GRE Quantitative score"
//                 value={formData.greQuant}
//                 onChange={handleInputChange}
//                 hasError={errors.greQuant}
//               />
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="Q14. GRE Verbal score?"
//                 field="greVerbal"
//                 placeholder="e.g., 155"
//                 description="GRE Verbal score"
//                 value={formData.greVerbal}
//                 onChange={handleInputChange}
//                 hasError={errors.greVerbal}
//               />

//               <InputField
//                 label="Q15. GRE AWA score?"
//                 field="greAWA"
//                 placeholder="e.g., 4.0"
//                 description="GRE Analytical Writing score"
//                 value={formData.greAWA}
//                 onChange={handleInputChange}
//                 hasError={errors.greAWA}
//               />
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="Q16. If GMAT: What is your GMAT total score?"
//                 field="gmatTotal"
//                 placeholder="e.g., 650"
//                 description="Total GMAT score out of 800 (if applicable)"
//                 value={formData.gmatTotal}
//                 onChange={handleInputChange}
//                 hasError={errors.gmatTotal}
//               />

//               <InputField
//                 label="Q17. GMAT Quant score?"
//                 field="gmatQuant"
//                 placeholder="e.g., 45"
//                 description="GMAT Quantitative score"
//                 value={formData.gmatQuant}
//                 onChange={handleInputChange}
//                 hasError={errors.gmatQuant}
//               />
//             </div>
//           </div>
//         );

//       case 6:
//         return (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Location & Lifestyle</h2>
//               <p className="text-gray-600 text-sm">Tell us about your location preferences and lifestyle needs</p>
//             </div>

//             <InputField
//               label="23. Preferred regions in US"
//               field="preferredRegions"
//               type="checkbox"
//               options={['Northeast (NY, MA, PA)', 'Southeast (FL, GA, NC)', 'Midwest (IL, MI, OH)', 'Southwest (TX, AZ)', 'West Coast (CA, WA, OR)', 'Mountain States (CO, UT)']}
//               description="Select all regions you'd consider (multiple allowed)"
//               value={formData.preferredRegions}
//               onChange={handleInputChange}
//               hasError={errors.preferredRegions}
//             />

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="24. City size preference"
//                 field="citySize"
//                 type="select"
//                 options={['Large metropolitan (NYC, LA, Chicago)', 'Mid-size city (Austin, Seattle)', 'Small city/college town', 'No preference']}
//                 required
//                 description="What type of city do you prefer?"
//                 value={formData.citySize}
//                 onChange={handleInputChange}
//                 hasError={errors.citySize}
//               />

//               <InputField
//                 label="25. Climate preference"
//                 field="climate"
//                 type="select"
//                 options={['Warm/tropical', 'Mild/temperate', 'Cold/continental', 'No preference']}
//                 description="Weather preference"
//                 value={formData.climate}
//                 onChange={handleInputChange}
//                 hasError={errors.climate}
//               />
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="26. Important campus factors"
//                 field="campusFactors"
//                 type="checkbox"
//                 options={['Large campus', 'Small campus', 'Urban setting', 'Suburban setting', 'Strong diversity', 'Research facilities', 'Industry connections']}
//                 description="What matters most in a campus? (multiple allowed)"
//                 value={formData.campusFactors}
//                 onChange={handleInputChange}
//                 hasError={errors.campusFactors}
//               />

//               <InputField
//                 label="27. Public vs Private preference"
//                 field="universityType"
//                 type="select"
//                 options={['Public universities preferred', 'Private universities preferred', 'No preference']}
//                 description="University type preference"
//                 value={formData.universityType}
//                 onChange={handleInputChange}
//                 hasError={errors.universityType}
//               />
//             </div>
//           </div>
//         );

//       case 7:
//         return (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Career Goals & Timeline</h2>
//               <p className="text-gray-600 text-sm">Share your career aspirations and program timeline</p>
//             </div>

//             <InputField
//               label="28. Primary career goal after graduation"
//               field="careerGoal"
//               type="select"
//               options={['Work in US (full-time)', 'Return to home country', 'Start own business/startup', 'Pursue PhD/further research', 'Consulting career', 'Not decided yet']}
//               required
//               description="What's your main goal after completing the program?"
//               value={formData.careerGoal}
//               onChange={handleInputChange}
//               hasError={errors.careerGoal}
//             />

//             <InputField
//               label="29. Target job roles/positions"
//               field="targetRoles"
//               placeholder="e.g., Data Scientist, Product Manager, Software Engineer"
//               description="Specific roles you're targeting (comma-separated)"
//               value={formData.targetRoles}
//               onChange={handleInputChange}
//               hasError={errors.targetRoles}
//             />

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="30. Preferred intake semester"
//                 field="intake"
//                 type="select"
//                 options={['Fall 2024', 'Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026']}
//                 required
//                 description="When do you want to start?"
//                 value={formData.intake}
//                 onChange={handleInputChange}
//                 hasError={errors.intake}
//               />

//               <InputField
//                 label="31. Program duration preference"
//                 field="duration"
//                 type="select"
//                 options={['1 year', '1.5 years', '2 years', 'No preference']}
//                 description="Preferred program length"
//                 value={formData.duration}
//                 onChange={handleInputChange}
//                 hasError={errors.duration}
//               />
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="32. Industry focus post-graduation"
//                 field="targetIndustry"
//                 type="select"
//                 options={['Technology/Software', 'Finance/Banking', 'Consulting', 'Healthcare/Biotech', 'Energy/Utilities', 'Manufacturing', 'Startups', 'Academia/Research']}
//                 description="Target industry for career"
//                 value={formData.targetIndustry}
//                 onChange={handleInputChange}
//                 hasError={errors.targetIndustry}
//               />

//               <InputField
//                 label="33. Salary expectations (USD)"
//                 field="salaryExpectation"
//                 type="select"
//                 options={['$60k - $80k', '$80k - $120k', '$120k - $150k', '$150k - $200k', '$200k+', 'Not sure']}
//                 description="Expected starting salary after graduation"
//                 value={formData.salaryExpectation}
//                 onChange={handleInputChange}
//                 hasError={errors.salaryExpectation}
//               />
//             </div>
//           </div>
//         );

//       case 8:
//         return (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Additional Preferences</h2>
//               <p className="text-gray-600 text-sm">Final questions to personalize your recommendations</p>
//             </div>

//             <InputField
//               label="34. University ranking importance"
//               field="rankingImportance"
//               type="select"
//               options={['Very important (Top 50 only)', 'Important (Top 100)', 'Somewhat important', 'Not important']}
//               required
//               description="How important are university rankings to you?"
//               value={formData.rankingImportance}
//               onChange={handleInputChange}
//               hasError={errors.rankingImportance}
//             />

//             <InputField
//               label="35. Specific universities of interest"
//               field="targetUniversities"
//               placeholder="e.g., Stanford, MIT, CMU, UC Berkeley"
//               description="List any specific universities you're interested in (optional)"
//               value={formData.targetUniversities}
//               onChange={handleInputChange}
//               hasError={errors.targetUniversities}
//             />

//             <div className="grid md:grid-cols-2 gap-4">
//               <InputField
//                 label="36. Research vs Coursework focus"
//                 field="programFocus"
//                 type="select"
//                 options={['Research-heavy (thesis)', 'Coursework-focused', 'Balanced mix', 'No preference']}
//                 description="What type of program structure do you prefer?"
//                 value={formData.programFocus}
//                 onChange={handleInputChange}
//                 hasError={errors.programFocus}
//               />

//               <InputField
//                 label="37. Any specific concerns/requirements?"
//                 field="additionalRequirements"
//                 placeholder="e.g., visa sponsorship, disability support, family considerations"
//                 description="Anything else we should know?"
//                 value={formData.additionalRequirements}
//                 onChange={handleInputChange}
//                 hasError={errors.additionalRequirements}
//               />
//             </div>

//             <div className="bg-[#145044]/5 border border-[#145044]/20 rounded-lg p-4">
//               <div className="flex items-start space-x-3">
//                 <Lightbulb className="h-5 w-5 text-[#145044] mt-0.5 flex-shrink-0" />
//                 <div>
//                   <h4 className="font-medium text-[#145044] mb-1">Ready for AI Analysis</h4>
//                   <p className="text-sm text-gray-600">
//                     Once you submit, our AI will analyze your profile against our database of {dataValidation?.stats?.totalRecords || '1000+'} university programs
//                     to provide personalized recommendations with admission probability scores.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return (
//           <div className="text-center">
//             <h2 className="text-xl font-semibold text-gray-900">More steps coming soon...</h2>
//           </div>
//         );
//     }
//   };

//   if (isSubmitting) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto p-8">
//           <div className="w-16 h-16 bg-[#145044] rounded-full flex items-center justify-center mx-auto mb-6">
//             <Brain className="h-8 w-8 text-white" />
//             <Loader2 className="absolute h-6 w-6 text-white animate-spin" />
//           </div>
//           <h2 className="text-2xl font-semibold text-gray-900 mb-3">Processing Your Profile</h2>
//           <p className="text-gray-600 mb-6">AI is analyzing your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       <Navigation />

//       <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Clean, Professional Header */}
//           <div className="text-center mb-12">
//             <div className="w-16 h-16 bg-[#145044] rounded-xl flex items-center justify-center mx-auto mb-6">
//               <Brain className="h-8 w-8 text-white" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-4">
//               University Questionnaire
//             </h1>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Complete our assessment to receive AI-powered university recommendations.
//             </p>
//           </div>

//           {/* Progress Indicator */}
//           <div className="mb-8">
//             <div className="flex justify-center items-center space-x-4 mb-4">
//               {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
//                 <div key={step} className="flex items-center">
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
//                     currentStep >= step
//                       ? 'bg-[#145044] text-white'
//                       : 'bg-gray-200 text-gray-600'
//                   }`}>
//                     {currentStep > step ? <Check className="h-4 w-4" /> : step}
//                   </div>
//                   {step < 8 && (
//                     <div className={`w-12 h-0.5 mx-2 transition-colors ${
//                       currentStep > step ? 'bg-[#145044]' : 'bg-gray-200'
//                     }`} />
//                   )}
//                 </div>
//               ))}
//             </div>
//             <div className="text-center text-sm text-gray-600">
//               Step {currentStep} of 8
//             </div>
//           </div>

//           {/* Form Container */}
//           <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
//             <div className="p-6 md:p-8">
//               {renderStepContent()}
//             </div>

//             {/* Navigation */}
//             <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
//               <Button
//                 onClick={prevStep}
//                 disabled={currentStep === 1}
//                 variant="outline"
//                 className="w-full md:w-auto order-2 md:order-1"
//               >
//                 <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
//                 Previous
//               </Button>

//               <div className="flex items-center space-x-2 order-1 md:order-2">
//                 {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
//                   <div
//                     key={step}
//                     className={`w-2 h-2 rounded-full transition-colors ${
//                       step <= currentStep ? 'bg-[#145044]' : 'bg-gray-300'
//                     }`}
//                   />
//                 ))}
//               </div>

//               <Button
//                 onClick={nextStep}
//                 className="w-full md:w-auto bg-[#145044] hover:bg-[#0f3c34] order-3"
//               >
//                 {currentStep === 8 ? (
//                   <>
//                     <Sparkles className="h-4 w-4 mr-2" />
//                     Get Universities
//                   </>
//                 ) : (
//                   <>
//                     Continue
//                     <ArrowRight className="h-4 w-4 ml-2" />
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default QuestionnaireForm;


import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenAI from 'openai';
import Navigation from '@/components/static/Navigation';
import Footer from '@/components/static/Footer';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  Check,
  Lightbulb
} from 'lucide-react';
import {
  validateUniversityData,
  getProgramDisplayNames
} from '@/lib/universityDataLoader';

// -----------------------------
// Input component (unchanged UI)
// -----------------------------
const InputField = ({
  label,
  field,
  type = 'text',
  options = null,
  required = false,
  placeholder = '',
  description = '',
  value,
  onChange,
  hasError
}) => {
  const inputRef = useRef(null);

  const handleInputChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      onChange(field, newValue);
    },
    [field, onChange]
  );

  const handleRadioClick = useCallback(
    (option) => {
      onChange(field, option);
    },
    [field, onChange]
  );

  if (type === 'select') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        <select
          ref={inputRef}
          value={value || ''}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : value
              ? 'border-[#145044] focus:border-[#145044] focus:ring-[#145044]/20'
              : 'border-gray-300 focus:border-[#145044] focus:ring-[#145044]/20'
          }`}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {hasError && (
          <p className="text-red-600 text-xs flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {hasError}
          </p>
        )}
      </div>
    );
  }

  if (type === 'radio') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleRadioClick(option)}
              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                value === option
                  ? 'border-[#145044] bg-[#145044] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#145044]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {hasError && (
          <p className="text-red-600 text-xs flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {hasError}
          </p>
        )}
      </div>
    );
  }

  if (type === 'checkbox') {
    const currentValue = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="checkbox"
                id={`${field}-${option}`}
                checked={currentValue.includes(option)}
                onChange={(e) => {
                  let newValue = [...currentValue];
                  if (e.target.checked) {
                    newValue.push(option);
                  } else {
                    newValue = newValue.filter((v) => v !== option);
                  }
                  onChange(field, newValue);
                }}
                className="h-4 w-4 text-[#145044] focus:ring-[#145044] border-gray-300 rounded"
              />
              <label
                htmlFor={`${field}-${option}`}
                className="ml-2 text-sm text-gray-700"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
        {hasError && (
          <p className="text-red-600 text-xs flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {hasError}
          </p>
        )}
      </div>
    );
  }

  // default text-like input
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      <input
        ref={inputRef}
        type={type}
        value={value || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
          hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : value
            ? 'border-[#145044] focus:border-[#145044] focus:ring-[#145044]/20'
            : 'border-gray-300 focus:border-[#145044] focus:ring-[#145044]/20'
        }`}
      />
      {hasError && (
        <p className="text-red-600 text-xs flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {hasError}
        </p>
      )}
    </div>
  );
};

// -----------------------------
// Main form component
// -----------------------------
const QuestionnaireForm = () => {
  const navigate = useNavigate();

  // same state as your original file  :contentReference[oaicite:2]{index=2}
  const [currentStep, setCurrentStep] = useState(1);
  const [questionType, setQuestionType] = useState(''); // 'base' or 'advanced'
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataValidation, setDataValidation] = useState(null);
  const [availablePrograms, setAvailablePrograms] = useState([]);

  const [formData, setFormData] = useState({
    // Base Questions (1-23)
    program: '',
    stemRequired: '',
    f1Required: '',
    gpa: '',
    gpaScale: '',
    university: '',
    universityTier: '',
    degree: '',
    mathProgrammingStats: '',
    degreeLength: '',
    mastersDegree: '',
    mastersDetails: '',
    greTotal: '',
    greQuant: '',
    greVerbal: '',
    greAWA: '',
    gmatTotal: '',
    gmatQuant: '',
    gmatVerbal: '',
    gmatAWA: '',
    gmatIR: '',
    englishTest: '',
    englishScore: '',
    intakeYear: '',
    intakeSeason: '',
    intakeMode: '',
    preferredRegions: [],
    citySize: '',
    climate: '',
    campusFactors: [],
    careerGoal: '',
    targetRoles: '',
    intake: '',
    duration: '',
    targetIndustry: '',
    salaryExpectation: '',
    rankingImportance: '',
    targetUniversities: '',
    programFocus: '',
    additionalRequirements: '',
    // Advanced Questions (24-37)
    workExperience: '',
    industries: '',
    brandFirms: '',
    leadership: '',
    promotions: '',
    research: '',
    publications: '',
    certifications: '',
    citizenship: '',
    gender: '',
    demographicGroup: '',
    budgetConstraints: '',
    maxBudget: '',
    scholarships: '',
    universityType: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -----------------------------
  // Load + validate base program data
  // -----------------------------
  useEffect(() => {
    console.log('🚀 Loading university data...');
    try {
      const validation = validateUniversityData();
      setDataValidation(validation);

      if (validation.isValid) {
        const programs = getProgramDisplayNames();
        setAvailablePrograms(programs);
        setDataLoaded(true);

        console.log('✅ University data loaded successfully!');
        console.log(`📊 Available programs: ${programs.length}`);
        console.log('🎓 Programs:', programs);
      } else {
        console.error('❌ Data validation failed:', validation.issues);
      }
    } catch (error) {
      console.error('❌ Error loading university data:', error);
      setDataValidation({
        isValid: false,
        issues: ['Failed to load data: ' + error.message]
      });
    }
  }, []);

  // -----------------------------
  // field change handler
  // -----------------------------
  const handleInputChange = useCallback(
    (field, value) => {
      console.log(`📝 Field updated: ${field} = ${value}`);

      setFormData((prev) => ({
        ...prev,
        [field]: value
      }));

      // Clear per-field error
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // -----------------------------
  // helper: parse AI JSON -> tier buckets
  // (unchanged logic from your file, just slightly extracted)
  // -----------------------------
  const parseAIResponseFromWebSearch = (aiText) => {
    console.log('🔍 Parsing AI JSON response...');

    try {
      const rawList = JSON.parse(aiText);
      if (!Array.isArray(rawList) || rawList.length !== 20) {
        throw new Error(
          'Invalid response format: Expected array of 20 objects'
        );
      }

      const tiers = { ambitious: [], target: [], safe: [], backup: [] };

      rawList.forEach((item) => {
        if (typeof item !== 'object' || item === null) return;
        const tier = item.Chance ? item.Chance.toLowerCase() : '';
        if (!tiers[tier]) return;

        const university = {
          id: `${tier}-${tiers[tier].length}`,
          name: item.University,
          university: item.University,
          program: item.Program || formData.program || 'MBA',
          tier: tier,
          length: item.Length,
          probability: Math.round(
            tier === 'ambitious'
              ? 15 + Math.random() * 10
              : tier === 'target'
              ? 35 + Math.random() * 15
              : tier === 'safe'
              ? 60 + Math.random() * 20
              : 80 + Math.random() * 15
          ),
          ranking: { national: null },
          location: item.Location,
          tuition: item.Tuition,
          description: `${formData.program || 'MBA'} program`,
          acceptanceRate: null,
          stemDesignated: item.STEM === 'Yes',
          f1Eligible: item['F-1'] === 'Yes',
          accepts3Year: true,
          features: ['Research Opportunities', 'Career Services']
        };

        if (tiers[tier].length < 5) {
          tiers[tier].push(university);
        }
      });

      const total = Object.values(tiers).reduce(
        (sum, tierArr) => sum + tierArr.length,
        0
      );

      console.log(`📊 Parsed ${total} web search recommendations:`, tiers);

      return { ...tiers, total };
    } catch (error) {
      console.error('❌ Error parsing AI JSON response:', error);
      return { ambitious: [], target: [], safe: [], backup: [], total: 0 };
    }
  };

  // -----------------------------
  // OpenAI client creation
  // -----------------------------
  const initializeOpenAI = () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('🔑 OpenAI API Key:', apiKey ? 'Available' : 'Missing');

    if (!apiKey) {
      console.warn('⚠️ OpenAI API key not found.');
      return null;
    }

    try {
      const client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
      console.log('✅ OpenAI initialized successfully');
      return client;
    } catch (error) {
      console.error('❌ Error initializing OpenAI:', error);
      return null;
    }
  };

  // -----------------------------
  // PROMPTS
  // We keep your original high-accuracy instructions EXACTLY.
  // -----------------------------

  const buildSystemPromptAccurate = () => {
    return `You are an expert U.S. admissions consultant specializing in helping international students (esp. Indian applicants) secure admission into top U.S. universities.

CRITICAL INSTRUCTIONS:
- Use ONLY your most current knowledge from 2024-2025 to provide accurate, real-time information
- Research current tuition fees, university rankings, and program details for 2024-2025 academic year
- DO NOT use any pre-stored database or outdated information
- Provide actual universities with real current data including exact tuition costs, admission requirements, and program details
- Focus on universities that actually offer the requested program with current STEM designation and F-1 visa support status
- IMPORTANT: Do NOT ask for additional information. Use the provided profile data to immediately generate recommendations
- MUST respond with exactly 20 universities in the specified format - no questions, no additional requests

SCORING FRAMEWORK BY PROGRAM GROUPS:

GROUP 1: Business/Finance Programs (MS Finance, MS Accounting, MBA Finance & Accounting)
Total: 1000 points
• Standardized Tests (GMAT/GRE): 300 points (30%)
• GPA: 250 points (25%)
• Work Experience: 250 points (25%)
• Professional Certifications: 100 points (10%)
• Diversity/Leadership: 100 points (10%)

GROUP 2: Marketing & Management Programs (MS Marketing, MS Management, MS Eng Management, MBA Marketing, MBA Management)
Total: 1000 points
• Work Experience: 350 points (35%)
• Standardized Tests: 250 points (25%)
• GPA: 200 points (20%)
• Leadership Experience: 150 points (15%)
• Industry Relevance: 50 points (5%)

GROUP 3: Analytics & Data Programs (MS Business Analytics, MS Data Science, MBA Business Analytics)
Total: 1000 points
• Technical Skills/GPA: 300 points (30%)
• Standardized Tests: 250 points (25%)
• Work Experience: 200 points (20%)
• Technical Certifications: 150 points (15%)
• Projects/Portfolio: 100 points (10%)

GROUP 4: Computer Science & Information Systems (CS, Information Systems & AI)
Total: 1000 points
• GPA: 300 points (30%)
• GRE/Technical Tests: 250 points (25%)
• Research/Projects: 250 points (25%)
• Work Experience: 150 points (15%)
• Technical Certifications: 50 points (5%)

GROUP 5: Core Engineering (Civil, Industrial, Mechanical, Electrical, Biomedical Engineering)
Total: 1000 points
• GPA: 300 points (30%)
• Research Experience: 250 points (25%)
• GRE Score: 200 points (20%)
• Work Experience: 150 points (15%)
• Technical Projects: 100 points (10%)

SCORING INTERPRETATION:
• 900-1000: Extremely competitive for top programs
• 800-899: Competitive for top programs, strong for mid-tier
• 700-799: Competitive for mid-tier, strong for regional programs
• 600-699: Competitive for regional programs
• Below 600: May need to strengthen profile

TIER ASSIGNMENT RULES:
Calculate user's score based on their program group, then assign universities:
- Ambitious (10–25% chance): Top universities where user score is 100-200 points below typical admits
- Target (25–50% chance): Universities matching user's score range
- Safe (50–80% chance): Universities where user score is 100-200 points above typical admits
- Backup (>80% chance): Universities where user score significantly exceeds typical admits

Output exactly 20 programs distributed as: 5 Ambitious, 5 Target, 5 Safe, 5 Backup

Output Format:
RESPOND ONLY with a valid JSON array of exactly 20 objects. Each object must have the following keys exactly as specified: "University", "Program", "Length", "Tuition", "Location", "STEM", "F-1", "Chance".
The "Chance" value must be one of: "Ambitious", "Target", "Safe", "Backup".
Include exactly 5 objects for each "Chance" category.
Use real, accurate data from your web searches.
Do not include any text, explanations, or content outside the JSON array. The response must be parseable as JSON directly.`;
  };

  const buildUserMessageAccurate = () => {
    return `User Profile:
Program: ${formData.program}
Intake Mode: ${formData.intakeMode}
STEM Required: ${formData.stemRequired}
F-1 Required: ${formData.f1Required}
GPA: ${formData.gpa} (${formData.gpaScale} scale)
University: ${formData.university}
University Tier: ${formData.universityTier}
Degree: ${formData.degree}
${formData.mathProgrammingStats ? `Math/Programming/Stats: ${formData.mathProgrammingStats}` : ''}
Degree Length: ${formData.degreeLength}
Masters Degree: ${formData.mastersDegree}
GRE Total: ${formData.greTotal || 'Not provided'}
GRE Quant: ${formData.greQuant || 'Not provided'}
GRE Verbal: ${formData.greVerbal || 'Not provided'}
GRE AWA: ${formData.greAWA || 'Not provided'}
GMAT Total: ${formData.gmatTotal || 'Not provided'}

CRITICAL TASK:
Immediately provide 20 real universities with ${formData.program} programs for 2024-2025. Do NOT ask questions.

IMMEDIATE REQUIREMENTS:
- Provide exactly 20 universities with current tuition fees (no estimates)
- Use real 2024-2025 rankings and program data
- Include only STEM-designated programs with F-1 eligibility
- Distribute as: 5 Ambitious, 5 Target, 5 Safe, 5 Backup
- Base scoring on provided profile data

RESPOND ONLY with a valid JSON array of exactly 20 objects. Each object must have the following keys exactly as specified: "University", "Program", "Length", "Tuition", "Location", "STEM", "F-1", "Chance".
The "Chance" value must be one of: "Ambitious", "Target", "Safe", "Backup".
Include exactly 5 objects for each "Chance" category.
Do not include any text, explanations, or content outside the JSON array. The response must be parseable as JSON directly.`;
  };

  // -----------------------------
  // Phase Mini (optional assist)
  // - no web_search, cheaper model
  // - we do NOT immediately show to user unless gpt-5 fails
  // -----------------------------
  const runPhaseMiniDraft = async (clientInstance) => {
    try {
      console.log('⚡ Running Phase MINI draft (gpt-5-mini)...');

      const fastResponse = await clientInstance.responses.create({
        model: 'gpt-5-mini',
        reasoning: { effort: 'minimal' },
        // IMPORTANT: We still give it SAME instructions about format,
        // but we REMOVE "use web_search" because mini is often faster
        // when not forced to browse. We re-use the accurate prompts
        // but we hint it can leave fields TBD if unsure.
        input:
          buildSystemPromptAccurate() +
          '\n\n' +
          buildUserMessageAccurate() +
          '\n\nIf you are not 100% sure about Tuition, STEM, F-1, or Length, you may write "TBD" for that field, but you MUST still return 20 objects.'
      });

      const miniText = fastResponse.output_text || '';
      console.log('⚡ MINI draft raw:', miniText);

      const structuredMini = parseAIResponseFromWebSearch(miniText);
      if (structuredMini.total === 20) {
        console.log('✅ MINI draft produced 20 entries.');
        return structuredMini;
      } else {
        console.warn(
          '⚠ MINI draft did not produce 20 valid entries. Ignoring draft.'
        );
        return null;
      }
    } catch (err) {
      console.warn('⚠ MINI draft failed:', err);
      return null;
    }
  };

  // -----------------------------
  // Phase Accurate (authoritative)
  // - gpt-5 + web_search
  // - this is what we actually show
  // -----------------------------
  const runPhaseAccurate = async (clientInstance) => {
    console.log('🔎 Running Phase ACCURATE (gpt-5 w/ web_search)...');

    const response = await clientInstance.responses.create({
      model: 'gpt-5',
      reasoning: { effort: 'low' },
      tools: [{ type: 'web_search' }],
      input: buildSystemPromptAccurate() + '\n\n' + buildUserMessageAccurate()
    });

    const aiText = response.output_text || '';
    console.log('🤖 ACCURATE raw response:', aiText);

    const structuredAccurate = parseAIResponseFromWebSearch(aiText);
    if (structuredAccurate.total === 20) {
      console.log('✅ ACCURATE phase returned 20 entries.');
      return { structuredAccurate, aiText };
    } else {
      throw new Error(
        `ACCURATE phase did not yield full 20. total=${structuredAccurate.total}`
      );
    }
  };

  // -----------------------------
  // master submit flow
  // -----------------------------
  const generateRecommendations = async () => {
    console.log(
      '🚀 Starting hybrid AI pipeline (mini assist + accurate web-search)…'
    );
    setIsSubmitting(true);

    const client = initializeOpenAI();
    if (!client) {
      alert(
        'AI recommendation service requires API configuration. Please contact support.'
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Fire mini draft in parallel (non-blocking)
      const miniPromise = runPhaseMiniDraft(client);

      // 2. ALWAYS run authoritative gpt-5 pass for accuracy
      //    We wait for this one before navigating (accuracy first).
      const { structuredAccurate, aiText } = await runPhaseAccurate(client);

      // 3. Build AI summary (kept same spirit as your original file)
      const aiSummary = `Based on your profile and the scoring framework for ${formData.program} programs, here are the 20 university recommendations distributed across Ambitious / Target / Safe / Backup.

The analysis considered:
• GPA: ${formData.gpa} (${formData.gpaScale} scale)
• Test Scores: GRE ${formData.greTotal || 'N/A'}, GMAT ${formData.gmatTotal || 'N/A'}
• University Background: ${formData.university} (${formData.universityTier})
• Program Focus: ${formData.program}

Each tier reflects expected admission probability using the 2024–2025 criteria, current tuition info, STEM designation, and F-1 eligibility where applicable.`;

      // 4. Navigate to results using ACCURATE data (not mini draft)
      navigate('/college-finder/results', {
        state: {
          recommendations: structuredAccurate,
          responses: formData,
          aiInsights: aiSummary
        }
      });

      // 5. Mini result can still resolve now (we don't block UI on it).
      miniPromise.then((miniData) => {
        if (miniData && miniData.total === 20) {
          console.log(
            '📈 MINI draft latency/quality benchmark ready for telemetry.'
          );
          // At this point you could:
          // - record miniData + timestamps to analytics
          // - compare tiers internally
          // We do NOT overwrite user's final view (accuracy is priority).
        }
      });
    } catch (err) {
      console.error('❌ Accurate phase failed:', err);

      // fallback: try to use mini data if it succeeded
      try {
        const fallbackMini = await runPhaseMiniDraft(client);
        if (fallbackMini && fallbackMini.total === 20) {
          console.warn(
            '⚠ Falling back to MINI draft due to ACCURATE phase failure.'
          );

          const fallbackSummary = `These programs are generated from your profile using current model knowledge. Some tuition/STEM/F-1 values may be marked TBD and should be verified.`;

          navigate('/college-finder/results', {
            state: {
              recommendations: fallbackMini,
              responses: formData,
              aiInsights: fallbackSummary
            }
          });
        } else {
          alert(
            'We could not generate recommendations right now. Please try again.'
          );
        }
      } catch (fallbackErr) {
        console.error('❌ Mini fallback also failed:', fallbackErr);
        alert(
          'We could not generate recommendations right now. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------
  // Step navigation
  // -----------------------------
  const nextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    } else {
      generateRecommendations();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // -----------------------------
  // Per-step render content
  // NOTE: keeping same structure/labels/options from your file.  :contentReference[oaicite:3]{index=3}
  // -----------------------------
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Program Selection
              </h2>
              <p className="text-gray-600 text-sm">
                Which program do you want to apply for?
              </p>
            </div>

            <InputField
              label="Q1. Which program do you want to apply for?"
              field="program"
              type="select"
              options={[
                'MSCS',
                'MBA',
                'MS Finance',
                'MS Marketing',
                'MS Data Science',
                'Engineering',
                'MS Business Analytics',
                'MS Management',
                'MS Accounting'
              ]}
              required
              description="Select your target program for higher education"
              value={formData.program}
              onChange={handleInputChange}
              hasError={errors.program}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Intake Mode Selection
              </h2>
              <p className="text-gray-600 text-sm">
                Choose your questionnaire type
              </p>
            </div>

            <InputField
              label="Q2. Do you want Base Questions (short intake) or Advanced Questions (detailed intake)?"
              field="intakeMode"
              type="radio"
              options={['Base Questions (Quick)', 'Advanced Questions (Detailed)']}
              required
              description="Base Questions: Essential information only. Advanced Questions: Comprehensive profile analysis."
              value={formData.intakeMode}
              onChange={(field, value) => {
                handleInputChange(field, value);
                setQuestionType(value.includes('Base') ? 'base' : 'advanced');
              }}
              hasError={errors.intakeMode}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Base Questions - Part 1
              </h2>
              <p className="text-gray-600 text-sm">
                Essential requirements and eligibility
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Q3. Do you require only STEM-designated programs?"
                field="stemRequired"
                type="radio"
                options={['Yes', 'No']}
                required
                value={formData.stemRequired}
                onChange={handleInputChange}
                hasError={errors.stemRequired}
              />

              <InputField
                label="Q4. Do you require only F-1 visa eligible programs?"
                field="f1Required"
                type="radio"
                options={['Yes', 'No']}
                required
                value={formData.f1Required}
                onChange={handleInputChange}
                hasError={errors.f1Required}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Q5. What is your undergraduate GPA?"
                field="gpa"
                placeholder="e.g., 3.5 or 8.5"
                required
                description="Your cumulative grade point average (with scale)"
                value={formData.gpa}
                onChange={handleInputChange}
                hasError={errors.gpa}
              />

              <InputField
                label="GPA Scale"
                field="gpaScale"
                type="select"
                options={['4.0', '10.0', 'Percentage']}
                required
                value={formData.gpaScale}
                onChange={handleInputChange}
                hasError={errors.gpaScale}
              />
            </div>

            <InputField
              label="Q6. What is the name of your undergraduate university?"
              field="university"
              placeholder="e.g., IIT Delhi, University of Mumbai"
              required
              value={formData.university}
              onChange={handleInputChange}
              hasError={errors.university}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Base Questions - Part 2
              </h2>
              <p className="text-gray-600 text-sm">
                Academic background and degree information
              </p>
            </div>

            <InputField
              label="Q7. What is the tier of your university?"
              field="universityTier"
              type="select"
              options={['IIT', 'NIT', 'Tier-1', 'Tier-2', 'Tier-3']}
              required
              value={formData.universityTier}
              onChange={handleInputChange}
              hasError={errors.universityTier}
            />

            <InputField
              label="Q8. What is the name of your undergraduate degree?"
              field="degree"
              placeholder="e.g., Computer Science, Mechanical Engineering, Commerce"
              required
              value={formData.degree}
              onChange={handleInputChange}
              hasError={errors.degree}
            />

            {(formData.program === 'MSCS' ||
              formData.program === 'MS Data Science') && (
              <InputField
                label="Q9. Did your degree include Mathematics, Programming, and Statistics coursework?"
                field="mathProgrammingStats"
                type="radio"
                options={['Yes', 'No']}
                required
                description="Required for MSCS and MS Data Science programs"
                value={formData.mathProgrammingStats}
                onChange={handleInputChange}
                hasError={errors.mathProgrammingStats}
              />
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Q10. Was your undergraduate program 3 years or 4 years?"
                field="degreeLength"
                type="select"
                options={['3 years', '4 years']}
                required
                value={formData.degreeLength}
                onChange={handleInputChange}
                hasError={errors.degreeLength}
              />

              <InputField
                label="Q11. Have you completed any master's degree?"
                field="mastersDegree"
                type="radio"
                options={['Yes', 'No']}
                required
                value={formData.mastersDegree}
                onChange={handleInputChange}
                hasError={errors.mastersDegree}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Base Questions - Part 3
              </h2>
              <p className="text-gray-600 text-sm">
                Standardized test scores
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Q12. What is your GRE score (total)?"
                field="greTotal"
                placeholder="e.g., 320"
                description="Total GRE score out of 340"
                value={formData.greTotal}
                onChange={handleInputChange}
                hasError={errors.greTotal}
              />

              <InputField
                label="Q13. GRE Quant score?"
                field="greQuant"
                placeholder="e.g., 165"
                description="GRE Quantitative score"
                value={formData.greQuant}
                onChange={handleInputChange}
                hasError={errors.greQuant}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Q14. GRE Verbal score?"
                field="greVerbal"
                placeholder="e.g., 155"
                description="GRE Verbal score"
                value={formData.greVerbal}
                onChange={handleInputChange}
                hasError={errors.greVerbal}
              />

              <InputField
                label="Q15. GRE AWA score?"
                field="greAWA"
                placeholder="e.g., 4.0"
                description="GRE Analytical Writing score"
                value={formData.greAWA}
                onChange={handleInputChange}
                hasError={errors.greAWA}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Q16. If GMAT: What is your GMAT total score?"
                field="gmatTotal"
                placeholder="e.g., 650"
                description="Total GMAT score out of 800 (if applicable)"
                value={formData.gmatTotal}
                onChange={handleInputChange}
                hasError={errors.gmatTotal}
              />

              <InputField
                label="Q17. GMAT Quant score?"
                field="gmatQuant"
                placeholder="e.g., 45"
                description="GMAT Quantitative score"
                value={formData.gmatQuant}
                onChange={handleInputChange}
                hasError={errors.gmatQuant}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Location & Lifestyle
              </h2>
              <p className="text-gray-600 text-sm">
                Tell us about your location preferences and lifestyle needs
              </p>
            </div>

            <InputField
              label="23. Preferred regions in US"
              field="preferredRegions"
              type="checkbox"
              options={[
                'Northeast (NY, MA, PA)',
                'Southeast (FL, GA, NC)',
                'Midwest (IL, MI, OH)',
                'Southwest (TX, AZ)',
                'West Coast (CA, WA, OR)',
                'Mountain States (CO, UT)'
              ]}
              description="Select all regions you'd consider (multiple allowed)"
              value={formData.preferredRegions}
              onChange={handleInputChange}
              hasError={errors.preferredRegions}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="24. City size preference"
                field="citySize"
                type="select"
                options={[
                  'Large metropolitan (NYC, LA, Chicago)',
                  'Mid-size city (Austin, Seattle)',
                  'Small city/college town',
                  'No preference'
                ]}
                required
                description="What type of city do you prefer?"
                value={formData.citySize}
                onChange={handleInputChange}
                hasError={errors.citySize}
              />

              <InputField
                label="25. Climate preference"
                field="climate"
                type="select"
                options={[
                  'Warm/tropical',
                  'Mild/temperate',
                  'Cold/continental',
                  'No preference'
                ]}
                description="Weather preference"
                value={formData.climate}
                onChange={handleInputChange}
                hasError={errors.climate}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="26. Important campus factors"
                field="campusFactors"
                type="checkbox"
                options={[
                  'Large campus',
                  'Small campus',
                  'Urban setting',
                  'Suburban setting',
                  'Strong diversity',
                  'Research facilities',
                  'Industry connections'
                ]}
                description="What matters most in a campus? (multiple allowed)"
                value={formData.campusFactors}
                onChange={handleInputChange}
                hasError={errors.campusFactors}
              />

              <InputField
                label="27. Public vs Private preference"
                field="universityType"
                type="select"
                options={[
                  'Public universities preferred',
                  'Private universities preferred',
                  'No preference'
                ]}
                description="University type preference"
                value={formData.universityType}
                onChange={handleInputChange}
                hasError={errors.universityType}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Career Goals & Timeline
              </h2>
              <p className="text-gray-600 text-sm">
                Share your career aspirations and program timeline
              </p>
            </div>

            <InputField
              label="28. Primary career goal after graduation"
              field="careerGoal"
              type="select"
              options={[
                'Work in US (full-time)',
                'Return to home country',
                'Start own business/startup',
                'Pursue PhD/further research',
                'Consulting career',
                'Not decided yet'
              ]}
              required
              description="What's your main goal after completing the program?"
              value={formData.careerGoal}
              onChange={handleInputChange}
              hasError={errors.careerGoal}
            />

            <InputField
              label="29. Target job roles/positions"
              field="targetRoles"
              placeholder="e.g., Data Scientist, Product Manager, Software Engineer"
              description="Specific roles you're targeting (comma-separated)"
              value={formData.targetRoles}
              onChange={handleInputChange}
              hasError={errors.targetRoles}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="30. Preferred intake semester"
                field="intake"
                type="select"
                options={[
                  'Fall 2024',
                  'Spring 2025',
                  'Fall 2025',
                  'Spring 2026',
                  'Fall 2026'
                ]}
                required
                description="When do you want to start?"
                value={formData.intake}
                onChange={handleInputChange}
                hasError={errors.intake}
              />

              <InputField
                label="31. Program duration preference"
                field="duration"
                type="select"
                options={['1 year', '1.5 years', '2 years', 'No preference']}
                description="Preferred program length"
                value={formData.duration}
                onChange={handleInputChange}
                hasError={errors.duration}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="32. Industry focus post-graduation"
                field="targetIndustry"
                type="select"
                options={[
                  'Technology/Software',
                  'Finance/Banking',
                  'Consulting',
                  'Healthcare/Biotech',
                  'Energy/Utilities',
                  'Manufacturing',
                  'Startups',
                  'Academia/Research'
                ]}
                description="Target industry for career"
                value={formData.targetIndustry}
                onChange={handleInputChange}
                hasError={errors.targetIndustry}
              />

              <InputField
                label="33. Salary expectations (USD)"
                field="salaryExpectation"
                type="select"
                options={[
                  '$60k - $80k',
                  '$80k - $120k',
                  '$120k - $150k',
                  '$150k - $200k',
                  '$200k+',
                  'Not sure'
                ]}
                description="Expected starting salary after graduation"
                value={formData.salaryExpectation}
                onChange={handleInputChange}
                hasError={errors.salaryExpectation}
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Additional Preferences
              </h2>
              <p className="text-gray-600 text-sm">
                Final questions to personalize your recommendations
              </p>
            </div>

            <InputField
              label="34. University ranking importance"
              field="rankingImportance"
              type="select"
              options={[
                'Very important (Top 50 only)',
                'Important (Top 100)',
                'Somewhat important',
                'Not important'
              ]}
              required
              description="How important are university rankings to you?"
              value={formData.rankingImportance}
              onChange={handleInputChange}
              hasError={errors.rankingImportance}
            />

            <InputField
              label="35. Specific universities of interest"
              field="targetUniversities"
              placeholder="e.g., Stanford, MIT, CMU, UC Berkeley"
              description="List any specific universities you're interested in (optional)"
              value={formData.targetUniversities}
              onChange={handleInputChange}
              hasError={errors.targetUniversities}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="36. Research vs Coursework focus"
                field="programFocus"
                type="select"
                options={[
                  'Research-heavy (thesis)',
                  'Coursework-focused',
                  'Balanced mix',
                  'No preference'
                ]}
                description="What type of program structure do you prefer?"
                value={formData.programFocus}
                onChange={handleInputChange}
                hasError={errors.programFocus}
              />

              <InputField
                label="37. Any specific concerns/requirements?"
                field="additionalRequirements"
                placeholder="e.g., visa sponsorship, disability support, family considerations"
                description="Anything else we should know?"
                value={formData.additionalRequirements}
                onChange={handleInputChange}
                hasError={errors.additionalRequirements}
              />
            </div>

            <div className="bg-[#145044]/5 border border-[#145044]/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-[#145044] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-[#145044] mb-1">
                    Ready for AI Analysis
                  </h4>
                  <p className="text-sm text-gray-600">
                    Once you submit, our AI will analyze your profile against
                    current U.S. programs and produce a ranked list of 20 real
                    universities by admission likelihood across Ambitious /
                    Target / Safe / Backup tiers using 2024–2025 data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              More steps coming soon...
            </h2>
          </div>
        );
    }
  };

  // -----------------------------
  // loading screen
  // -----------------------------
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-[#145044] rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Brain className="h-8 w-8 text-white" />
            <Loader2 className="absolute h-6 w-6 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Processing Your Profile
          </h2>
          <p className="text-gray-600 mb-6">
            AI is analyzing your profile with real 2024–2025 data...
          </p>
          <p className="text-xs text-gray-400">
            We’re checking tuition, STEM status, F-1 eligibility, and
            competitiveness for each university.
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // page layout (unchanged visual hierarchy)
  // -----------------------------
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[#145044] rounded-xl flex items-center justify-center mx-auto mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              University Questionnaire
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete our assessment to receive AI-powered university
              recommendations.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-center items-center space-x-4 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep >= step
                        ? 'bg-[#145044] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 8 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-colors ${
                        currentStep > step
                          ? 'bg-[#145044]'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              Step {currentStep} of 8
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 md:p-8">{renderStepContent()}</div>

            {/* Footer nav buttons */}
            <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="w-full md:w-auto order-2 md:order-1"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Previous
              </Button>

              <div className="flex items-center space-x-2 order-1 md:order-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step <= currentStep
                        ? 'bg-[#145044]'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={nextStep}
                className="w-full md:w-auto bg-[#145044] hover:bg-[#0f3c34] order-3"
              >
                {currentStep === 8 ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Universities
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuestionnaireForm;
