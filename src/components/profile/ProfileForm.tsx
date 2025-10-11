
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={onInputChange}
          placeholder="Your full name"
          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70"
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
          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70"
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
          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gender" className="text-gray-700 font-medium">Gender</Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => onSelectChange('gender', value)}
        >
          <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
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
          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70"
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
          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70"
        />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="location" className="text-gray-700 font-medium">Location</Label>
        <Select
          value={formData.location}
          onValueChange={(value) => onSelectChange('location', value)}
        >
          <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70">
            <SelectValue placeholder="Select your city" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-60">
            {locations.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fitnessGoal" className="text-gray-700 font-medium">Fitness Goal</Label>
        <Select
          value={formData.fitnessGoal}
          onValueChange={(value) => onSelectChange('fitnessGoal', value)}
        >
          <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70">
            <SelectValue placeholder="Select fitness goal" />
          </SelectTrigger>
          <SelectContent className="bg-white">
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
          <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70">
            <SelectValue placeholder="Select fitness level" />
          </SelectTrigger>
          <SelectContent className="bg-white">
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
          <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70">
            <SelectValue placeholder="Select dietary preference" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="Veg">Vegetarian</SelectItem>
            <SelectItem value="Non-Veg">Non-Vegetarian</SelectItem>
            <SelectItem value="Vegan">Vegan</SelectItem>
            <SelectItem value="Eggetarian">Eggetarian</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProfileForm;
