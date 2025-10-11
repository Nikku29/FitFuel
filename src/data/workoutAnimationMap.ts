
export const workoutAnimationMap: Record<string, string> = {
  "Warm-up": "https://lottie.host/4d9f4b8c-8c7a-4f0b-9c5a-2e8f7d6c5b4a/XyZ123Abc.json",
  "Essential": "https://lottie.host/4d9f4b8c-8c7a-4f0b-9c5a-2e8f7d6c5b4a/XyZ123Abc.json",
  "Cardio": "https://lottie.host/8f2a5b7d-1c3e-4f6a-8b9c-5d7e9f1a2b3c/RunAnimation.json",
  "Fat-Burning": "https://lottie.host/8f2a5b7d-1c3e-4f6a-8b9c-5d7e9f1a2b3c/RunAnimation.json",
  "Chest": "https://lottie.host/2a4b6c8d-5e7f-4g9h-1i2j-3k4l5m6n7o8p/ChestPress.json",
  "Back": "https://lottie.host/7e9f1a2b-3c4d-5e6f-7g8h-9i1j2k3l4m5n/BackRow.json",
  "Strong": "https://lottie.host/7e9f1a2b-3c4d-5e6f-7g8h-9i1j2k3l4m5n/BackRow.json",
  "Shoulder": "https://lottie.host/5g7h9i1j-2k3l-4m5n-6o7p-8q9r1s2t3u4v/ShoulderPress.json",
  "Sculpted": "https://lottie.host/5g7h9i1j-2k3l-4m5n-6o7p-8q9r1s2t3u4v/ShoulderPress.json",
  "Arms": "https://lottie.host/9k1l3m5n-7o8p-9q1r-2s3t-4u5v6w7x8y9z/BicepCurl.json",
  "Defined": "https://lottie.host/9k1l3m5n-7o8p-9q1r-2s3t-4u5v6w7x8y9z/BicepCurl.json",
  "Core": "https://lottie.host/3m5n7o9p-1q2r-3s4t-5u6v-7w8x9y1z2a3b/CoreWorkout.json",
  "Strength": "https://lottie.host/3m5n7o9p-1q2r-3s4t-5u6v-7w8x9y1z2a3b/CoreWorkout.json",
  "Legs": "https://lottie.host/6o8p1q3r-4s5t-6u7v-8w9x-1y2z3a4b5c6d/LegPress.json",
  "Lower Body": "https://lottie.host/6o8p1q3r-4s5t-6u7v-8w9x-1y2z3a4b5c6d/LegPress.json",
  "Power": "https://lottie.host/6o8p1q3r-4s5t-6u7v-8w9x-1y2z3a4b5c6d/LegPress.json",
  "Glute": "https://lottie.host/8q1r3s5t-7u8v-9w1x-2y3z-4a5b6c7d8e9f/GluteActivation.json",
  "Activation": "https://lottie.host/8q1r3s5t-7u8v-9w1x-2y3z-4a5b6c7d8e9f/GluteActivation.json",
  "HIIT": "https://lottie.host/1s3t5u7v-9w1x-2y3z-4a5b-6c7d8e9f1g2h/HIITWorkout.json",
  "Full Body": "https://lottie.host/1s3t5u7v-9w1x-2y3z-4a5b-6c7d8e9f1g2h/HIITWorkout.json",
  "Challenge": "https://lottie.host/1s3t5u7v-9w1x-2y3z-4a5b-6c7d8e9f1g2h/HIITWorkout.json",
  "Yoga": "https://lottie.host/4u7v9w1x-2y3z-4a5b-6c7d-8e9f1g2h3i4j/YogaPose.json",
  "Flow": "https://lottie.host/4u7v9w1x-2y3z-4a5b-6c7d-8e9f1g2h3i4j/YogaPose.json",
  "Recovery": "https://lottie.host/7w1x3y5z-4a5b-6c7d-8e9f-1g2h3i4j5k6l/Stretching.json",
  "Mobility": "https://lottie.host/7w1x3y5z-4a5b-6c7d-8e9f-1g2h3i4j5k6l/Stretching.json",
  "Session": "https://lottie.host/7w1x3y5z-4a5b-6c7d-8e9f-1g2h3i4j5k6l/Stretching.json"
} as const;

export const getWorkoutAnimation = (workoutTitle: string): string | null => {
  // Find the first matching keyword in the workout title
  for (const [keyword, animationUrl] of Object.entries(workoutAnimationMap)) {
    if (workoutTitle.toLowerCase().includes(keyword.toLowerCase())) {
      return animationUrl;
    }
  }
  
  // Default fallback animation for general fitness
  return "https://lottie.host/1a2b3c4d-5e6f-7g8h-9i1j-2k3l4m5n6o7p/GeneralFitness.json";
};
