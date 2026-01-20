
import { Workout } from '@/types';

export const workoutData: Workout[] = [
  // Warm-up Routines
  {
    id: 1,
    title: 'Essential Warm-up Routine',
    description: '5-10 minute warm-up to prepare your body for exercise',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0',
    duration: '10 mins',
    calories: 60,
    level: 'beginner' as const,
    type: 'warm-up',
    equipment: ['None'],
    benefits: ['Prepares muscles for exercise', 'Increases blood flow', 'Reduces risk of injury'],
    exercises: [
      {
        name: 'Jumping Jacks',
        duration: '1 min',
        sets: 2,
        restTime: 30,
        description: 'Full-body activation. Jump feet wide while clapping hands overhead.'
      },
      {
        name: 'Arm & Leg Swings',
        duration: '45 sec',
        sets: 2,
        restTime: 15,
        description: 'Dynamic swings to loosen up shoulders and hips.'
      },
      {
        name: 'High Knees',
        duration: '1 min',
        sets: 2,
        restTime: 30,
        description: 'Run in place bringing knees as high as possible.'
      }
    ]
  },

  // Cardio Workouts
  {
    id: 2,
    title: 'Fat-Burning Cardio Session',
    description: 'High-intensity cardio workout for maximum calorie burn',
    image: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776',
    duration: '25 mins',
    calories: 350,
    level: 'intermediate' as const,
    type: 'cardio',
    equipment: ['Jump Rope (optional)', 'None for shadow boxing'],
    benefits: ['Burns fat', 'Improves cardiovascular health', 'Boosts metabolism'],
    exercises: [
      { name: 'Warm-up', duration: '5 mins', description: 'Light movements to prepare the body' },
      { name: 'Jump Rope / Skipping', duration: '7 mins', description: 'Intense calorie burner, can be done at home or gym' },
      { name: 'Shadow Boxing', duration: '8 mins', description: 'Full-body cardio that also works your core' },
      { name: 'HIIT Intervals', duration: '5 mins', description: '30 seconds work, 15 seconds rest' }
    ]
  },

  // Chest Workouts
  {
    id: 3,
    title: 'Complete Chest Development',
    description: 'Strengthen and sculpt your chest muscles',
    image: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e',
    duration: '30 mins',
    calories: 250,
    level: 'beginner' as const,
    type: 'strength',
    equipment: ['Dumbbells (optional)', 'Exercise mat'],
    benefits: ['Builds upper body strength', 'Improves posture', 'Enhances pushing power'],
    exercises: [
      { name: 'Standard Push-Ups', duration: '10 mins', description: 'Classic bodyweight exercise for chest, can be done anywhere' },
      { name: 'Dumbbell Chest Press', duration: '10 mins', description: 'Using weights for progressive overload at gym or home' },
      { name: 'Incline Push-Ups', duration: '10 mins', description: 'Variation that targets upper chest, good for beginners' },
      { name: 'Chest Flyes', duration: '8 mins', description: 'Isolates chest muscles for better definition' },
      { name: 'Decline Push-Ups', duration: '8 mins', description: 'Targets lower chest muscles' }
    ]
  },

  // Back Workouts
  {
    id: 4,
    title: 'Strong Back Foundations',
    description: 'Build a powerful back with these targeted exercises',
    image: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa',
    duration: '30 mins',
    calories: 240,
    level: 'beginner' as const,
    type: 'strength',
    equipment: ['Resistance bands', 'Pull-up bar (optional)'],
    benefits: ['Improves posture', 'Prevents back pain', 'Balances chest development'],
    exercises: [
      { name: 'Superman Hold', duration: '8 mins', description: 'Great home exercise for lower back strength' },
      { name: 'Resistance Band Rows', duration: '10 mins', description: 'Versatile exercise for mid-back, works at home or gym' },
      { name: 'Pull-Ups / Assisted Pull-Ups', duration: '12 mins', description: 'Complete upper back developer, requires bar access' },
      { name: 'Lat Pulldowns', duration: '10 mins', description: 'Gym alternative to pull-ups targeting the lats' },
      { name: 'Renegade Rows', duration: '8 mins', description: 'Compound movement that works back and core simultaneously' }
    ]
  },

  // Shoulder Workouts
  {
    id: 5,
    title: 'Sculpted Shoulders Routine',
    description: 'Develop strong, well-defined shoulders',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
    duration: '25 mins',
    calories: 200,
    level: 'intermediate' as const,
    type: 'strength',
    equipment: ['Dumbbells (optional)', 'Exercise mat'],
    benefits: ['Creates shoulder definition', 'Improves overhead strength', 'Enhances upper body aesthetics'],
    exercises: [
      { name: 'Pike Push-Ups', duration: '8 mins', description: 'Advanced bodyweight movement for shoulders, home-friendly' },
      { name: 'Dumbbell Shoulder Press', duration: '10 mins', description: 'Classic shoulder builder for gym or home with equipment' },
      { name: 'Lateral Raises', duration: '7 mins', description: 'Targets side delts for that rounded shoulder look' },
      { name: 'Front Raises', duration: '7 mins', description: 'Isolates the front delts for balanced shoulder development' },
      { name: 'Reverse Flyes', duration: '7 mins', description: 'Targets rear delts to complete 3D shoulder development' }
    ]
  },

  // Arms Workouts
  {
    id: 6,
    title: 'Defined Arms Circuit',
    description: 'Target your biceps and triceps for toned arms',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
    duration: '25 mins',
    calories: 180,
    level: 'beginner' as const,
    type: 'strength',
    equipment: ['Dumbbells (optional)', 'Chair for dips'],
    benefits: ['Builds arm strength', 'Improves elbow joint stability', 'Enhances upper body appearance'],
    exercises: [
      {
        name: 'Bicep Curls',
        reps: '12-15',
        sets: 3,
        restTime: 45,
        weightGuidance: 'Medium Dumbbells',
        description: 'Keep elbows tucked, curl weight up with control.'
      },
      {
        name: 'Chair Dips',
        reps: '10-12',
        sets: 3,
        restTime: 45,
        weightGuidance: 'Bodyweight',
        description: 'Lower until elbows are at 90 degrees, then press up.'
      },
      {
        name: 'Hammer Curls',
        reps: '12',
        sets: 3,
        restTime: 45,
        weightGuidance: 'Medium Dumbbells',
        description: 'Palms facing each other, targets brachialis and forearms.'
      },
      {
        name: 'Diamond Push-Ups',
        reps: '8-10',
        sets: 3,
        restTime: 60,
        weightGuidance: 'Bodyweight',
        description: 'Hands close together under chest to target triceps.'
      },
      {
        name: 'Concentration Curls',
        reps: '12',
        sets: 2,
        restTime: 30,
        weightGuidance: 'Light/Medium Dumbbells',
        description: 'Seated, elbow on inner thigh. Focus on the squeeze.'
      }
    ]
  },

  // Core/Abs Workouts
  {
    id: 7,
    title: 'Core Strength Builder',
    description: 'Develop a strong, functional core with these targeted exercises',
    image: 'https://images.unsplash.com/photo-1616803689943-5601631c7fec',
    duration: '20 mins',
    calories: 150,
    level: 'beginner' as const,
    type: 'core',
    equipment: ['Exercise mat'],
    benefits: ['Improves stability', 'Enhances overall strength', 'Supports spine health'],
    exercises: [
      { name: 'Plank Variations', duration: '7 mins', description: 'Essential core stabilizer, multiple variations for all levels' },
      { name: 'Russian Twists', duration: '6 mins', description: 'Great for obliques and rotational strength, home or gym' },
      { name: 'Leg Raises', duration: '7 mins', description: 'Targets lower abs effectively, can be done anywhere' },
      { name: 'Mountain Climbers', duration: '5 mins', description: 'Dynamic core movement that also elevates heart rate' },
      { name: 'Bicycle Crunches', duration: '5 mins', description: 'Engages multiple core muscles simultaneously' }
    ]
  },

  // Legs Workouts
  {
    id: 8,
    title: 'Lower Body Power',
    description: 'Build strong legs with these foundational movements',
    image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a',
    duration: '35 mins',
    calories: 300,
    level: 'intermediate' as const,
    type: 'strength',
    equipment: ['Weights (optional for weighted squats)', 'Exercise mat'],
    benefits: ['Builds lower body strength', 'Improves athletic performance', 'Boosts metabolism'],
    exercises: [
      { name: 'Bodyweight Squats', duration: '12 mins', description: 'Fundamental movement for leg strength, no equipment needed' },
      { name: 'Walking Lunges', duration: '12 mins', description: 'Great for balance and leg development, home or gym' },
      { name: 'Leg Press or Weighted Squats', duration: '11 mins', description: 'Advanced movement for additional resistance at gym' },
      { name: 'Bulgarian Split Squats', duration: '10 mins', description: 'Unilateral exercise for addressing muscle imbalances' },
      { name: 'Calf Raises', duration: '8 mins', description: 'Targets calf muscles for complete lower body development' }
    ]
  },

  // Glutes Workouts
  {
    id: 9,
    title: 'Glute Activation & Strength',
    description: 'Target your glutes for strength and shape',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5',
    duration: '25 mins',
    calories: 220,
    level: 'beginner' as const,
    type: 'strength',
    equipment: ['Resistance bands (optional)', 'Exercise mat'],
    benefits: ['Strengthens hip extensors', 'Improves lower body aesthetics', 'Supports lower back'],
    exercises: [
      { name: 'Glute Bridges', duration: '8 mins', description: 'Excellent glute activator for home or gym' },
      { name: 'Donkey Kicks', duration: '8 mins', description: 'Targeted glute exercise, perfect for home workouts' },
      { name: 'Resistance Band Kickbacks', duration: '9 mins', description: 'Added resistance for glute development' },
      { name: 'Sumo Squats', duration: '8 mins', description: 'Wide stance squat that emphasizes inner thighs and glutes' },
      { name: 'Hip Thrusts', duration: '8 mins', description: 'Advanced glute exercise with greater range of motion than bridges' }
    ]
  },

  // HIIT/Full Body Workouts
  {
    id: 10,
    title: 'Full Body HIIT Challenge',
    description: 'High-intensity full body workout for maximum results',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
    duration: '30 mins',
    calories: 400,
    level: 'advanced' as const,
    type: 'hiit',
    equipment: ['Kettlebell (optional)', 'Exercise mat'],
    benefits: ['Burns maximum calories', 'Saves time', 'Improves cardiovascular fitness'],
    exercises: [
      { name: 'Burpees', duration: '10 mins', description: 'Ultimate full-body exercise for home or gym' },
      { name: 'Mountain Climbers', duration: '10 mins', description: 'Dynamic movement that combines cardio and core' },
      { name: 'Kettlebell Swings', duration: '10 mins', description: 'Explosive movement for power and conditioning' },
      { name: 'Jumping Jacks', duration: '5 mins', description: 'Classic cardio movement that requires no equipment' },
      { name: 'High Knees', duration: '5 mins', description: 'Cardio exercise that targets the core and elevates heart rate' }
    ]
  },

  // Yoga Session
  {
    id: 11,
    title: 'Power Yoga Flow',
    description: 'A dynamic yoga routine for strength and flexibility',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    duration: '45 mins',
    calories: 200,
    level: 'intermediate' as const,
    type: 'yoga',
    equipment: ['Yoga mat', 'Optional: Yoga blocks'],
    benefits: ['Improves flexibility', 'Builds core strength', 'Reduces stress'],
    exercises: [
      { name: 'Sun Salutations', duration: '15 mins', description: 'Traditional sequence to warm up the entire body' },
      { name: 'Standing Poses', duration: '15 mins', description: 'Warrior poses and balances for strength and focus' },
      { name: 'Floor Work', duration: '10 mins', description: 'Seated and lying poses for deep stretching' },
      { name: 'Meditation', duration: '5 mins', description: 'Mindful cooldown to integrate the practice' },
      { name: 'Shavasana', duration: '5 mins', description: 'Final relaxation pose to absorb the benefits of the practice' }
    ]
  },

  // Recovery/Mobility Session
  {
    id: 12,
    title: 'Recovery & Mobility Session',
    description: 'Stretch and recover to improve performance and prevent injury',
    image: 'https://images.unsplash.com/photo-1599447292470-41ced73d41e7',
    duration: '30 mins',
    calories: 100,
    level: 'beginner' as const,
    type: 'mobility',
    equipment: ['Foam roller (optional)', 'Yoga mat'],
    benefits: ['Accelerates recovery', 'Improves joint mobility', 'Reduces muscle soreness'],
    exercises: [
      { name: 'Dynamic Stretching', duration: '10 mins', description: 'Movement-based stretches for major muscle groups' },
      { name: 'Foam Rolling', duration: '10 mins', description: 'Self-myofascial release for tight muscles' },
      { name: 'Static Stretching', duration: '10 mins', description: 'Longer holds to improve flexibility' },
      { name: 'Joint Mobility', duration: '5 mins', description: 'Movements designed to improve range of motion in joints' },
      { name: 'Deep Breathing', duration: '5 mins', description: 'Breathing exercises to reduce tension and promote recovery' }
    ]
  }
];

