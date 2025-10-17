import { CalendarIcon, LocateFixedIcon, CalendarRangeIcon, FileIcon, BuildingIcon, GraduationCapIcon, UniversityIcon, WorkflowIcon, BaggageClaimIcon, MailIcon, PhoneIcon, ClockIcon, BriefcaseBusiness, UserIcon, FlagIcon, MapPinIcon, PencilIcon } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useEffect, useState } from 'react';
import ProfileDetailsCard, { DataField } from '@/components/ProfileDetailsCard';
import { ListBulletIcon } from '@radix-ui/react-icons';
import SidebarHeader from '@/components/SidebarHeader';
import { getUserProfile } from '@/services/api.services';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ProfileEditForm from './components/ProfileEditForm';

const ProfilePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const [nameData, setNameData] = useState('');
  const [personalDetails, setPersonalDetails] = useState({
    dob: '',
    gender: '',
    address: '',
    profession: ''
  });

  const [contactDetails, setContactDetails] = useState({
    phoneNumber: ''
  });

  const [programDetails, setProgramDetails] = useState({
    program: '',
    validity: ''
  });

  const [collegeDetails, setCollegeDetails] = useState({
    branch: '',
    highestDegree: '',
    university: '',
    college: '',
    gpa: '',
    toppersGPA: '',
    noOfBacklogs: '',
    admissionTerm: '',
    coursesApplying: []
  });

  const [greDetails, setGreDetails] = useState({
    grePlane: '',
    greDate: '',
    greScoreCard: '',
    greScore: {
      verbal: '',
      quant: '',
      awa: ''
    },
    retakingGRE: ''
  });

  const [ieltsDetails, setIeltsDetails] = useState({
    ieltsPlan: '',
    ieltsDate: '',
    ieltsScore: {
      reading: '',
      writing: '',
      speaking: '',
      listening: ''
    },
    retakingIELTS: ''
  });

  const [toeflDetails, setToeflDetails] = useState({
    toeflPlan: '',
    toeflDate: '',
    toeflScore: {
      reading: '',
      writing: '',
      speaking: ''
    },
    retakingTOEFL: ''
  });

  const [visaDetails, setVisaDetails] = useState({
    countriesPlanningToApply: [],
    visaInterviewDate: '',
    visaInterviewLocation: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        setUserData(response.data);

        if (response.data) {
          setNameData(response.data.name || '');

          setPersonalDetails({
            dob: response.data.personalDetails?.dob ? new Date(response.data.personalDetails.dob).toISOString().split('T')[0] : '',
            gender: response.data.personalDetails?.gender || '',
            address: response.data.personalDetails?.address || '',
            profession: response.data.personalDetails?.profession || ''
          });

          setContactDetails({
            phoneNumber: response.data.phoneNumber || ''
          });

          setProgramDetails({
            program: response.data.programDetails?.program || '',
            validity: response.data.programDetails?.validity ? new Date(response.data.programDetails.validity).toISOString().split('T')[0] : ''
          });

          setCollegeDetails({
            branch: response.data.collegeDetails?.branch || '',
            highestDegree: response.data.collegeDetails?.highestDegree || '',
            university: response.data.collegeDetails?.university || '',
            college: response.data.collegeDetails?.college || '',
            gpa: response.data.collegeDetails?.gpa || '',
            toppersGPA: response.data.collegeDetails?.toppersGPA || '',
            noOfBacklogs: response.data.collegeDetails?.noOfBacklogs || '',
            admissionTerm: response.data.collegeDetails?.admissionTerm || '',
            coursesApplying: response.data.collegeDetails?.coursesApplying || []
          });

          setGreDetails({
            grePlane: response.data.greDetails?.grePlane ? new Date(response.data.greDetails.grePlane).toISOString().split('T')[0] : '',
            greDate: response.data.greDetails?.greDate ? new Date(response.data.greDetails.greDate).toISOString().split('T')[0] : '',
            greScoreCard: response.data.greDetails?.greScoreCard || '',
            greScore: {
              verbal: response.data.greDetails?.greScore?.verbal || '',
              quant: response.data.greDetails?.greScore?.quant || '',
              awa: response.data.greDetails?.greScore?.awa || ''
            },
            retakingGRE: response.data.greDetails?.retakingGRE || ''
          });

          setIeltsDetails({
            ieltsPlan: response.data.ieltsDetails?.ieltsPlan ? new Date(response.data.ieltsDetails.ieltsPlan).toISOString().split('T')[0] : '',
            ieltsDate: response.data.ieltsDetails?.ieltsDate ? new Date(response.data.ieltsDetails.ieltsDate).toISOString().split('T')[0] : '',
            ieltsScore: {
              reading: response.data.ieltsDetails?.ieltsScore?.reading || '',
              writing: response.data.ieltsDetails?.ieltsScore?.writing || '',
              speaking: response.data.ieltsDetails?.ieltsScore?.speaking || '',
              listening: response.data.ieltsDetails?.ieltsScore?.listening || ''
            },
            retakingIELTS: response.data.ieltsDetails?.retakingIELTS || ''
          });

          setToeflDetails({
            toeflPlan: response.data.toeflDetails?.toeflPlan ? new Date(response.data.toeflDetails.toeflPlan).toISOString().split('T')[0] : '',
            toeflDate: response.data.toeflDetails?.toeflDate ? new Date(response.data.toeflDetails.toeflDate).toISOString().split('T')[0] : '',
            toeflScore: {
              reading: response.data.toeflDetails?.toeflScore?.reading || '',
              writing: response.data.toeflDetails?.toeflScore?.writing || '',
              speaking: response.data.toeflDetails?.toeflScore?.speaking || ''
            },
            retakingTOEFL: response.data.toeflDetails?.retakingTOEFL || ''
          });

          setVisaDetails({
            countriesPlanningToApply: response.data.visa?.countriesPlanningToApply || [],
            visaInterviewDate: response.data.visa?.visaInterviewDate ? new Date(response.data.visa.visaInterviewDate).toISOString().split('T')[0] : '',
            visaInterviewLocation: response.data.visa?.visaInterviewLocation || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleNameChange = (field, value) => {
    setNameData(value);
  };

  const handlePersonalDetailsChange = (field, value) => {
    setPersonalDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactDetailsChange = (field, value) => {
    setContactDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProgramDetailsChange = (field, value) => {
    setProgramDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCollegeDetailsChange = (field, value) => {
    if (field === 'coursesApplying') {
      const courses = value.split(',').map(course => course.trim());
      setCollegeDetails(prev => ({
        ...prev,
        [field]: courses
      }));
    } else {
      setCollegeDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleGreDetailsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setGreDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setGreDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleIeltsDetailsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setIeltsDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setIeltsDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleToeflDetailsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setToeflDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setToeflDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  const handleVisaDetailsChange = (field, value) => {
    if (field === 'countriesPlanningToApply') {
      const countries = value.split(',').map(country => country.trim());
      setVisaDetails(prev => ({
        ...prev,
        [field]: countries
      }));
    } else {
      setVisaDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCloseEditMode = () => {
    setEditMode(false);
  };
  const handleSuccess = async () => {
    try {
      setLoading(true);
      // Fetch fresh profile data
      const response = await getUserProfile();
      if (response.data) {
        setUserData(response.data);
        // Close edit mode
        setEditMode(false);
        setNameData(response.data.name || '');
        setPersonalDetails({
          dob: response.data.personalDetails?.dob ? new Date(response.data.personalDetails.dob).toISOString().split('T')[0] : '',
          gender: response.data.personalDetails?.gender || '',
          address: response.data.personalDetails?.address || '',
          profession: response.data.personalDetails?.profession || ''
        });
        setContactDetails({
          phoneNumber: response.data.phoneNumber || ''
        });
        setProgramDetails({
          program: response.data.programDetails?.program || '',
          validity: response.data.programDetails?.validity ? new Date(response.data.programDetails.validity).toISOString().split('T')[0] : ''
        });
        setCollegeDetails({
          branch: response.data.collegeDetails?.branch || '',
          highestDegree: response.data.collegeDetails?.highestDegree || '',
          university: response.data.collegeDetails?.university || '',
          college: response.data.collegeDetails?.college || '',
          gpa: response.data.collegeDetails?.gpa || '',
          toppersGPA: response.data.collegeDetails?.toppersGPA || '',
          noOfBacklogs: response.data.collegeDetails?.noOfBacklogs || '',
          admissionTerm: response.data.collegeDetails?.admissionTerm || '',
          coursesApplying: response.data.collegeDetails?.coursesApplying || []
        });
        setGreDetails({
          grePlane: response.data.greDetails?.grePlane ? new Date(response.data.greDetails.grePlane).toISOString().split('T')[0] : '',
          greDate: response.data.greDetails?.greDate ? new Date(response.data.greDetails.greDate).toISOString().split('T')[0] : '',
          greScoreCard: response.data.greDetails?.greScoreCard || '',
          greScore: {
            verbal: response.data.greDetails?.greScore?.verbal || '',
            quant: response.data.greDetails?.greScore?.quant || '',
            awa: response.data.greDetails?.greScore?.awa || ''
          },
          retakingGRE: response.data.greDetails?.retakingGRE || ''
        });
        setIeltsDetails({
          ieltsPlan: response.data.ieltsDetails?.ieltsPlan ? new Date(response.data.ieltsDetails.ieltsPlan).toISOString().split('T')[0] : '',
          ieltsDate: response.data.ieltsDetails?.ieltsDate ? new Date(response.data.ieltsDetails.ieltsDate).toISOString().split('T')[0] : '',
          ieltsScore: {
            reading: response.data.ieltsDetails?.ieltsScore?.reading || '',
            writing: response.data.ieltsDetails?.ieltsScore?.writing || '',
            speaking: response.data.ieltsDetails?.ieltsScore?.speaking || '',
            listening: response.data.ieltsDetails?.ieltsScore?.listening || ''
          },
          retakingIELTS: response.data.ieltsDetails?.retakingIELTS || ''
        });
        setToeflDetails({
          toeflPlan: response.data.toeflDetails?.toeflPlan ? new Date(response.data.toeflDetails.toeflPlan).toISOString().split('T')[0] : '',
          toeflDate: response.data.toeflDetails?.toeflDate ? new Date(response.data.toeflDetails.toeflDate).toISOString().split('T')[0] : '',
          toeflScore: {
            reading: response.data.toeflDetails?.toeflScore?.reading || '',
            writing: response.data.toeflDetails?.toeflScore?.writing || '',
            speaking: response.data.toeflDetails?.toeflScore?.speaking || ''
          },
          retakingTOEFL: response.data.toeflDetails?.retakingTOEFL || ''
        });
        setVisaDetails({
          countriesPlanningToApply: response.data.visa?.countriesPlanningToApply || [],
          visaInterviewDate: response.data.visa?.visaInterviewDate ? new Date(response.data.visa.visaInterviewDate).toISOString().split('T')[0] : '',
          visaInterviewLocation: response.data.visa?.visaInterviewLocation || ''
        });
      }
    } catch (err) {
      console.error('Error fetching updated profile data:', err);
      toast.error('Failed to refresh profile data');
    } finally {
      setLoading(false);
      setEditMode(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar isSidebarOpen={isOpen} />
          <SidebarInset>
            <SidebarHeader isSidebarOpen={isOpen} setIsOpen={setIsOpen} />
            <div className="p-5 flex justify-center items-center min-h-[80vh]">
              <div className="text-center">
                <div className="spinner"></div>
                <p className="mt-2">Loading profile data...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }
  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar isSidebarOpen={isOpen} />
          <SidebarInset>
            <SidebarHeader isSidebarOpen={isOpen} setIsOpen={setIsOpen} />
            <div className="p-5 flex justify-center items-center min-h-[80vh]">
              <div className="text-center text-red-600">
                <p>{error}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-primary-1 text-white rounded-md"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (editMode) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar isSidebarOpen={isOpen} />
          <SidebarInset>
            <SidebarHeader isSidebarOpen={isOpen} setIsOpen={setIsOpen} />
            
            <div className="p-5">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">Edit Profile</h1>
                  <p className="text-muted-foreground">Update your profile information</p>
                </div>
                <Button variant="outline" onClick={handleCloseEditMode}>
                  Cancel
                </Button>
              </div>
              <ProfileEditForm userData={userData} onClose={handleCloseEditMode} onSuccess={handleSuccess} />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar isSidebarOpen={isOpen} />
        <SidebarInset>
          <SidebarHeader isSidebarOpen={isOpen} setIsOpen={setIsOpen} />
          <div className="p-5">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">View and manage your profile information</p>
              </div>
              <Button onClick={() => setEditMode(true)} className="bg-primary-1 hover:bg-primary-1/90 cursor-pointer"> 
                <PencilIcon className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 bg-gray-50">             
               <div className="sm:col-span-2 lg:col-span-4">
                <div className="bg-white rounded-lg shadow-sm p-5 h-full">
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">                      
                      <div className="lg:col-span-5">
                        <div className="relative w-full aspect-square max-w-[300px] mx-auto">                          
                          <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-md">
                            {userData?.profilePicture ? (
                              <img
                                src={userData.profilePicture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <p className="text-gray-500 text-sm text-center px-4">No profile image found</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-7">
                        <div className="mb-5 max-w-[250px] border-0 shadow-none">
                          <ProfileDetailsCard 
                            title="Program Details"
                            canEdit={false}
                            className="border-0 shadow-none"
                          >
                            <DataField
                              icon={<BriefcaseBusiness className="w-5 h-5" fill='#145044' />}
                              label="Program"
                              value={programDetails.program}
                              fieldName="program"
                              onValueChange={handleProgramDetailsChange}
                            />
                            <DataField
                              icon={<ClockIcon className="w-5 h-5" />}
                              label="Validity"
                              value={programDetails.validity}
                              fieldName="validity"
                              fieldType="date"
                              onValueChange={handleProgramDetailsChange}
                            />
                          </ProfileDetailsCard>
                        </div>
                        <ProfileDetailsCard 
                          title="Contact Details" 
                          canEdit={false}
                          className="border-0 shadow-none"
                        >
                          <DataField
                            icon={<PhoneIcon className="w-5 h-5" />}
                            label="Phone"
                            value={contactDetails.phoneNumber || 'Not set'}
                            fieldName="phoneNumber"
                            onValueChange={handleContactDetailsChange}
                          />
                          <DataField
                            icon={<MailIcon className="w-5 h-5" />}
                            label="E-mail"
                            value={userData?.email || 'Not set'}
                          />
                        </ProfileDetailsCard>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-1 lg:col-span-3">
                <ProfileDetailsCard 
                  title="Personal Details" 
                  canEdit={false}
                >
                  <div className="space-y-5">
                    <DataField
                      icon={<UserIcon className="w-5 h-5" />}
                      label="Name"
                      value={nameData}
                      fieldName="name"
                      onValueChange={handleNameChange}
                    />
                    <DataField
                      icon={<CalendarIcon className="w-5 h-5" />}
                      label="Date of Birth"
                      value={personalDetails.dob}
                      fieldName="dob"
                      fieldType="date"
                      onValueChange={handlePersonalDetailsChange}
                    />
                    <DataField
                      icon={<BaggageClaimIcon className="w-5 h-5" />}
                      label="Gender"
                      value={personalDetails.gender}
                      fieldName="gender"
                      fieldType="select"
                      options={[
                        { value: '', label: 'Select gender' },
                        { value: 'MALE', label: 'Male' },
                        { value: 'FEMALE', label: 'Female' },
                        { value: 'OTHER', label: 'Other' }
                      ]}
                      onValueChange={handlePersonalDetailsChange}
                    />
                    <DataField
                      icon={<LocateFixedIcon className="w-5 h-5" />}
                      label="Address"
                      value={personalDetails.address}
                      fieldName="address"
                      onValueChange={handlePersonalDetailsChange}
                    />
                    <DataField
                      icon={<WorkflowIcon className="w-5 h-5" />}
                      label="Profession"
                      value={personalDetails.profession}
                      fieldName="profession"
                      onValueChange={handlePersonalDetailsChange}
                    />
                  </div>
                </ProfileDetailsCard>
              </div>

              <div className="sm:col-span-1 lg:col-span-5">
                <ProfileDetailsCard 
                  title="College Details" 
                  canEdit={false}
                >
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-1 space-y-5">
                      <DataField
                        icon={<GraduationCapIcon className="w-5 h-5" />}
                        label="Branch"
                        value={collegeDetails.branch}
                        fieldName="branch"
                        onValueChange={handleCollegeDetailsChange}
                      />
                      <DataField
                        icon={<UniversityIcon className="w-5 h-5" />}
                        label="University"
                        value={collegeDetails.university}
                        fieldName="university"
                        onValueChange={handleCollegeDetailsChange}
                      />
                      <DataField
                        icon={<ListBulletIcon className="w-5 h-5" />}
                        label="GPA"
                        value={collegeDetails.gpa}
                        fieldName="gpa"
                        fieldType="number"
                        onValueChange={handleCollegeDetailsChange}
                      />
                      <DataField
                        icon={<ListBulletIcon className="w-5 h-5" />}
                        label="Toppers GPA"
                        value={collegeDetails.toppersGPA}
                        fieldName="toppersGPA"
                        fieldType="number"
                        onValueChange={handleCollegeDetailsChange}
                      />
                      <DataField
                        icon={<ListBulletIcon className="w-5 h-5" />}
                        label="No of backlogs"
                        value={collegeDetails.noOfBacklogs}
                        fieldName="noOfBacklogs"
                        fieldType="number"
                        onValueChange={handleCollegeDetailsChange}
                      />
                    </div>
                    <div className="col-span-1 space-y-5">
                      <DataField
                        icon={<GraduationCapIcon className="w-5 h-5" />}
                        label="Highest Degree"
                        value={collegeDetails.highestDegree}
                        fieldName="highestDegree"
                        onValueChange={handleCollegeDetailsChange}
                      />
                      <DataField
                        icon={<BuildingIcon className="w-5 h-5" />}
                        label="College"
                        value={collegeDetails.college}
                        fieldName="college"
                        onValueChange={handleCollegeDetailsChange}
                      />
                      <DataField
                        icon={<CalendarRangeIcon className="w-5 h-5" />}
                        label="Admission Term"
                        value={collegeDetails.admissionTerm}
                        fieldName="admissionTerm"
                        onValueChange={handleCollegeDetailsChange}
                      />
                      <DataField
                        icon={<FileIcon className="w-5 h-5" />}
                        label="Courses applying"
                        value={collegeDetails.coursesApplying.join(', ')}
                        fieldName="coursesApplying"
                        onValueChange={handleCollegeDetailsChange}
                      />
                    </div>
                  </div>
                </ProfileDetailsCard>
              </div>

              <div className="sm:col-span-1 lg:col-span-4">
                <ProfileDetailsCard 
                  title="GRE"
                  canEdit={false}
                >
                  <div className="space-y-5">
                    <DataField
                      icon={<CalendarIcon className="w-5 h-5" />}
                      label="GRE Plan"
                      value={greDetails.grePlane}
                      fieldName="grePlane"
                      fieldType="date"
                      onValueChange={handleGreDetailsChange}
                    />
                    
                    <DataField
                      icon={<CalendarIcon className="w-5 h-5" />}
                      label="GRE Date"
                      value={greDetails.greDate}
                      fieldName="greDate"
                      fieldType="date"
                      onValueChange={handleGreDetailsChange}
                    />
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                        <ListBulletIcon className="w-5 h-5 stroke-white" />
                      </div>
                      <div>
                        <div className="">GRE Score</div>                       
                         <div className="grid grid-cols-3 gap-2 text-sm text-gray-500">
                          <div>
                            <div className="text-gray-500">Verbal</div>
                            <input
                              type="number"
                              value={greDetails.greScore.verbal}
                              onChange={(e) => handleGreDetailsChange('greScore.verbal', e.target.value)}
                              disabled
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                            />
                          </div>
                          <div>
                            <div className="text-gray-500">Quant</div>
                            <input
                              type="number"
                              value={greDetails.greScore.quant}
                              onChange={(e) => handleGreDetailsChange('greScore.quant', e.target.value)}
                              disabled
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                            />
                          </div>
                          <div>
                            <div className="text-gray-500">AWA</div>
                            <input
                              type="number"
                              value={greDetails.greScore.awa}
                              onChange={(e) => handleGreDetailsChange('greScore.awa', e.target.value)}
                              disabled
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DataField
                      icon={<FileIcon className="w-5 h-5" />}
                      label="GRE Scorecard"
                      value={greDetails.greScoreCard}
                      fieldName="greScoreCard"
                      onValueChange={handleGreDetailsChange}
                    />
                    
                    <DataField
                      icon={<CalendarRangeIcon className="w-5 h-5" />}
                      label="Retaking GRE"
                      value={greDetails.retakingGRE}
                      fieldName="retakingGRE"
                      fieldType="select"
                      options={[
                        { value: '', label: 'Select' },
                        { value: 'YES', label: 'Yes' },
                        { value: 'NO', label: 'No' },
                        { value: 'MAYBE', label: 'Maybe' }
                      ]}
                      onValueChange={handleGreDetailsChange}
                    />
                  </div>
                </ProfileDetailsCard>
              </div>

              <div className="sm:col-span-1 lg:col-span-4">
                <ProfileDetailsCard 
                  title="IELTS"
                  canEdit={false}
                >
                  <div className="space-y-5">
                    <DataField
                      icon={<CalendarIcon className="w-5 h-5" />}
                      label="IELTS Plan"
                      value={ieltsDetails.ieltsPlan}
                      fieldName="ieltsPlan"
                      fieldType="date"
                      onValueChange={handleIeltsDetailsChange}
                    />
                    
                    <DataField
                      icon={<CalendarIcon className="w-5 h-5" />}
                      label="IELTS Date"
                      value={ieltsDetails.ieltsDate}
                      fieldType="date"
                      fieldName="ieltsDate"
                      onValueChange={handleIeltsDetailsChange}
                    />
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                        <ListBulletIcon className="w-5 h-5 stroke-white" />
                      </div>
                      <div>
                        <div className="">IELTS Score</div>                        <div className="grid grid-cols-4 gap-2 text-sm text-gray-500">
                          <div>
                            <div className="text-gray-500">Reading</div>
                            <input
                              type="number"
                              value={ieltsDetails.ieltsScore.reading}
                              onChange={(e) => handleIeltsDetailsChange('ieltsScore.reading', e.target.value)}
                              disabled
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                              step="0.5"
                            />
                          </div>
                          <div>
                            <div className="text-gray-500">Writing</div>
                            <input
                              type="number"
                              value={ieltsDetails.ieltsScore.writing}
                              onChange={(e) => handleIeltsDetailsChange('ieltsScore.writing', e.target.value)}
                              disabled
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                              step="0.5"
                            />
                          </div>
                          <div>
                            <div className="text-gray-500">Speaking</div>
                            <input
                              type="number"
                              value={ieltsDetails.ieltsScore.speaking}
                              onChange={(e) => handleIeltsDetailsChange('ieltsScore.speaking', e.target.value)}
                              disabled
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                              step="0.5"
                            />
                          </div>
                          <div>
                            <div className="text-gray-500">Listening</div>
                            <input
                              type="number"
                              value={ieltsDetails.ieltsScore.listening}
                              onChange={(e) => handleIeltsDetailsChange('ieltsScore.listening', e.target.value)}
                              disabled
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                              step="0.5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DataField
                      icon={<CalendarRangeIcon className="w-5 h-5" />}
                      label="Retaking IELTS"
                      value={ieltsDetails.retakingIELTS}
                      fieldName="retakingIELTS"
                      fieldType="select"
                      options={[
                        { value: '', label: 'Select' },
                        { value: 'YES', label: 'Yes' },
                        { value: 'NO', label: 'No' },
                        { value: 'MAYBE', label: 'Maybe' }
                      ]}
                      onValueChange={handleIeltsDetailsChange}
                    />
                  </div>
                </ProfileDetailsCard>
              </div>

              <div className="sm:col-span-1 lg:col-span-4">
                <ProfileDetailsCard 
                  title="TOEFL"
                  canEdit={false}
                >
                  <div className="space-y-5">
                    <DataField
                      icon={<CalendarIcon className="w-5 h-5" />}
                      label="TOEFL Plan"
                      value={toeflDetails.toeflPlan}
                      fieldName="toeflPlan"
                      fieldType="date"
                      onValueChange={handleToeflDetailsChange}
                    />
                    
                    <DataField
                      icon={<CalendarIcon className="w-5 h-5" />}
                      label="TOEFL Date"
                      value={toeflDetails.toeflDate}
                      fieldType="date"
                      fieldName="toeflDate"
                      onValueChange={handleToeflDetailsChange}
                    />
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                        <ListBulletIcon className="w-5 h-5 stroke-white" />
                      </div>
                      <div>
                        <div className="">TOEFL Score</div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-500">                          
                          <div>
                            <div className="text-gray-500">Reading</div>
                            <input
                              type="number"
                              value={toeflDetails.toeflScore.reading}
                              disabled
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                            />
                          </div>
                          <div>
                            <div className="text-gray-500">Writing</div>
                            <input
                              type="number"
                              value={toeflDetails.toeflScore.writing}
                              disabled
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                            />
                          </div>
                          <div>
                            <div className="text-gray-500">Speaking</div>
                            <input
                              type="number"
                              value={toeflDetails.toeflScore.speaking}
                              disabled
                              className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DataField
                      icon={<CalendarRangeIcon className="w-5 h-5" />}
                      label="Retaking TOEFL"
                      value={toeflDetails.retakingTOEFL}
                      fieldName="retakingTOEFL"
                      fieldType="select"
                      options={[
                        { value: '', label: 'Select' },
                        { value: 'YES', label: 'Yes' },
                        { value: 'NO', label: 'No' },
                        { value: 'MAYBE', label: 'Maybe' }
                      ]}
                      onValueChange={handleToeflDetailsChange}
                    />
                  </div>
                </ProfileDetailsCard>
              </div>

              <div className="sm:col-span-1 lg:col-span-4">
                <ProfileDetailsCard 
                  title="VISA"
                  canEdit={false}
                >
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                        <FlagIcon className="w-5 h-5 stroke-white" />
                      </div>
                      <div className="flex-grow">
                        <div className="">Countries Planning to Apply</div>
                        <Select
                          isMulti
                          value={visaDetails.countriesPlanningToApply?.map(country => ({ value: country, label: country })) || []}
                          onChange={(selected) => {
                            handleVisaDetailsChange('countriesPlanningToApply', selected.map(item => item.value));
                          }}
                          options={[
                            { value: 'USA', label: 'USA' },
                            { value: 'CANADA', label: 'Canada' },
                            { value: 'UK', label: 'UK' },
                            { value: 'AUSTRALIA', label: 'Australia' },
                            { value: 'GERMANY', label: 'Germany' },
                            { value: 'FRANCE', label: 'France' }
                          ]}
                          className="w-full text-sm"
                          classNamePrefix="select"
                        />
                      </div>
                    </div>
                    
                    <DataField
                      icon={<CalendarIcon className="w-5 h-5" />}
                      label="Visa Interview Date"
                      value={visaDetails.visaInterviewDate}
                      fieldName="visaInterviewDate"
                      fieldType="date"
                      onValueChange={handleVisaDetailsChange}
                    />
                    
                    <DataField
                      icon={<MapPinIcon className="w-5 h-5" />}
                      label="Visa Interview Location"
                      value={visaDetails.visaInterviewLocation}
                      fieldName="visaInterviewLocation"
                      onValueChange={handleVisaDetailsChange}
                    />
                  </div>
                </ProfileDetailsCard>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProfilePage;