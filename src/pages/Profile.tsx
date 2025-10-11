
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/integrations/firebase/firestore';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileStats from '@/components/profile/ProfileStats';

const ProfilePage = () => {
  const { userData, updateUserData, user, profile, session } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    location: '',
    fitnessGoal: '',
    activityLevel: '',
    dietaryPreference: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Dhanbad', 'Jodhpur', 'Amritsar', 'Raipur', 'Allahabad',
    'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Madurai', 'Gurgaon', 'Navi Mumbai',
    'Aurangabad', 'Solapur', 'Ranchi', 'Jalandhar', 'Tiruchirappalli', 'Chandigarh'
  ];

  useEffect(() => {
    if (!session || !user) {
      navigate('/login');
      return;
    }
    
    if (profile) {
      const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : userData.age;
      setFormData({
        fullName: profile.full_name || '',
        email: profile.email || '',
        username: profile.username || '',
        age: age?.toString() || '',
        gender: profile.gender || '',
        weight: profile.weight_kg?.toString() || '',
        height: profile.height_cm?.toString() || '',
        location: profile.location || '',
        fitnessGoal: profile.fitness_goal || '',
        activityLevel: profile.fitness_level || '',
        dietaryPreference: profile.diet_preference || '',
      });
    }
  }, [session, user, profile, userData, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) throw new Error("You must be logged in to update your profile");

      const dobFromAge = formData.age ? new Date(new Date().getFullYear() - parseInt(formData.age), 0, 1).toISOString().split('T')[0] : null;

      const { error } = await updateProfile(user.uid, {
        full_name: formData.fullName,
        username: formData.username,
        gender: formData.gender,
        dob: dobFromAge,
        height_cm: formData.height ? parseInt(formData.height) : undefined,
        weight_kg: formData.weight ? parseInt(formData.weight) : undefined,
        location: formData.location,
        diet_preference: formData.dietaryPreference,
        fitness_level: formData.activityLevel,
        fitness_goal: formData.fitnessGoal,
      });

      if (error) throw error;

      updateUserData({
        name: formData.fullName,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender as any,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        location: formData.location,
        fitnessGoal: formData.fitnessGoal as any,
        activityLevel: formData.activityLevel as any,
        dietaryPreference: formData.dietaryPreference as any,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,.15)_1px,transparent_0)] bg-[size:20px_20px] opacity-20"></div>
      <div className="relative">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">Your Profile</h1>
            <p className="text-gray-600">Manage your personal information and fitness preferences</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
                <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Personal Information</CardTitle>
                <CardDescription>Update your personal details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <ProfileForm
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSelectChange={handleSelectChange}
                    locations={locations}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <ProfileStats />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