// Home workout variations for beginners
export const homeWorkouts: Workout[] = [
  {
    id: 101,
    title: 'No Equipment Home Workout',
    description: 'Complete body workout with just your bodyweight',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c',
    duration: '30 mins',
    calories: 200,
    level: 'beginner' as const,
    type: 'full-body',
    equipment: ['None'],
    benefits: ['No equipment needed', 'Can be done in small spaces', 'Full body conditioning'],
    exercises: [
      { name: 'Bodyweight Squats', duration: '7 mins', description: 'Basic lower body movement' },
      { name: 'Push-Ups (or Modified Push-Ups)', duration: '7 mins', description: 'Upper body strength' },
      { name: 'Glute Bridges', duration: '7 mins', description: 'Posterior chain activation' },
      { name: 'Plank Hold', duration: '5 mins', description: 'Core stability and strength' },
      { name: 'Mountain Climbers', duration: '4 mins', description: 'Dynamic core and cardio' }
    ]
  }
];

// Gym workout variations for intermediate
export const gymWorkouts: Workout[] = [
  {
    id: 201,
    title: 'Full Gym Strength Circuit',
    description: 'Utilize gym equipment for maximum muscle development',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    duration: '45 mins',
    calories: 350,
    level: 'intermediate' as const,
    type: 'strength',
    equipment: ['Barbells', 'Dumbbells', 'Cables', 'Benches'],
    benefits: ['Maximizes muscle hypertrophy', 'Improves strength', 'Works all major muscle groups'],
    exercises: [
      { name: 'Barbell Bench Press', duration: '9 mins', description: 'Classic chest compound movement' },
      { name: 'Dumbbell Rows', duration: '9 mins', description: 'Back thickness and strength' },
      { name: 'Barbell Squats', duration: '9 mins', description: 'Lower body power development' },
      { name: 'Overhead Press', duration: '9 mins', description: 'Shoulder strength and development' },
      { name: 'Cable Face Pulls', duration: '9 mins', description: 'Rear delt and upper back health' }
    ]
  }
];

