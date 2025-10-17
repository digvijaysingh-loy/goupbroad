import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const sampleUserData = {
  program: 'MS Computer Science',
  intakeMode: 'Base',
  stemRequired: 'Yes',
  f1Required: 'Yes',
  gpa: '8.5',
  gpaScale: '10',
  university: 'Indian Institute of Technology',
  universityTier: 'Tier 1',
  degree: 'Bachelor of Technology',
  mathProgrammingStats: 'Yes',
  degreeLength: '4 years',
  mastersDegree: 'No',
  greTotal: '320',
  greQuant: '165',
  greVerbal: '155',
  greAWA: '4.0',
  gmatTotal: 'Not provided'
};

const systemPrompt = `You are an expert U.S. admissions consultant specializing in helping international students (esp. Indian applicants) secure admission into top U.S. universities.

CRITICAL INSTRUCTIONS:
- Use ONLY your most current knowledge from 2024-2025 to provide accurate, real-time information
- Research current tuition fees, university rankings, and program details for 2024-2025 academic year
- DO NOT use any pre-stored database or outdated information
- Provide actual universities with real current data including exact tuition costs, admission requirements, and program details
- Focus on universities that actually offer the requested program with current STEM designation and F-1 visa support status
- IMPORTANT: Do NOT ask for additional information. Use the provided profile data to immediately generate recommendations
- MUST respond with exactly 20 universities in the specified table format - no questions, no additional requests

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
| University | Program | Length | Tuition | Location | STEM | F-1 | Chance |`;

const userMessage = `User Profile:
Program: ${sampleUserData.program}
Intake Mode: ${sampleUserData.intakeMode}
STEM Required: ${sampleUserData.stemRequired}
F-1 Required: ${sampleUserData.f1Required}
GPA: ${sampleUserData.gpa} (${sampleUserData.gpaScale} scale)
University: ${sampleUserData.university}
University Tier: ${sampleUserData.universityTier}
Degree: ${sampleUserData.degree}
${sampleUserData.mathProgrammingStats ? `Math/Programming/Stats: ${sampleUserData.mathProgrammingStats}` : ''}
Degree Length: ${sampleUserData.degreeLength}
Masters Degree: ${sampleUserData.mastersDegree}
GRE Total: ${sampleUserData.greTotal || 'Not provided'}
GRE Quant: ${sampleUserData.greQuant || 'Not provided'}
GRE Verbal: ${sampleUserData.greVerbal || 'Not provided'}
GRE AWA: ${sampleUserData.greAWA || 'Not provided'}
GMAT Total: ${sampleUserData.gmatTotal || 'Not provided'}

CRITICAL TASK:
Immediately provide 20 real universities with ${sampleUserData.program} programs for 2024-2025. Do NOT ask questions.

IMMEDIATE REQUIREMENTS:
- Provide exactly 20 universities with current tuition fees (no estimates)
- Use real 2024-2025 rankings and program data
- Include only STEM-designated programs with F-1 eligibility
- Distribute as: 5 Ambitious, 5 Target, 5 Safe, 5 Backup
- Base scoring on provided profile data

RESPOND ONLY with the table format:
| University | Program | Length | Tuition | Location | STEM | F-1 | Chance |

NO questions, NO additional requests - just the 20 universities table.`;

