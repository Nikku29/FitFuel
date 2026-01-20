
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationInput from "@/components/ui/LocationInput";

interface ProfileFormData {
  fullName: string;
  email: string;
  username: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  location: string;
  fitnessGoal: string;
  activityLevel: string;
  dietaryPreference: string;
  allergies: string;
  medicalConditions: string;
  bodyType: string;
}

interface ProfileFormProps {
  formData: ProfileFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  locations: string[];
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  onInputChange,
  onSelectChange,
  locations
}) => {
  return (
    <div className="glass-card p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={onInputChange}
          placeholder="Your full name"
          className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={onInputChange}
          placeholder="Your username"
          className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age" className="text-gray-700 font-medium">Age</Label>
        <Input
          id="age"
          name="age"
          type="number"
          value={formData.age}
          onChange={onInputChange}
          placeholder="Your age"
          className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender" className="text-gray-700 font-medium">Gender</Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => onSelectChange('gender', value)}
        >
          <SelectTrigger className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent className="bg-white/90 backdrop-blur-md">
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodyType" className="text-gray-700 font-medium">Body Type (Genetics)</Label>
        <Select
          value={formData.bodyType}
          onValueChange={(value) => onSelectChange('bodyType', value)}
        >
          <SelectTrigger className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm">
            <SelectValue placeholder="Select body type" />
          </SelectTrigger>
          <SelectContent className="bg-white/90 backdrop-blur-md">
            <SelectItem value="Ectomorph">Ectomorph (Lean/Long)</SelectItem>
            <SelectItem value="Mesomorph">Mesomorph (Athletic)</SelectItem>
            <SelectItem value="Endomorph">Endomorph (Broad/Solid)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight" className="text-gray-700 font-medium">Weight (kg)</Label>
        <Input
          id="weight"
          name="weight"
          type="number"
          value={formData.weight}
          onChange={onInputChange}
          placeholder="Your weight"
          className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="height" className="text-gray-700 font-medium">Height (cm)</Label>
        <Input
          id="height"
          name="height"
          type="number"
          value={formData.height}
          onChange={onInputChange}
          placeholder="Your height"
          className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm"
        />
      </div>

      <div className="md:col-span-2">
        <LocationInput
          value={formData.location}
          onChange={onInputChange}
          name="location"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fitnessGoal" className="text-gray-700 font-medium">Fitness Goal</Label>
        <Select
          value={formData.fitnessGoal}
          onValueChange={(value) => onSelectChange('fitnessGoal', value)}
        >
          <SelectTrigger className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm">
            <SelectValue placeholder="Select fitness goal" />
          </SelectTrigger>
          <SelectContent className="bg-white/90 backdrop-blur-md">
            <SelectItem value="Weight Loss">Weight Loss</SelectItem>
            <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
            <SelectItem value="General Fitness">General Fitness</SelectItem>
            <SelectItem value="Endurance">Endurance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityLevel" className="text-gray-700 font-medium">Fitness Level</Label>
        <Select
          value={formData.activityLevel}
          onValueChange={(value) => onSelectChange('activityLevel', value)}
        >
          <SelectTrigger className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm">
            <SelectValue placeholder="Select fitness level" />
          </SelectTrigger>
          <SelectContent className="bg-white/90 backdrop-blur-md">
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dietaryPreference" className="text-gray-700 font-medium">Dietary Preference</Label>
        <Select
          value={formData.dietaryPreference}
          onValueChange={(value) => onSelectChange('dietaryPreference', value)}
        >
          <SelectTrigger className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm">
            <SelectValue placeholder="Select dietary preference" />
          </SelectTrigger>
          <SelectContent className="bg-white/90 backdrop-blur-md">
            <SelectItem value="Veg">Vegetarian</SelectItem>
            <SelectItem value="Non-Veg">Non-Vegetarian</SelectItem>
            <SelectItem value="Vegan">Vegan</SelectItem>
            <SelectItem value="Eggetarian">Eggetarian</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="allergies" className="text-gray-700 font-medium">Allergies (Optional)</Label>
        <Input
          id="allergies"
          name="allergies"
          value={formData.allergies}
          onChange={onInputChange}
          placeholder="e.g. Peanuts, Gluten, Dairy"
          className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="medicalConditions" className="text-gray-700 font-medium">Medical Conditions / Injuries (Optional)</Label>
        <Input
          id="medicalConditions"
          name="medicalConditions"
          value={formData.medicalConditions}
          onChange={onInputChange}
          placeholder="e.g. Back pain, Asthma, Diabetes"
          className="border-gray-200/50 focus:border-purple-500 focus:ring-purple-500 bg-white/50 backdrop-blur-sm"
        />
      </div>
    </div>
  );
};

export default ProfileForm;
