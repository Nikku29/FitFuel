import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Heart, AlertTriangle } from 'lucide-react';

interface AnonymousUserData {
  height_cm?: number;
  weight_kg?: number;
  age?: number;
  gender?: string;
  location?: string;
  diet_preference?: string;
  fitness_level?: string;
  fitness_goal?: string;
  allergies?: string;
  medical_conditions?: string;
  activity_restrictions?: string;
}

interface AnonymousUserFormProps {
  onSubmit: (data: AnonymousUserData) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

const AnonymousUserForm: React.FC<AnonymousUserFormProps> = ({ onSubmit, onSkip, isLoading }) => {
  const [formData, setFormData] = useState<AnonymousUserData>({});

  const handleInputChange = (field: keyof AnonymousUserData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <User className="h-5 w-5 text-fitfusion-purple" />
          Get Personalized AI Advice
        </CardTitle>
        <CardDescription>
          Share some details to get better fitness and nutrition recommendations (optional)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Your age"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Your height"
                value={formData.height_cm || ''}
                onChange={(e) => handleInputChange('height_cm', parseInt(e.target.value) || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Your weight"
                value={formData.weight_kg || ''}
                onChange={(e) => handleInputChange('weight_kg', parseInt(e.target.value) || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Your location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fitnessGoal">Fitness Goal</Label>
              <Select onValueChange={(value) => handleInputChange('fitness_goal', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fitness goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                  <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                  <SelectItem value="General Fitness">General Fitness</SelectItem>
                  <SelectItem value="Endurance">Endurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fitnessLevel">Fitness Level</Label>
              <Select onValueChange={(value) => handleInputChange('fitness_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fitness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dietPreference">Dietary Preference</Label>
              <Select onValueChange={(value) => handleInputChange('diet_preference', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dietary preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Veg">Vegetarian</SelectItem>
                  <SelectItem value="Non-Veg">Non-Vegetarian</SelectItem>
                  <SelectItem value="Vegan">Vegan</SelectItem>
                  <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergies" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Allergies & Food Sensitivities
              </Label>
              <Textarea
                id="allergies"
                placeholder="List any food allergies or sensitivities (e.g., nuts, dairy, gluten)"
                value={formData.allergies || ''}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicalConditions" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Medical Conditions
              </Label>
              <Textarea
                id="medicalConditions"
                placeholder="Any relevant medical conditions (e.g., diabetes, high blood pressure)"
                value={formData.medical_conditions || ''}
                onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="activityRestrictions">Activity Restrictions</Label>
              <Textarea
                id="activityRestrictions"
                placeholder="Any physical limitations or exercise restrictions"
                value={formData.activity_restrictions || ''}
                onChange={(e) => handleInputChange('activity_restrictions', e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-fitfusion-purple to-fitfusion-blue text-white"
            >
              {isLoading ? "Saving..." : "Get Personalized Advice"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSkip}
              className="flex-1"
            >
              Skip & Use Basic AI
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnonymousUserForm;
