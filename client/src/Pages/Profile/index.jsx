import {
  CalendarIcon,
  LocateFixedIcon,
  CalendarRangeIcon,
  FileIcon,
  BuildingIcon,
  GraduationCapIcon,
  UniversityIcon,
  WorkflowIcon,
  BaggageClaimIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
  BriefcaseBusiness,
  UserIcon,
  FlagIcon,
  MapPinIcon,
  PencilIcon,
} from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useEffect, useState } from 'react';
import ProfileDetailsCard, { DataField } from '@/components/ProfileDetailsCard';
import { ListBulletIcon } from '@radix-ui/react-icons';
import SidebarHeader from '@/components/SidebarHeader';
import { getUserProfile } from '@/services/api.services';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ProfileEditForm from './components/ProfileEditForm';
import { Select } from '@/components/ui/select';
import { SelectTrigger, SelectValue } from '@radix-ui/react-select';

const ProfilePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // ---------- State ----------
  const [nameData, setNameData] = useState('');
  const [personalDetails, setPersonalDetails] = useState({ dob: '', gender: '', address: '', profession: '' });
  const [contactDetails, setContactDetails] = useState({ phoneNumber: '' });
  const [programDetails, setProgramDetails] = useState({ program: '', validity: '' });

  // BACHELOR
  const [schoolDetails, setSchoolDetails] = useState({ schoolName: '', board: '', yearOfPassing: '', percentage: '' });
  const [satDetails, setSatDetails] = useState({ readingWriting: '', math: '', total: '', satPlan: '', satDate: '', satScoreCard: '' });
  const [actDetails, setActDetails] = useState({ english: '', math: '', total: '', actPlan: '', actDate: '', actScoreCard: '' });

  // MASTER
  const [collegeDetails, setCollegeDetails] = useState({
    branch: '',
    highestDegree: '',
    university: '',
    college: '',
    gpa: '',
    toppersGPA: '',
    noOfBacklogs: '',
    admissionTerm: '',
    coursesApplying: [],
  });
  const [gmatDetails, setGmatDetails] = useState({ total: '', quant: '', gmatPlan: '', gmatDate: '', gmatScoreCard: '' });

  // Common Tests
  const [duolingoDetails, setDuolingoDetails] = useState({
    reading: '',
    writing: '',
    listening: '',
    speaking: '',
    duolingoPlan: '',
    duolingoDate: '',
    retakingDuolingo: '',
  });
  const [greDetails, setGreDetails] = useState({
    grePlan: '',
    greDate: '',
    greScoreCard: '',
    greScore: { verbal: '', quant: '', awa: '' },
    retakingGRE: '',
  });
  const [ieltsDetails, setIeltsDetails] = useState({
    ieltsPlan: '',
    ieltsDate: '',
    ieltsScore: { reading: '', writing: '', speaking: '', listening: '' },
    retakingIELTS: '',
  });
  const [toeflDetails, setToeflDetails] = useState({
    toeflPlan: '',
    toeflDate: '',
    toeflScore: { reading: '', writing: '', speaking: '', listening: '' },
    retakingTOEFL: '',
  });
  const [visaDetails, setVisaDetails] = useState({
    countriesPlanningToApply: [],
    visaInterviewDate: '',
    visaInterviewLocation: '',
  });

  // ---------- Fetch Profile ----------
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      const data = response.data;
      setUserData(data);

      // Common
      setNameData(data.name || '');
      setPersonalDetails({
        dob: data.personalDetails?.dob ? new Date(data.personalDetails.dob).toISOString().split('T')[0] : '',
        gender: data.personalDetails?.gender || '',
        address: data.personalDetails?.address || '',
        profession: data.personalDetails?.profession || '',
      });
      setContactDetails({ phoneNumber: data.phoneNumber || '' });
      setProgramDetails({
        program: data.programDetails?.program || '',
        validity: data.programDetails?.validity ? new Date(data.programDetails.validity).toISOString().split('T')[0] : '',
      });

      // BACHELOR
      if (data.degree === 'BACHELOR') {
        setSchoolDetails({
          schoolName: data.schoolDetails?.schoolName || '',
          board: data.schoolDetails?.board || '',
          yearOfPassing: data.schoolDetails?.yearOfPassing ?? '',
          percentage: data.schoolDetails?.percentage ?? '',
        });

        setSatDetails({
          readingWriting: data.satDetails?.satScore?.readingWriting?.toString() ?? '',
          math: data.satDetails?.satScore?.math?.toString() ?? '',
          total: data.satDetails?.satScore?.total?.toString() ?? '',
          satPlan: data.satDetails?.satPlan ? new Date(data.satDetails.satPlan).toISOString().split('T')[0] : '',
          satDate: data.satDetails?.satDate ? new Date(data.satDetails.satDate).toISOString().split('T')[0] : '',
          satScoreCard: data.satDetails?.satScoreCard || '',
        });

        setActDetails({
          english: data.actDetails?.actScore?.english?.toString() ?? '',
          math: data.actDetails?.actScore?.math?.toString() ?? '',
          total: data.actDetails?.actScore?.total?.toString() ?? '',
          actPlan: data.actDetails?.actPlan ? new Date(data.actDetails.actPlan).toISOString().split('T')[0] : '',
          actDate: data.actDetails?.actDate ? new Date(data.actDetails.actDate).toISOString().split('T')[0] : '',
          actScoreCard: data.actDetails?.actScoreCard || '',
        });
      }

      // MASTER
      if (data.degree === 'MASTER') {
        setCollegeDetails({
          branch: data.collegeDetails?.branch || '',
          highestDegree: data.collegeDetails?.highestDegree || '',
          university: data.collegeDetails?.university || '',
          college: data.collegeDetails?.college || '',
          gpa: data.collegeDetails?.gpa ?? '',
          toppersGPA: data.collegeDetails?.toppersGPA ?? '',
          noOfBacklogs: data.collegeDetails?.noOfBacklogs ?? '',
          admissionTerm: data.collegeDetails?.admissionTerm || '',
          coursesApplying: data.collegeDetails?.coursesApplying || [],
        });

        setGmatDetails({
          total: data.gmatDetails?.gmatScore?.total?.toString() ?? '',
          quant: data.gmatDetails?.gmatScore?.quant?.toString() ?? '',
          gmatPlan: data.gmatDetails?.gmatPlan ? new Date(data.gmatDetails.gmatPlan).toISOString().split('T')[0] : '',
          gmatDate: data.gmatDetails?.gmatDate ? new Date(data.gmatDetails.gmatDate).toISOString().split('T')[0] : '',
          gmatScoreCard: data.gmatDetails?.gmatScoreCard || '',
        });
      }

      // Duolingo
      setDuolingoDetails({
        reading: data.duolingoDetails?.duolingoScore?.reading?.toString() ?? '',
        writing: data.duolingoDetails?.duolingoScore?.writing?.toString() ?? '',
        listening: data.duolingoDetails?.duolingoScore?.listening?.toString() ?? '',
        speaking: data.duolingoDetails?.duolingoScore?.speaking?.toString() ?? '',
        duolingoPlan: data.duolingoDetails?.duolingoPlan ? new Date(data.duolingoDetails.duolingoPlan).toISOString().split('T')[0] : '',
        duolingoDate: data.duolingoDetails?.duolingoDate ? new Date(data.duolingoDetails.duolingoDate).toISOString().split('T')[0] : '',
        retakingDuolingo: data.duolingoDetails?.retakingDuolingo || '',
      });

      // GRE
      setGreDetails({
        grePlan: data.greDetails?.grePlan ? new Date(data.greDetails.grePlan).toISOString().split('T')[0] : '',
        greDate: data.greDetails?.greDate ? new Date(data.greDetails.greDate).toISOString().split('T')[0] : '',
        greScoreCard: data.greDetails?.greScoreCard || '',
        greScore: {
          verbal: data.greDetails?.greScore?.verbal ?? '',
          quant: data.greDetails?.greScore?.quant ?? '',
          awa: data.greDetails?.greScore?.awa ?? '',
        },
        retakingGRE: data.greDetails?.retakingGRE || '',
      });

      // IELTS
      setIeltsDetails({
        ieltsPlan: data.ieltsDetails?.ieltsPlan ? new Date(data.ieltsDetails.ieltsPlan).toISOString().split('T')[0] : '',
        ieltsDate: data.ieltsDetails?.ieltsDate ? new Date(data.ieltsDetails.ieltsDate).toISOString().split('T')[0] : '',
        ieltsScore: {
          reading: data.ieltsDetails?.ieltsScore?.reading ?? '',
          writing: data.ieltsDetails?.ieltsScore?.writing ?? '',
          speaking: data.ieltsDetails?.ieltsScore?.speaking ?? '',
          listening: data.ieltsDetails?.ieltsScore?.listening ?? '',
        },
        retakingIELTS: data.ieltsDetails?.retakingIELTS || '',
      });

      // TOEFL
      setToeflDetails({
        toeflPlan: data.toeflDetails?.toeflPlan ? new Date(data.toeflDetails.toeflPlan).toISOString().split('T')[0] : '',
        toeflDate: data.toeflDetails?.toeflDate ? new Date(data.toeflDetails.toeflDate).toISOString().split('T')[0] : '',
        toeflScore: {
          reading: data.toeflDetails?.toeflScore?.reading ?? '',
          writing: data.toeflDetails?.toeflScore?.writing ?? '',
          speaking: data.toeflDetails?.toeflScore?.speaking ?? '',
          listening: data.toeflDetails?.toeflScore?.listening ?? '',
        },
        retakingTOEFL: data.toeflDetails?.retakingTOEFL || '',
      });

      // VISA
      setVisaDetails({
        countriesPlanningToApply: data.visa?.countriesPlanningToApply || [],
        visaInterviewDate: data.visa?.visaInterviewDate ? new Date(data.visa.visaInterviewDate).toISOString().split('T')[0] : '',
        visaInterviewLocation: data.visa?.visaInterviewLocation || '',
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ---------- Handlers ----------
  const handleNameChange = (field, value) => setNameData(value);
  const handlePersonalDetailsChange = (field, value) =>
    setPersonalDetails((p) => ({ ...p, [field]: value }));
  const handleContactDetailsChange = (field, value) =>
    setContactDetails((p) => ({ ...p, [field]: value }));
  const handleProgramDetailsChange = (field, value) =>
    setProgramDetails((p) => ({ ...p, [field]: value }));
  const handleCollegeDetailsChange = (field, value) => {
    if (field === 'coursesApplying') {
      const arr = typeof value === 'string' ? value.split(',').map((c) => c.trim()) : value;
      setCollegeDetails((p) => ({ ...p, [field]: arr }));
    } else {
      setCollegeDetails((p) => ({ ...p, [field]: value }));
    }
  };
  const handleSchoolDetailsChange = (field, value) =>
    setSchoolDetails((p) => ({ ...p, [field]: value }));

  const handleSatChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSatDetails((p) => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    } else {
      setSatDetails((p) => ({ ...p, [field]: value }));
    }
  };

  const handleActChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setActDetails((p) => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    } else {
      setActDetails((p) => ({ ...p, [field]: value }));
    }
  };

  const handleGmatChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setGmatDetails((p) => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    } else {
      setGmatDetails((p) => ({ ...p, [field]: value }));
    }
  };

  const handleDuolingoChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setDuolingoDetails((p) => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    } else {
      setDuolingoDetails((p) => ({ ...p, [field]: value }));
    }
  };

  const handleGreDetailsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setGreDetails((p) => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    } else {
      setGreDetails((p) => ({ ...p, [field]: value }));
    }
  };

  const handleIeltsDetailsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setIeltsDetails((p) => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    } else {
      setIeltsDetails((p) => ({ ...p, [field]: value }));
    }
  };

  const handleToeflDetailsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setToeflDetails((p) => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    } else {
      setToeflDetails((p) => ({ ...p, [field]: value }));
    }
  };

  const handleVisaDetailsChange = (field, value) => {
    if (field === 'countriesPlanningToApply') {
      const arr = typeof value === 'string' ? value.split(',').map((c) => c.trim()) : value.map((i) => i.value);
      setVisaDetails((p) => ({ ...p, [field]: arr }));
    } else {
      setVisaDetails((p) => ({ ...p, [field]: value }));
    }
  };

  const handleCloseEditMode = () => setEditMode(false);
  const handleSuccess = async () => {
    await fetchUserProfile();
    setEditMode(false);
    toast.success('Profile updated successfully!');
  };

  // ---------- Loading / Error ----------
  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar isSidebarOpen={isOpen} />
          <SidebarInset>
            <SidebarHeader isSidebarOpen={isOpen} setIsOpen={setIsOpen} />
            <div className="p-5 flex justify-center items-center min-h-[80vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-1 mx-auto"></div>
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

  // ---------- Edit Mode ----------
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
              <ProfileEditForm
                userData={userData}
                onClose={handleCloseEditMode}
                onSuccess={handleSuccess}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const isBachelor = userData?.degree === 'BACHELOR';
  const isMaster = userData?.degree === 'MASTER';

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
              <Button onClick={() => setEditMode(true)} className="bg-primary-1 hover:bg-primary-1/90">
                <PencilIcon className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 bg-gray-50">
              {/* Profile Picture + Program + Contact */}
              <div className="sm:col-span-2 lg:col-span-4">
                <div className="bg-white rounded-lg shadow-sm p-5 h-full min-h-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-5">
                        <div className="relative w-full aspect-square max-w-[300px] mx-auto">
                          <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-md">
                            {userData?.profilePicture ? (
                              <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <p className="text-gray-500 text-sm text-center px-4">No profile image</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-7">
                        <div className="mb-5">
                          <ProfileDetailsCard title="Program Details" canEdit={false} className="border-0 shadow-none">
                            <DataField icon={<BriefcaseBusiness className="w-5 h-5" fill="#145044" />} label="Program" value={programDetails.program} />
                            <DataField icon={<ClockIcon className="w-5 h-5" />} label="Validity" value={programDetails.validity} fieldType="date" />
                          </ProfileDetailsCard>
                        </div>
                        <ProfileDetailsCard title="Contact Details" canEdit={false} className="border-0 shadow-none">
                          <DataField icon={<PhoneIcon className="w-5 h-5" />} label="Phone" value={contactDetails.phoneNumber || 'Not set'} />
                          <DataField icon={<MailIcon className="w-5 h-5" />} label="E-mail" value={userData?.email || 'Not set'} />
                        </ProfileDetailsCard>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="sm:col-span-1 lg:col-span-3">
                <ProfileDetailsCard title="Personal Details" canEdit={false} className="h-full min-h-[280px]">
                  <div className="space-y-5">
                    <DataField icon={<UserIcon className="w-5 h-5" />} label="Name" value={nameData} />
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Date of Birth" value={personalDetails.dob} fieldType="date" />
                    <DataField icon={<BaggageClaimIcon className="w-5 h-5" />} label="Gender" value={personalDetails.gender} />
                    <DataField icon={<LocateFixedIcon className="w-5 h-5" />} label="Address" value={personalDetails.address} />
                    <DataField icon={<WorkflowIcon className="w-5 h-5" />} label="Profession" value={personalDetails.profession} />
                  </div>
                </ProfileDetailsCard>
              </div>

              {/* School (BACHELOR) */}
              {isBachelor && (
                <div className="sm:col-span-1 lg:col-span-5">
                  <ProfileDetailsCard title="School Details" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <DataField icon={<BuildingIcon className="w-5 h-5" />} label="School Name" value={schoolDetails.schoolName} />
                      <DataField icon={<GraduationCapIcon className="w-5 h-5" />} label="Board" value={schoolDetails.board} />
                      <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Year of Passing" value={schoolDetails.yearOfPassing} />
                      <DataField icon={<ListBulletIcon className="w-5 h-5" />} label="Percentage" value={schoolDetails.percentage} />
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* College (MASTER) */}
              {isMaster && (
                <div className="sm:col-span-1 lg:col-span-5">
                  <ProfileDetailsCard title="College Details" canEdit={false} className="h-full min-h-[280px]">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-5">
                        <DataField icon={<GraduationCapIcon className="w-5 h-5" />} label="Branch" value={collegeDetails.branch} />
                        <DataField icon={<UniversityIcon className="w-5 h-5" />} label="University" value={collegeDetails.university} />
                        <DataField icon={<ListBulletIcon className="w-5 h-5" />} label="GPA" value={collegeDetails.gpa} />
                        <DataField icon={<ListBulletIcon className="w-5 h-5" />} label="Toppers GPA" value={collegeDetails.toppersGPA} />
                        <DataField icon={<ListBulletIcon className="w-5 h-5" />} label="Backlogs" value={collegeDetails.noOfBacklogs} />
                      </div>
                      <div className="space-y-5">
                        <DataField icon={<GraduationCapIcon className="w-5 h-5" />} label="Highest Degree" value={collegeDetails.highestDegree} />
                        <DataField icon={<BuildingIcon className="w-5 h-5" />} label="College" value={collegeDetails.college} />
                        <DataField icon={<CalendarRangeIcon className="w-5 h-5" />} label="Admission Term" value={collegeDetails.admissionTerm} />
                        <DataField icon={<FileIcon className="w-5 h-5" />} label="Courses Applying" value={collegeDetails.coursesApplying.join(', ')} />
                      </div>
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* SAT */}
              {isBachelor && (
                <div className="sm:col-span-1 lg:col-span-4">
                  <ProfileDetailsCard title="SAT" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Reading + Writing</div>
                          <input type="number" value={satDetails.readingWriting} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Math</div>
                          <input type="number" value={satDetails.math} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                      <div className="text-center pt-3 border-t">
                        <div className="text-2xl font-bold text-primary-1">{satDetails.total}</div>
                        <p className="text-xs text-gray-600">Total / 1600</p>
                      </div>
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* ACT */}
              {isBachelor && (
                <div className="sm:col-span-1 lg:col-span-4">
                  <ProfileDetailsCard title="ACT" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>English</div>
                          <input type="number" value={actDetails.english} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Math</div>
                          <input type="number" value={actDetails.math} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                      <div className="text-center pt-3 border-t">
                        <div className="text-2xl font-bold text-primary-1">{actDetails.total}</div>
                        <p className="text-xs text-gray-600">Composite / 36</p>
                      </div>
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* GMAT */}
              {isMaster && (
                <div className="sm:col-span-1 lg:col-span-4">
                  <ProfileDetailsCard title="GMAT" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Total Score</div>
                          <input type="number" value={gmatDetails.total} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Quantitative</div>
                          <input type="number" value={gmatDetails.quant} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* Duolingo */}
              {(isBachelor || isMaster) && (
                <div className="sm:col-span-1 lg:col-span-4">
                  <ProfileDetailsCard title="Duolingo" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Plan" value={duolingoDetails.duolingoPlan} fieldType="date" />
                      <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Date" value={duolingoDetails.duolingoDate} fieldType="date" />
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Duolingo Score</div>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>
                              <div className="text-gray-500">R</div>
                              <input type="number" value={duolingoDetails.reading} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                            <div>
                              <div className="text-gray-500">W</div>
                              <input type="number" value={duolingoDetails.writing} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                            <div>
                              <div className="text-gray-500">L</div>
                              <input type="number" value={duolingoDetails.listening} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                            <div>
                              <div className="text-gray-500">S</div>
                              <input type="number" value={duolingoDetails.speaking} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DataField icon={<CalendarRangeIcon className="w-5 h-5" />} label="Retaking" value={duolingoDetails.retakingDuolingo} />
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* GRE */}
              {isMaster && (
                <div className="sm:col-span-1 lg:col-span-4">
                  <ProfileDetailsCard title="GRE" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Plan" value={greDetails.grePlan} fieldType="date" />
                      <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Date" value={greDetails.greDate} fieldType="date" />
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>GRE Score</div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <div className="text-gray-500">Verbal</div>
                              <input type="number" value={greDetails.greScore.verbal} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                            <div>
                              <div className="text-gray-500">Quant</div>
                              <input type="number" value={greDetails.greScore.quant} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                            <div>
                              <div className="text-gray-500">AWA</div>
                              <input type="number" value={greDetails.greScore.awa} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DataField icon={<FileIcon className="w-5 h-5" />} label="Scorecard" value={greDetails.greScoreCard} />
                      <DataField icon={<CalendarRangeIcon className="w-5 h-5" />} label="Retaking" value={greDetails.retakingGRE} />
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* IELTS */}
              <div className="sm:col-span-1 lg:col-span-4">
                <ProfileDetailsCard title="IELTS" canEdit={false} className="h-full min-h-[280px]">
                  <div className="space-y-5">
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Plan" value={ieltsDetails.ieltsPlan} fieldType="date" />
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Date" value={ieltsDetails.ieltsDate} fieldType="date" />
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                        <ListBulletIcon className="w-5 h-5 stroke-white" />
                      </div>
                      <div>
                        <div>IELTS Score</div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <div className="text-gray-500">R</div>
                            <input type="number" step="0.5" value={ieltsDetails.ieltsScore.reading} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">W</div>
                            <input type="number" step="0.5" value={ieltsDetails.ieltsScore.writing} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">S</div>
                            <input type="number" step="0.5" value={ieltsDetails.ieltsScore.speaking} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">L</div>
                            <input type="number" step="0.5" value={ieltsDetails.ieltsScore.listening} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <DataField icon={<CalendarRangeIcon className="w-5 h-5" />} label="Retaking" value={ieltsDetails.retakingIELTS} />
                  </div>
                </ProfileDetailsCard>
              </div>

              {/* TOEFL */}
              <div className="sm:col-span-1 lg:col-span-4">
                <ProfileDetailsCard title="TOEFL" canEdit={false} className="h-full min-h-[280px]">
                  <div className="space-y-5">
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Plan" value={toeflDetails.toeflPlan} fieldType="date" />
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Date" value={toeflDetails.toeflDate} fieldType="date" />
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                        <ListBulletIcon className="w-5 h-5 stroke-white" />
                      </div>
                      <div>
                        <div>TOEFL Score</div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <div className="text-gray-500">R</div>
                            <input type="number" value={toeflDetails.toeflScore.reading} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">W</div>
                            <input type="number" value={toeflDetails.toeflScore.writing} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">S</div>
                            <input type="number" value={toeflDetails.toeflScore.speaking} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">L</div>
                            <input type="number" value={toeflDetails.toeflScore.listening} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <DataField icon={<CalendarRangeIcon className="w-5 h-5" />} label="Retaking" value={toeflDetails.retakingTOEFL} />
                  </div>
                </ProfileDetailsCard>
              </div>

              {/* VISA */}
              <div className="sm:col-span-1 lg:col-span-4">
                <ProfileDetailsCard title="VISA" canEdit={false} className="h-full min-h-[280px]">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-1 text-white p-1.5 rounded-md flex-shrink-0">
                        <FlagIcon className="w-5 h-5 stroke-white" />
                      </div>
                      <div className="flex-grow">
                        <div>Countries</div>
                        <Select isMulti value={visaDetails.countriesPlanningToApply.map(c => ({ value: c, label: c }))} isDisabled>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </Select>
                      </div>
                    </div>
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Interview Date" value={visaDetails.visaInterviewDate} fieldType="date" />
                    <DataField icon={<MapPinIcon className="w-5 h-5" />} label="Location" value={visaDetails.visaInterviewLocation} />
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