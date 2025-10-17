import React, { useState, useRef } from 'react';
import { HelpCircle, Upload, Download, X } from 'lucide-react';
import Navigation from '@/components/static/Navigation';
import Footer from '@/components/static/Footer';

const CGPAToGPAConverter = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [cgpa, setCgpa] = useState('');
  const [gpa, setGpa] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const fileInputRef = useRef(null);
  
  // Tier 2 states
  const [aShare, setAShare] = useState(35);
  const [bShare, setBShare] = useState(55);
  const [cShare, setCShare] = useState(10);
  
  // Tier 3 states
  const [csvData, setCsvData] = useState([
    { id: 1, course: 'Engineering Mathematics I', credit: 3, grade: 'B', bucket: 'B' },
    { id: 2, course: 'Engineering Mathematics I', credit: 3, grade: 'B', bucket: 'B' },
    { id: 3, course: 'Engineering Mathematics I', credit: 3, grade: 'B', bucket: 'B' },
    { id: 4, course: 'Engineering Mathematics I', credit: 3, grade: 'B', bucket: 'B' },
    { id: 5, course: 'Engineering Mathematics I', credit: 3, grade: 'B', bucket: 'B' },
    { id: 6, course: 'Engineering Mathematics I', credit: 3, grade: 'B', bucket: 'B' },
  ]);
  const [uploadedFile, setUploadedFile] = useState(false);

  // CGPA to GPA conversion formula
  const convertCGPAtoGPA = (cgpaValue, useDistribution = false) => {
    if (!cgpaValue || isNaN(cgpaValue)) return null;
    
    const cgpaFloat = parseFloat(cgpaValue);
    if (cgpaFloat < 0 || cgpaFloat > 10) return null;
    
    // Standard conversion formula: GPA = (CGPA / 10) * 4
    let baseGPA = (cgpaFloat / 10) * 4;
    
    // Apply distribution adjustments for Tier 2
    if (useDistribution && activeTab === 2) {
      // Weighted adjustment based on grade distribution
      const totalPercentage = aShare + bShare + cShare;
      if (totalPercentage !== 100) {
        // Normalize to 100%
        const normalizedA = (aShare / totalPercentage) * 100;
        const normalizedB = (bShare / totalPercentage) * 100;
        const normalizedC = (cShare / totalPercentage) * 100;
        
        // Apply slight adjustment based on distribution
        const distributionFactor = (normalizedA * 0.01) - (normalizedC * 0.005);
        baseGPA = Math.min(4.0, baseGPA + distributionFactor);
      }
    }
    
    // Round to 1 decimal place
    return Math.round(baseGPA * 10) / 10;
  };

  const handleSubmit = () => {
    if (activeTab === 3 && csvData.length > 0) {
      // Calculate GPA from transcript data
      let totalPoints = 0;
      let totalCredits = 0;
      
      csvData.forEach(row => {
        const gradePoints = getGradePoints(row.grade);
        totalPoints += gradePoints * row.credit;
        totalCredits += row.credit;
      });
      
      const calculatedGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
      setGpa(Math.round(calculatedGPA * 10) / 10);
    } else {
      const convertedGPA = convertCGPAtoGPA(cgpa, activeTab === 2);
      setGpa(convertedGPA);
    }
  };

  const getGradePoints = (grade) => {
    const gradeMap = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D': 1.0, 'F': 0.0, 'O': 4.0
    };
    return gradeMap[grade] || 0;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1); // Skip header
        const parsedData = rows.map((row, index) => {
          const [course, credit, grade] = row.split(',');
          return {
            id: index + 1,
            course: course?.trim() || `Course ${index + 1}`,
            credit: parseInt(credit) || 3,
            grade: grade?.trim() || 'B',
            bucket: grade?.trim() || 'B'
          };
        }).filter(row => row.course); // Filter empty rows
        
        if (parsedData.length > 0) {
          setCsvData(parsedData);
          setUploadedFile(true);
          // Auto-calculate after upload
          setTimeout(() => {
            let totalPoints = 0;
            let totalCredits = 0;
            
            parsedData.forEach(row => {
              const gradePoints = getGradePoints(row.grade);
              totalPoints += gradePoints * row.credit;
              totalCredits += row.credit;
            });
            
            const calculatedGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
            setGpa(Math.round(calculatedGPA * 10) / 10);
          }, 100);
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "Course,Credit,Grade\nEngineering Mathematics I,3,B\nPhysics,4,A\nChemistry,3,B+\nProgramming,4,A-\nEnglish,2,B";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transcript.csv';
    a.click();
  };

  const resetCalculator = () => {
    setCgpa('');
    setGpa(null);
    setShowExplanation(false);
    setAShare(35);
    setBShare(55);
    setCShare(10);
    setUploadedFile(false);
  };

  return (
    <div className="min-h-screen bg-gray-50  relative">

      <Navigation/>
      <section className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 text-white py-20 pt-[200px]">
         <div className="text-center mb-10 flex flex-col justify-center items-center">
          <h1 className="text-6xl md:w-[60%] text-center font-bold text-white mb-2">
            10 Point CGPA to 4 Point GPA Converter Online
          </h1>
          <p className="text-white">
            Enter your scores, get instant conversions. Plan smart. Apply better
          </p>
        </div>
      </section>
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        

        {/* Main Calculator Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Tier Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-8">
              <button
                onClick={() => { setActiveTab(1); resetCalculator(); }}
                className={`pb-2 px-4 font-medium transition-all ${
                  activeTab === 1
                    ? 'text-teal-700 border-b-3 border-teal-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ borderBottomWidth: activeTab === 1 ? '3px' : '0' }}
              >
                Tier 1
              </button>
              <button
                onClick={() => { setActiveTab(2); resetCalculator(); }}
                className={`pb-2 px-4 font-medium transition-all ${
                  activeTab === 2
                    ? 'text-teal-700 border-b-3 border-teal-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ borderBottomWidth: activeTab === 2 ? '3px' : '0' }}
              >
                Tier 2
              </button>
              <button
                onClick={() => { setActiveTab(3); resetCalculator(); }}
                className={`pb-2 px-4 font-medium transition-all ${
                  activeTab === 3
                    ? 'text-teal-700 border-b-3 border-teal-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ borderBottomWidth: activeTab === 3 ? '3px' : '0' }}
              >
                Tier 3
              </button>
            </div>
          </div>

          {/* Tier 1 Content */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  CGPA
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (e.target.value === '') {
                        setCgpa('');
                      } else if (value >= 0 && value <= 10) {
                        setCgpa(e.target.value);
                      } else if (value > 10) {
                        setCgpa('10');
                      } else if (value < 0) {
                        setCgpa('0');
                      }
                    }}
                    placeholder="Enter your CGPA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={!cgpa}
                  className="px-8 py-3 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowPopup(true)}
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
                >
                  <HelpCircle size={18} />
                  <span>How it works?</span>
                </button>
              </div>

              {gpa !== null && (
                <div className="mt-6 p-6 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-semibold text-gray-800">
                    Your GPA is {gpa}
                  </p>
                </div>
              )}

              {gpa !== null && (
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-medium">Assumptions by band (by credits):</p>
                  <p>&lt;6 → A 20% / B 50% / C 30% · 6-&lt;7 → 45/35/20 · 7-&lt;8 → 70/20/10 · 8-&lt;9 → 80/15/5 · ≥9 → 90/8/2.</p>
                </div>
              )}
            </div>
          )}

          {/* Tier 2 Content */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  CGPA
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (e.target.value === '') {
                        setCgpa('');
                      } else if (value >= 0 && value <= 10) {
                        setCgpa(e.target.value);
                      } else if (value > 10) {
                        setCgpa('10');
                      } else if (value < 0) {
                        setCgpa('0');
                      }
                    }}
                    placeholder="Enter your CGPA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={!cgpa}
                  className="px-8 py-3 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowPopup(true)}
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
                >
                  <HelpCircle size={18} />
                  <span>How it works?</span>
                </button>
              </div>

              
                <>

                  {gpa !== null && (
                  <div className="mt-6 p-6 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-semibold text-gray-800">
                      Your GPA is {gpa}
                    </p>
                  </div>
                  )}

                  <div className="mt-6 space-y-6">
                    <h3 className="font-medium text-gray-700">
                      Set your distribution by credits (recommended).
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-gray-700">A share (%)</label>
                          <input
                            type="number"
                            value={aShare}
                            onChange={(e) => setAShare(Number(e.target.value))}
                            className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={aShare}
                          onChange={(e) => setAShare(Number(e.target.value))}
                          className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #0f766e 0%, #0f766e ${aShare}%, #e5e7eb ${aShare}%, #e5e7eb 100%)`
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-gray-700">B share (%)</label>
                          <input
                            type="number"
                            value={bShare}
                            onChange={(e) => setBShare(Number(e.target.value))}
                            className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={bShare}
                          onChange={(e) => setBShare(Number(e.target.value))}
                          className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #0f766e 0%, #0f766e ${bShare}%, #e5e7eb ${bShare}%, #e5e7eb 100%)`
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-gray-700">C share (%)</label>
                          <input
                            type="number"
                            value={cShare}
                            onChange={(e) => setCShare(Number(e.target.value))}
                            className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={cShare}
                          onChange={(e) => setCShare(Number(e.target.value))}
                          className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #0f766e 0%, #0f766e ${cShare}%, #e5e7eb ${cShare}%, #e5e7eb 100%)`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                </>
            
            </div>
          )}

          {/* Tier 3 Content */}
          {activeTab === 3 && (
            <div className="space-y-6">
              {!uploadedFile ? (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Upload your Marksheet</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    CSV columns (header required): course, credit, grade. Grades can be O, A+/A/A-, B+/B/B-, C+/C/C-, D, F, or PASS. PASS/0-credit rows are excluded from the denominator.
                  </p>
                  
                  <div className="flex space-x-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".csv"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-800 transition-colors flex items-center space-x-2"
                    >
                      <Upload size={18} />
                      <span>Choose CSV</span>
                    </button>
                    <button
                      onClick={downloadSampleCSV}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Download size={18} />
                      <span>Download Sample CSV</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">Upload your Marksheet</h3>
                    <button
                      onClick={() => { setUploadedFile(false); setGpa(null); }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600">
                    CSV columns (header required): course, credit, grade. Grades can be O, A+/A/A-, B+/B/B-, C+/C/C-, D, F, or PASS. PASS/0-credit rows are excluded from the denominator.
                  </p>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-800 transition-colors flex items-center space-x-2"
                    >
                      <Upload size={18} />
                      <span>Choose CSV</span>
                    </button>
                    <button
                      onClick={downloadSampleCSV}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Download size={18} />
                      <span>Download Sample CSV</span>
                    </button>
                  </div>

                  {/* Data Table */}
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">#</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Course</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Credit</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Grade</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Bucket</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {csvData.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">{row.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">{row.course}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 text-center">{row.credit}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 text-center font-medium">{row.grade}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 text-center">{row.bucket}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {gpa !== null && (
                    <div className="mt-6 p-6 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-semibold text-gray-800">
                        Your GPA is {gpa}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

       {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-[#0000002f] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">How we calculate this</h2>
            
            {activeTab === 2 ? (
              // Tier 2 Modal Content
              <div className="space-y-4 text-gray-700">
                <p>We put your grades into 3 groups:</p>
                
                <div className="space-y-2">
                  <p><strong>1) A = 4.0 GPA</strong> → includes all A+, A, A-, or "O" (outstanding).</p>
                  <p><strong>2) B = 3.0 GPA</strong> → includes B+, B, or B-.</p>
                  <p><strong>3) C = 2.0 GPA</strong> → anything lower than a B.</p>
                </div>
                
                <p className="mt-4">To keep it simple, we assume:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Every class is worth about 3 credits.</li>
                  <li>Credits are spread evenly across your A, B, and C grades.</li>
                  <li>That's how services like WES usually convert grades.</li>
                </ul>
                
                <p className="mt-4 font-semibold">Next step</p>
                <p>
                  If you upload your full transcript (Tier 3), we can do the same calculation course-by-course. 
                  That gives you the most accurate GPA.
                </p>
              </div>
            ) : (
              // Tier 1 Modal Content  
              <div className="space-y-4 text-gray-700">
                <h4 className="font-semibold text-gray-800">How we estimated your GPA</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• We first turn your CGPA (out of 10) into a percentage. A simple rule is CGPA × 9.5, capped at 95%.</li>
                  <li>• We then imagine a "typical" grade pattern for students with that average (a mix of A's, B's, and some C's).</li>
                  <li>• We convert that pattern into U.S. GPA points (0-4.0 scale). Because we don't know your exact transcript, we show a range.</li>
                </ul>
                <p className="mt-3 text-sm text-gray-700">
                  Note: Adding credits or grade mix in the next step can tighten the range
                </p>
              </div>
            )}
          </div>
        </div>
      )}  

      <Footer/>
    </div>
  );
};

export default CGPAToGPAConverter;