// Sample exercise instructions map
export const exerciseInstructions: Record<string, string[]> = {
  "Jumping Jacks": [
    "Stand upright with your legs together and arms at your sides.",
    "Jump up, spread your feet beyond hip-width apart, and bring your arms above your head, almost touching.",
    "Jump again, bringing your arms back to your sides and your feet together.",
    "Repeat at a moderate to fast pace for the duration."
  ],
  "Arm & Leg Swings": [
    "Stand with your feet hip-width apart.",
    "Swing your arms forward and backward in a controlled manner.",
    "After 30 seconds, swing each leg forward and backward while holding onto a stable surface for balance.",
    "Focus on relaxing your muscles and increasing range of motion gradually."
  ],
  "High Knees": [
    "Stand with your feet hip-width apart.",
    "Run in place, bringing your knees up toward your chest as high as possible.",
    "Land on the balls of your feet.",
    "Move your arms in a running motion to increase intensity."
  ],
  "Push-Ups": [
    "Start in a plank position with hands slightly wider than shoulder-width apart.",
    "Keep your body in a straight line from head to heels.",
    "Lower your body until your chest nearly touches the floor.",
    "Push back up to the starting position.",
    "For beginners, start with modified push-ups on your knees."
  ],
  "Plank Variations": [
    "Standard plank: Hold a push-up position with arms straight and body in a straight line.",
    "Forearm plank: Same as standard but on your forearms.",
    "Side plank: Balance on one hand or forearm with feet stacked.",
    "Hold each position for 20-30 seconds, focusing on keeping your core engaged."
  ],
  "Bodyweight Squats": [
    "Stand with feet shoulder-width apart, toes slightly turned out.",
    "Keep your chest up and back straight throughout the movement.",
    "Lower your body by bending at the knees and hips, as if sitting back into a chair.",
    "Squat down until your thighs are parallel to the ground, or as low as you can go with proper form.",
    "Push through your heels to return to the starting position."
  ],
  "Glute Bridges": [
    "Lie on your back with knees bent and feet flat on the floor, hip-width apart.",
    "Place arms at your sides with palms facing down.",
    "Push through your heels to lift your hips toward the ceiling.",
    "At the top, your body should form a straight line from shoulders to knees.",
    "Squeeze your glutes at the top, then lower your hips back to the starting position."
  ],
  "Burpees": [
    "Start in a standing position with feet shoulder-width apart.",
    "Drop into a squat position and place your hands on the ground.",
    "Kick your feet back into a plank position.",
    "Perform a push-up (optional for added difficulty).",
    "Jump your feet back to the squat position.",
    "Explosively jump up with arms extended overhead."
  ],
  "Mountain Climbers": [
    "Start in a plank position with hands directly under shoulders.",
    "Keep your core engaged and back flat.",
    "Rapidly alternate bringing knees toward your chest, as if running in place.",
    "Maintain a steady pace without lifting your hips too high.",
    "Focus on keeping your shoulders stable throughout the movement."
  ],
  "Russian Twists": [
    "Sit on the floor with knees bent and feet either flat or elevated slightly.",
    "Lean back slightly to engage your core, keeping your back straight.",
    "Clasp your hands together or hold a weight in front of you.",
    "Rotate your torso to the right, bringing your hands beside your right hip.",
    "Rotate to the left side in the same manner, completing one repetition.",
    "Continue alternating sides at a controlled pace."
  ],
  "Bicep Curls": [
    "Stand with feet shoulder-width apart, holding weights at your sides, palms facing forward.",
    "Keep your elbows close to your sides and shoulders relaxed.",
    "Curl the weights upward while keeping your upper arms stationary.",
    "Continue curling until the weights are at shoulder level.",
    "Slowly lower the weights back to the starting position."
  ],
  "Leg Raises": [
    "Lie on your back with legs extended and hands at your sides or under your lower back for support.",
    "Keep your legs straight and together.",
    "Engage your core and lift your legs until they form a 90-degree angle with the floor.",
    "Slowly lower your legs back down without letting them touch the ground.",
    "Maintain constant tension in your lower abdominals throughout the movement."
  ],
  "Resistance Band Rows": [
    "Secure a resistance band to a stable anchor point at chest height.",
    "Hold the band with both hands and step back until there's tension.",
    "Stand with feet shoulder-width apart, slight bend in knees.",
    "Pull the band toward your chest, squeezing your shoulder blades together.",
    "Slowly return to the starting position with arms extended."
  ],
  "Barbell Bench Press": [
    "Lie on a flat bench with feet planted firmly on the floor.",
    "Grip the barbell slightly wider than shoulder-width apart.",
    "Lower the bar to your mid-chest with control.",
    "Press the bar back up to full arm extension.",
    "Keep your shoulders back and down throughout the movement."
  ],
  "Barbell Squats": [
    "Stand with feet shoulder-width apart and the barbell across your upper back.",
    "Keep your chest up and core engaged.",
    "Bend at the knees and hips to lower your body.",
    "Descend until thighs are at least parallel to the ground.",
    "Drive through your heels to return to the standing position."
  ],
  "Dumbbell Rows": [
    "Place one knee and hand on a bench with back parallel to the ground.",
    "Hold a dumbbell in your free hand with arm extended toward the floor.",
    "Pull the dumbbell up to your side while keeping your elbow close to your body.",
    "Squeeze your back muscles at the top of the movement.",
    "Lower the weight with control and repeat."
  ]
};
