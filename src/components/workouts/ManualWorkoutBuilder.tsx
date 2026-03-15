import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Trash2, Save, Dumbbell, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Use the existing exercise instructions for our dropdown
import { exerciseInstructions } from '@/data/workoutData';

interface ExerciseEntry {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest_seconds: number;
  suggested_weight: string;
}

export const ManualWorkoutBuilder = ({ onSaveData }: { onSaveData: (workout: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('Custom Workout');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);

  const availableExerciseNames = Object.keys(exerciseInstructions);

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        id: Date.now().toString(),
        name: availableExerciseNames[0],
        sets: '3',
        reps: '10',
        rest_seconds: 60,
        suggested_weight: 'Bodyweight',
      },
    ]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleChange = (id: string, field: keyof ExerciseEntry, value: string | number) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === id) {
          return { ...ex, [field]: value };
        }
        return ex;
      })
    );
  };

  const handleSave = () => {
    if (exercises.length === 0) return;

    // Transform into the format expected by the WorkoutDetailModal
    const workoutModel = {
      title: title,
      exercises: exercises.map((ex: ExerciseEntry) => {
        const info = exerciseInstructions[ex.name as keyof typeof exerciseInstructions];
        // If info is an array of strings, just grab the first one as description.
        const desc = Array.isArray(info) ? info[0] : 'Perform with good form.';
        return {
          ...ex,
          description: desc,
          equipment: []
        };
      }),
      duration: `${exercises.length * 5} min`, // rough estimate
      difficulty: 'Custom',
      calories: exercises.length * 40 // rough estimate
    };

    onSaveData(workoutModel);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-4 flex items-center justify-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
          <Dumbbell className="w-4 h-4" />
          Build Manual Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Build Manual Workout</DialogTitle>
          <DialogDescription>Create your own custom session by adding exercises.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="workout-title">Workout Title</Label>
            <Input
              id="workout-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Heavy Legs Day"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-700">Exercises</h4>
              <Button onClick={handleAddExercise} size="sm" variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                <PlusCircle className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                No exercises added yet.
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.map((ex, index) => (
                  <Card key={ex.id} className="relative shadow-sm border-gray-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 h-6 w-6"
                      onClick={() => handleRemoveExercise(ex.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <CardContent className="pt-6 pb-4 px-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label>Exercise Name</Label>
                          <Select value={ex.name} onValueChange={(val) => handleChange(ex.id, 'name', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exercise" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableExerciseNames.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Sets</Label>
                          <Input value={ex.sets} onChange={(e) => handleChange(ex.id, 'sets', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Reps</Label>
                          <Input value={ex.reps} onChange={(e) => handleChange(ex.id, 'reps', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Rest (seconds)</Label>
                          <Input type="number" value={ex.rest_seconds} onChange={(e) => handleChange(ex.id, 'rest_seconds', parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Weight Idea</Label>
                          <Input value={ex.suggested_weight} onChange={(e) => handleChange(ex.id, 'suggested_weight', e.target.value)} placeholder="e.g. Bodyweight, 20kg" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            disabled={exercises.length === 0} 
            onClick={handleSave} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Start This Workout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualWorkoutBuilder;
