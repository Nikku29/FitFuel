import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/integrations/firebase/firestore';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileStats from '@/components/profile/ProfileStats';
import { createWorker } from 'tesseract.js';
import { FileText, Heart, Activity, Upload, Bluetooth } from 'lucide-react';

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
    allergies: '',
    medicalConditions: '',
  });

  // New State for Connected Health
  const [medicalAnalysis, setMedicalAnalysis] = useState<string | null>(null);
  const [isAnalyzingMedical, setIsAnalyzingMedical] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [isConnectingDevice, setIsConnectingDevice] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // No longer needed restricted list
  const locations: string[] = [];

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
        allergies: profile.allergies || '',
        medicalConditions: profile.medical_conditions || '',
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

      // 1. Prepare data for Firestore (Snake Case matches DB)
      const firestoreData = {
        full_name: formData.fullName || null,
        username: formData.username || null,
        gender: formData.gender || null,
        dob: dobFromAge || null,
        height_cm: formData.height ? parseInt(formData.height) : null,
        weight_kg: formData.weight ? parseInt(formData.weight) : null,
        location: formData.location || null,
        diet_preference: formData.dietaryPreference || null,
        fitness_level: formData.activityLevel || null,
        fitness_goal: formData.fitnessGoal || null,
        allergies: formData.allergies || null,
        medical_conditions: formData.medicalConditions || null,
        body_type: formData.bodyType || null, // Ensure this is captured
      };

      // 2. Prepare data for Local Context (Camel Case matches App Interface)
      const localContextData = {
        name: formData.fullName,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender as any,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        location: formData.location,
        fitnessGoal: formData.fitnessGoal as any,
        activityLevel: formData.activityLevel as any,
        dietaryPreference: formData.dietaryPreference as any,
        allergies: formData.allergies,
        medicalConditions: formData.medicalConditions,
        bodyType: formData.bodyType, // Critical for AI
        onboardingComplete: true
      };

      console.log('Syncing Profile:', { firestoreData, localContextData });

      // 3. Attempt Cloud Sync
      try {
        const { error } = await updateProfile(user.uid, firestoreData);
        if (error) throw error;

        toast({
          title: "Profile Synced",
          description: "Your settings are saved to the cloud.",
        });
      } catch (firestoreError) {
        console.error("Cloud sync failed (likely permissions):", firestoreError);
        toast({
          title: "Saved Locally",
          description: "Cloud sync failed, but we saved your profile to this device. AI will work normally!",
          variant: "destructive", // Orange/Red to indicate partial success
        });
      }

      // 4. ALWAYS Update Local State (The "Living" App)
      updateUserData(localContextData);

    } catch (error: any) {
      console.error("Critical Profile Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingMedical(true);
    setMedicalAnalysis(null);

    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      await worker.terminate();

      const text = ret.data.text;
      const keywords = ['HbA1c', 'Cholesterol', 'Vitamin D', 'Glucose', 'Blood Pressure'];
      const found = keywords.filter(k => text.includes(k));

      if (found.length > 0) {
        setMedicalAnalysis(`Detected Records: ${found.join(', ')}. Saved to context.`);
        // In a real app, we'd parse the values too.
        updateUserData({ ...userData, medicalConditions: `Uploaded: ${found.join(', ')}` });
        toast({ title: "Medical Record Analyzed", description: "Updated health context with found metrics." });
      } else {
        setMedicalAnalysis("Analysis complete. No specific markers found, but document saved.");
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Analysis Failed", variant: "destructive" });
    } finally {
      setIsAnalyzingMedical(false);
    }
  };

  const connectHeartRate = async () => {
    setIsConnectingDevice(true);
    try {
      // @ts-ignore - Web Bluetooth types might be missing
      if (!navigator.bluetooth) throw new Error("Bluetooth not supported");

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('heart_rate');
      const characteristic = await service?.getCharacteristic('heart_rate_measurement');

      await characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', (e: any) => {
        const value = e.target.value;
        const hr = value.getUint8(1); // Standard HR format
        setHeartRate(hr);
      });

      toast({ title: "Device Connected", description: `Paired with ${device.name}` });
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Bluetooth device. Ensure distinct Bluetooth is enabled.",
        variant: "destructive"
      });
    } finally {
      setIsConnectingDevice(false);
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

          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">Your Profile</h1>
              <p className="text-gray-600">Manage your personal information and fitness preferences</p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/subscription')}
                className="bg-white hover:bg-purple-50 border-purple-200 text-purple-700"
              >
                Manage Subscription
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50">
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

                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Sign out?")) navigate('/login');
                        }}
                      >
                        Log Out
                      </Button>
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

              {/* Connected Health Section */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-teal-700">
                    <Activity className="h-5 w-5" /> Connected Health
                  </CardTitle>
                  <CardDescription>Integrate medical records and wearables</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">

                  {/* Medical Upload */}
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">Medical Records (OCR)</h3>
                      <p className="text-sm text-gray-500 mb-3">Upload blood reports or prescriptions. AI will extract key metrics.</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          id="med-upload"
                          className="hidden"
                          onChange={handleMedicalUpload}
                        />
                        <label htmlFor="med-upload" className="cursor-pointer">
                          <Button asChild variant="outline" size="sm" disabled={isAnalyzingMedical}>
                            <span>{isAnalyzingMedical ? 'Analyzing...' : <><Upload className="w-4 h-4 mr-2" /> Upload File</>}</span>
                          </Button>
                        </label>
                        {medicalAnalysis && <span className="text-xs text-green-600 font-medium">{medicalAnalysis}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Wearable Connection */}
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="bg-red-100 p-3 rounded-full">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Heart Rate Monitor</h3>
                        {heartRate && <span className="animate-pulse text-red-600 font-bold">{heartRate} BPM</span>}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Connect a Bluetooth LE heart rate strap.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={connectHeartRate}
                        disabled={isConnectingDevice}
                        className={heartRate ? "border-green-200 bg-green-50 text-green-700" : ""}
                      >
                        {isConnectingDevice ? 'Scanning...' : heartRate ? 'Device Connected' : <><Bluetooth className="w-4 h-4 mr-2" /> Connect Device</>}
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <ProfileStats />

              {/* Achievements Section */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 ring-1 ring-gray-200/50">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <span className="mr-2">🏆</span> Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {[
                      { title: "First Step", desc: "Completed 1st Workout", icon: "🥇", date: "Jan 19", color: "bg-yellow-100 text-yellow-700" },
                      { title: "Health Kicker", desc: "Logged 5 meals", icon: "🥗", date: "Jan 18", color: "bg-green-100 text-green-700" },
                      { title: "On Fire", desc: "3 Day Streak", icon: "🔥", date: "Jan 17", color: "bg-orange-100 text-orange-700" }
                    ].map((ach, i) => (
                      <div key={i} className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl mr-3 ${ach.color}`}>
                          {ach.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-gray-800">{ach.title}</h4>
                          <p className="text-xs text-gray-500">{ach.desc}</p>
                        </div>
                        <span className="text-xs font-medium text-gray-400">{ach.date}</span>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full text-xs text-purple-600 mt-2">View All Achievements</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