// Parser to extract universities from GPT response
function parseAIResponse(aiText) {
  console.log('🔍 Parsing AI response...');

  const tiers = { ambitious: [], target: [], safe: [], backup: [] };
  let currentTier = '';
  let currentUniversity = null;

  const lines = aiText.split('\n');

  lines.forEach((line) => {
    const cleanLine = line.trim();
    const lowerLine = cleanLine.toLowerCase();

    // Detect tier sections
    if (lowerLine.includes('ambitious')) currentTier = 'ambitious';
    else if (lowerLine.includes('target')) currentTier = 'target';
    else if (lowerLine.includes('safe')) currentTier = 'safe';
    else if (lowerLine.includes('backup')) currentTier = 'backup';

    // Detect university names
    if (currentTier && (cleanLine.includes('University') || cleanLine.includes('Business School') ||
        cleanLine.includes('School') || cleanLine.includes('(') && cleanLine.includes(')'))) {

      // If we have a previous university, add it
      if (currentUniversity && tiers[currentTier].length < 5) {
        tiers[currentTier].push(currentUniversity);
      }

      // Start new university
      let universityName = cleanLine;

      // Extract clean university name
      if (cleanLine.includes('|')) {
        universityName = cleanLine.split('|')[0].trim();
      } else if (cleanLine.includes(' ] ')) {
        universityName = cleanLine.split(' ] ')[0].replace('[', '').trim();
      } else {
        // Remove program details and keep only university name
        universityName = cleanLine
          .replace(/\s*\|\s*(MS|MBA|Full-Time MBA|Daytime MBA|One-Year MBA).*$/, '')
          .replace(/\s*(MS|MBA|Full-Time MBA|Daytime MBA|One-Year MBA).*$/, '')
          .replace(/\s*\(\[.*?\]\).*$/, '')
          .replace(/\s*\(https?:\/\/.*?\).*$/, '')
          .trim();
      }

      currentUniversity = {
        id: `${currentTier}-${tiers[currentTier].length}`,
        name: universityName,
        university: universityName,
        program: 'MBA',
        tier: currentTier,
        probability: Math.round(currentTier === 'ambitious' ? 15 + Math.random() * 10 :
                    currentTier === 'target' ? 35 + Math.random() * 15 :
                    currentTier === 'safe' ? 60 + Math.random() * 20 :
                    80 + Math.random() * 15),
        ranking: { national: null },
        location: 'United States',
        tuition: 'Contact University',
        description: 'MBA program',
        acceptanceRate: null,
        stemDesignated: true,
        f1Eligible: true,
        accepts3Year: true,
        features: ['Research Opportunities', 'Career Services']
      };
    }

    // Extract tuition info
    if (currentUniversity && cleanLine.includes('$')) {
      const tuitionMatch = cleanLine.match(/\$[\d,]+(?:\/yr|\/semester|total)?/) ||
                          cleanLine.match(/Tuition[:\s]*\$[\d,]+/) ||
                          cleanLine.match(/\$[\d,]+(?:\s*\/yr|\s*total|\s*per year)?/);
      if (tuitionMatch) {
        let tuition = tuitionMatch[0];
        tuition = tuition.replace(/^Tuition[:\s]*/, '');
        currentUniversity.tuition = tuition;
      }
    }

    // Extract probability
    if (currentUniversity && cleanLine.includes('%') && cleanLine.includes('Admission Probability')) {
      const probMatch = cleanLine.match(/(\d+)%/);
      if (probMatch) {
        currentUniversity.probability = parseInt(probMatch[1]);
      }
    }
  });

  // Add the last university if exists
  if (currentUniversity && currentTier && tiers[currentTier].length < 5) {
    tiers[currentTier].push(currentUniversity);
  }

  const total = Object.values(tiers).reduce((sum, tier) => sum + tier.length, 0);
  console.log(`📊 Parsed ${total} recommendations:`, tiers);

  return { ...tiers, total };
}

async function findColleges() {
  try {
    console.log('🚀 Starting OpenAI API call for college recommendations...');
    const response = await client.responses.create({
      model: "gpt-5",
      reasoning: { effort: "low" },
      tools: [
        { type: "web_search" }
      ],
      input: `${systemPrompt}\n\n${userMessage}`
    });

    const aiRecommendations = response.output_text || '';
    console.log('✅ AI Response received:');
    console.log(aiRecommendations);

    // Parse the response
    const structuredRecommendations = parseAIResponse(aiRecommendations);
    console.log('📋 Structured recommendations:', structuredRecommendations);

    return { rawResponse: aiRecommendations, parsed: structuredRecommendations };

  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    throw error;
  }
}

export { findColleges, systemPrompt, userMessage };