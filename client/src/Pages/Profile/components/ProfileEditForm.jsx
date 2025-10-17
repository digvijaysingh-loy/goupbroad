import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { updateUserProfile, uploadFile } from '@/services/api.services';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

const validatePhoneNumber = (number) => {

  const phoneRegex = /^\+\d{2,3}\d{10}$/;
  return phoneRegex.test(number);
};

const formatPhoneNumber = (number) => {
  if (!number) return '';


  const cleaned = number.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add +91
  if (!cleaned.startsWith('+')) {
    return '+91' + cleaned;
  }
  
  // Keep the + and the numbers
  return cleaned;
};

const ProfileEditForm = ({ userData, onClose, onSuccess }) => {

  const createSafeDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phoneNumber: userData?.phoneNumber || '',
    profilePicture: userData?.profilePicture || '',
    personalDetails: {
      dob: createSafeDate(userData?.personalDetails?.dob),
      gender: userData?.personalDetails?.gender || '',
      address: userData?.personalDetails?.address || '',
      profession: userData?.personalDetails?.profession || ''
    },
    programDetails: {
      program: userData?.programDetails?.program || '',
      validity: createSafeDate(userData?.programDetails?.validity),
    },
    collegeDetails: {
      branch: userData?.collegeDetails?.branch || '',
      highestDegree: userData?.collegeDetails?.highestDegree || '',
      university: userData?.collegeDetails?.university || '',
      college: userData?.collegeDetails?.college || '',
      gpa: userData?.collegeDetails?.gpa || '',
      toppersGPA: userData?.collegeDetails?.toppersGPA || '',
      noOfBacklogs: userData?.collegeDetails?.noOfBacklogs || '',
      admissionTerm: userData?.collegeDetails?.admissionTerm || '',
      coursesApplying: userData?.collegeDetails?.coursesApplying?.join(', ') || ''
    },    greDetails: {
      grePlane: createSafeDate(userData?.greDetails?.grePlane),
      greDate: createSafeDate(userData?.greDetails?.greDate),
      greScore: {
        verbal: userData?.greDetails?.greScore?.verbal || '',
        quant: userData?.greDetails?.greScore?.quant || '',
        awa: userData?.greDetails?.greScore?.awa || '',
      },
      retakingGRE: userData?.greDetails?.retakingGRE || ''
    },
    ieltsDetails: {
      ieltsPlan: createSafeDate(userData?.ieltsDetails?.ieltsPlan),
      ieltsDate: createSafeDate(userData?.ieltsDetails?.ieltsDate),
      ieltsScore: {
        reading: userData?.ieltsDetails?.ieltsScore?.reading || '',
        writing: userData?.ieltsDetails?.ieltsScore?.writing || '',
        speaking: userData?.ieltsDetails?.ieltsScore?.speaking || '',
        listening: userData?.ieltsDetails?.ieltsScore?.listening || '',
      },
      retakingIELTS: userData?.ieltsDetails?.retakingIELTS || ''
    },    toeflDetails: {
      toeflPlan: createSafeDate(userData?.toeflDetails?.toeflPlan),
      toeflDate: createSafeDate(userData?.toeflDetails?.toeflDate),
      toeflScore: {
        reading: userData?.toeflDetails?.toeflScore?.reading || '',
        writing: userData?.toeflDetails?.toeflScore?.writing || '',
        speaking: userData?.toeflDetails?.toeflScore?.speaking || ''
      },
      retakingTOEFL: userData?.toeflDetails?.retakingTOEFL || ''
    },
    visa: {
      countriesPlanningToApply: userData?.visa?.countriesPlanningToApply?.join(', ') || '',
      visaInterviewDate: createSafeDate(userData?.visa?.visaInterviewDate),
      visaInterviewLocation: userData?.visa?.visaInterviewLocation || ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleInputChange = (section, field, value) => {
    if (section) {
      if (field.includes('.')) {
        // Handle nested score objects (e.g., greScore.verbal)
        const [subSection, subField] = field.split('.');
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [subSection]: {
              ...prev[section][subSection],
              [subField]: value
            }
          }
        }));
      } else {
        // Handle regular section fields
        setFormData(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        }));
      }
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'profile');      
      const response = await uploadFile(formData);        
      if (response.success && response.data && response.data.url) {
        setFormData(prev => ({
          ...prev,
          profilePicture: response.data.url
        }));
        toast.success('Profile image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };
  const handlePhoneNumberChange = (e) => {
    const input = e.target.value;
    
    // Format the phone number
    const formattedNumber = formatPhoneNumber(input);
    
    // Only update if the number is valid or empty
    if (!formattedNumber || formattedNumber === '+' || validatePhoneNumber(formattedNumber) || formattedNumber.length <= 13) {
      handleInputChange(null, 'phoneNumber', formattedNumber);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number before submission
    if (!validatePhoneNumber(formData.phoneNumber)) {
      toast.error('Phone number must start with country code (e.g., +918388656625)');
      return;
    }

    try {
      setLoading(true);
      
      const safeNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      };
      
      const stringToArray = (str) => {
        return str && typeof str === 'string' 
          ? str.split(',').map(item => item.trim()).filter(Boolean)
          : Array.isArray(str) ? str : [];
      };
      
      const fallbackValue = (value, fallback = 'N/A') => {
        return value || fallback;
      };

      const dateToISOString = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) ? date.toISOString() : null;
      };

      const processedFormData = {        name: fallbackValue(formData.name),
        email: userData?.email,
        phoneNumber: fallbackValue(formData.phoneNumber),
        profilePicture: formData.profilePicture,
        personalDetails: {
          dob: dateToISOString(formData.personalDetails.dob),
          gender: fallbackValue(formData.personalDetails.gender),
          address: fallbackValue(formData.personalDetails.address),
          profession: fallbackValue(formData.personalDetails.profession)
        },
        programDetails: {
          program: fallbackValue(formData.programDetails.program),
          validity: dateToISOString(formData.programDetails.validity)
        },
        collegeDetails: {
          branch: fallbackValue(formData.collegeDetails.branch),
          highestDegree: fallbackValue(formData.collegeDetails.highestDegree),
          university: fallbackValue(formData.collegeDetails.university),
          college: fallbackValue(formData.collegeDetails.college),
          gpa: safeNumber(formData.collegeDetails.gpa),
          toppersGPA: safeNumber(formData.collegeDetails.toppersGPA),
          noOfBacklogs: safeNumber(formData.collegeDetails.noOfBacklogs),
          admissionTerm: fallbackValue(formData.collegeDetails.admissionTerm),
          coursesApplying: stringToArray(formData.collegeDetails.coursesApplying)
        },        greDetails: {
          grePlane: dateToISOString(formData.greDetails.grePlane),
          greDate: dateToISOString(formData.greDetails.greDate),
          greScore: {
            verbal: safeNumber(formData.greDetails.greScore.verbal),
            quant: safeNumber(formData.greDetails.greScore.quant),
            awa: safeNumber(formData.greDetails.greScore.awa)
          },
          retakingGRE: fallbackValue(formData.greDetails.retakingGRE, 'No')
        },
        ieltsDetails: {
          ieltsPlan: dateToISOString(formData.ieltsDetails.ieltsPlan),
          ieltsDate: dateToISOString(formData.ieltsDetails.ieltsDate),
          ieltsScore: {
            reading: safeNumber(formData.ieltsDetails.ieltsScore.reading),
            writing: safeNumber(formData.ieltsDetails.ieltsScore.writing),
            speaking: safeNumber(formData.ieltsDetails.ieltsScore.speaking),
            listening: safeNumber(formData.ieltsDetails.ieltsScore.listening)
          },
          retakingIELTS: fallbackValue(formData.ieltsDetails.retakingIELTS, 'No')
        },
        toeflDetails: {
          toeflPlan: dateToISOString(formData.toeflDetails.toeflPlan),
          toeflDate: dateToISOString(formData.toeflDetails.toeflDate),
          toeflScore: {
            reading: safeNumber(formData.toeflDetails.toeflScore.reading),
            writing: safeNumber(formData.toeflDetails.toeflScore.writing),
            speaking: safeNumber(formData.toeflDetails.toeflScore.speaking)
          },
          retakingTOEFL: fallbackValue(formData.toeflDetails.retakingTOEFL, 'No')
        },        visa: {
          countriesPlanningToApply: stringToArray(formData.visa.countriesPlanningToApply),
          visaInterviewDate: dateToISOString(formData.visa.visaInterviewDate),
          visaInterviewLocation: fallbackValue(formData.visa.visaInterviewLocation)
        }
      };      
      const response = await updateUserProfile(processedFormData);        
      if (response.success) {
        toast.success('The operation has been successful');

        if (onSuccess) {
          await onSuccess();
        }
        if (onClose) {
          onClose();
        }

        window.location.reload();
      } else {

        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-8 pr-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">              
              <img
                src={formData.profilePicture || ''}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>            
            <div>
              <Button
                variant="outline"
                type="button"
                disabled={imageUploading}
                className="gap-2 cursor-pointer"
                onClick={() => document.getElementById('profileImageInput').click()}
              >
                {imageUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Change Photo
                  </>
                )}
              </Button>
              <input
                id="profileImageInput"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                disabled={imageUploading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange(null, 'name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={userData?.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="space-y-1">
                <Input 
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="+91XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">Must include country code (e.g., +918388656625)</p>
              </div>
            </div>            
            <div className="space-y-2">              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                type="date"
                id="dob"
                value={formData.personalDetails.dob}
                onChange={(e) => handleInputChange('personalDetails', 'dob', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.personalDetails.gender} 
                onValueChange={(value) => handleInputChange('personalDetails', 'gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input 
                id="profession"
                value={formData.personalDetails.profession}
                onChange={(e) => handleInputChange('personalDetails', 'profession', e.target.value)}
              />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address"
                value={formData.personalDetails.address}
                onChange={(e) => handleInputChange('personalDetails', 'address', e.target.value)}
                rows={3}
              />
            </div>      </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Input 
                id="program"
                value={formData.programDetails.program}
                onChange={(e) => handleInputChange('programDetails', 'program', e.target.value)}
              />
            </div>
            <div className="space-y-2">              <Label htmlFor="validity">Validity</Label>
              <Input
                type="date"
                id="validity"
                value={formData.programDetails.validity}
                onChange={(e) => handleInputChange('programDetails', 'validity', e.target.value)}
              />
            </div>      
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>College Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input 
                id="branch"
                value={formData.collegeDetails.branch}
                onChange={(e) => handleInputChange('collegeDetails', 'branch', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="highestDegree">Highest Degree</Label>
              <Input 
                id="highestDegree"
                value={formData.collegeDetails.highestDegree}
                onChange={(e) => handleInputChange('collegeDetails', 'highestDegree', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input 
                id="university"
                value={formData.collegeDetails.university}
                onChange={(e) => handleInputChange('collegeDetails', 'university', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input 
                id="college"
                value={formData.collegeDetails.college}
                onChange={(e) => handleInputChange('collegeDetails', 'college', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpa">GPA</Label>
              <Input 
                id="gpa"
                type="number"
                step="0.01"
                value={formData.collegeDetails.gpa}
                onChange={(e) => handleInputChange('collegeDetails', 'gpa', e.target.value)}
              />
            </div>            <div className="space-y-2">
              <Label htmlFor="toppersGPA">Topper&apos;s GPA</Label>
              <Input 
                id="toppersGPA"
                type="number"
                step="0.01"
                value={formData.collegeDetails.toppersGPA}
                onChange={(e) => handleInputChange('collegeDetails', 'toppersGPA', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noOfBacklogs">Number of Backlogs</Label>
              <Input 
                id="noOfBacklogs"
                type="number"
                value={formData.collegeDetails.noOfBacklogs}
                onChange={(e) => handleInputChange('collegeDetails', 'noOfBacklogs', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admissionTerm">Admission Term</Label>
              <Input 
                id="admissionTerm"
                value={formData.collegeDetails.admissionTerm}
                onChange={(e) => handleInputChange('collegeDetails', 'admissionTerm', e.target.value)}
              />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="coursesApplying">Courses Applying (comma separated)</Label>
              <Textarea 
                id="coursesApplying"
                value={formData.collegeDetails.coursesApplying}
                onChange={(e) => handleInputChange('collegeDetails', 'coursesApplying', e.target.value)}
                rows={2}
              />
            </div>      </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GRE Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">              <Label htmlFor="grePlane">GRE Plan Date</Label>
              <Input
                type="date"
                id="grePlane"
                value={formData.greDetails.grePlane}
                onChange={(e) => handleInputChange('greDetails', 'grePlane', e.target.value)}
              />
            </div>
            <div className="space-y-2">              <Label htmlFor="greDate">GRE Exam Date</Label>
              <Input
                type="date"
                id="greDate"
                value={formData.greDetails.greDate}
                onChange={(e) => handleInputChange('greDetails', 'greDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verbal">Verbal Score</Label>
              <Input 
                id="verbal"
                type="number"
                value={formData.greDetails.greScore.verbal}
                onChange={(e) => handleInputChange('greDetails', 'greScore.verbal', e.target.value)}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quant">Quantitative Score</Label>
              <Input 
                id="quant"
                type="number"
                value={formData.greDetails.greScore.quant}
                onChange={(e) => handleInputChange('greDetails', 'greScore.quant', e.target.value)}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="awa">AWA Score</Label>
              <Input 
                id="awa"
                type="number"
                step="0.5"
                value={formData.greDetails.greScore.awa}
                onChange={(e) => handleInputChange('greDetails', 'greScore.awa', e.target.value)}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retakingGRE">Retaking GRE</Label>
              <Select 
                value={formData.greDetails.retakingGRE} 
                onValueChange={(value) => handleInputChange('greDetails', 'retakingGRE', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>      
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IELTS Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">                <Label htmlFor="ieltsPlan">IELTS Plan Date</Label>
              <Input
                type="date"
                id="ieltsPlan"
                value={formData.ieltsDetails.ieltsPlan}
                onChange={(e) => handleInputChange('ieltsDetails', 'ieltsPlan', e.target.value)}
              />
            </div>
            <div className="space-y-2">                <Label htmlFor="ieltsDate">IELTS Exam Date</Label>
              <Input
                type="date"
                id="ieltsDate"
                value={formData.ieltsDetails.ieltsDate}
                onChange={(e) => handleInputChange('ieltsDetails', 'ieltsDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ieltsReading">Reading Score</Label>
              <Input 
                id="ieltsReading"
                type="number"
                step="0.5"
                value={formData.ieltsDetails.ieltsScore.reading}
                onChange={(e) => handleInputChange('ieltsDetails', 'ieltsScore.reading', e.target.value)}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ieltsWriting">Writing Score</Label>
              <Input 
                id="ieltsWriting"
                type="number"
                step="0.5"
                value={formData.ieltsDetails.ieltsScore.writing}
                onChange={(e) => handleInputChange('ieltsDetails', 'ieltsScore.writing', e.target.value)}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ieltsSpeaking">Speaking Score</Label>
              <Input 
                id="ieltsSpeaking"
                type="number"
                step="0.5"
                value={formData.ieltsDetails.ieltsScore.speaking}
                onChange={(e) => handleInputChange('ieltsDetails', 'ieltsScore.speaking', e.target.value)}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ieltsListening">Listening Score</Label>
              <Input 
                id="ieltsListening"
                type="number"
                step="0.5"
                value={formData.ieltsDetails.ieltsScore.listening}
                onChange={(e) => handleInputChange('ieltsDetails', 'ieltsScore.listening', e.target.value)}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retakingIELTS">Retaking IELTS</Label>
              <Select 
                value={formData.ieltsDetails.retakingIELTS} 
                onValueChange={(value) => handleInputChange('ieltsDetails', 'retakingIELTS', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>      </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>TOEFL Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">                <Label htmlFor="toeflPlan">TOEFL Plan Date</Label>
              <Input
                type="date"
                id="toeflPlan"
                value={formData.toeflDetails.toeflPlan}
                onChange={(e) => handleInputChange('toeflDetails', 'toeflPlan', e.target.value)}
              />
            </div>
            <div className="space-y-2">                <Label htmlFor="toeflDate">TOEFL Exam Date</Label>
              <Input
                type="date"
                id="toeflDate"
                value={formData.toeflDetails.toeflDate}
                onChange={(e) => handleInputChange('toeflDetails', 'toeflDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toeflReading">Reading Score</Label>
              <Input 
                id="toeflReading"
                type="number"
                value={formData.toeflDetails.toeflScore.reading}
                onChange={(e) => handleInputChange('toeflDetails', 'toeflScore.reading', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toeflWriting">Writing Score</Label>
              <Input 
                id="toeflWriting"
                type="number"
                value={formData.toeflDetails.toeflScore.writing}
                onChange={(e) => handleInputChange('toeflDetails', 'toeflScore.writing', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toeflSpeaking">Speaking Score</Label>
              <Input 
                id="toeflSpeaking"
                type="number"
                value={formData.toeflDetails.toeflScore.speaking}
                onChange={(e) => handleInputChange('toeflDetails', 'toeflScore.speaking', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retakingTOEFL">Retaking TOEFL</Label>
              <Select 
                value={formData.toeflDetails.retakingTOEFL} 
                onValueChange={(value) => handleInputChange('toeflDetails', 'retakingTOEFL', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>      </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visa Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="countriesPlanningToApply">Countries Planning to Apply (comma separated)</Label>
              <Textarea 
                id="countriesPlanningToApply"
                value={formData.visa.countriesPlanningToApply}
                onChange={(e) => handleInputChange('visa', 'countriesPlanningToApply', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">              <Label htmlFor="visaInterviewDate">Visa Interview Date</Label>
              <Input
                type="date"
                id="visaInterviewDate"
                value={formData.visa.visaInterviewDate}
                onChange={(e) => handleInputChange('visa', 'visaInterviewDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visaInterviewLocation">Visa Interview Location</Label>
              <Input 
                id="visaInterviewLocation"
                value={formData.visa.visaInterviewLocation}
                onChange={(e) => handleInputChange('visa', 'visaInterviewLocation', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-primary-1 cursor-pointer">
          {loading && <span className="mr-2 h-4 w-4 animate-spin">⏳</span>}
          Save Changes
        </Button>
      </div>
    </form>
  );
};

ProfileEditForm.propTypes = {
  userData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default ProfileEditForm;
