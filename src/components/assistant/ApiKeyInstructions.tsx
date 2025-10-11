
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const ApiKeyInstructions: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Setting up DeepSeek AI API Key</CardTitle>
          <CardDescription>
            Follow these steps to enable the AI Assistant functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Key Required</AlertTitle>
            <AlertDescription>
              The AI Assistant uses the DeepSeek API which requires an API key to function.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Step 1: Create a DeepSeek Account</h3>
            <p className="text-sm text-gray-600">
              Visit <a href="https://platform.deepseek.com/signup" target="_blank" rel="noopener noreferrer" className="text-fitfuel-purple underline">deepseek.com</a> and create an account if you don't already have one.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Step 2: Get Your API Key</h3>
            <p className="text-sm text-gray-600">
              After logging in, go to your account settings or API section to generate an API key.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Step 3: Configure Environment Variables</h3>
            <p className="text-sm text-gray-600">
              1. Add your DeepSeek API key to your environment variables file (.env.local).<br/>
              2. Add the variable: <code className="bg-gray-100 px-1 py-0.5 rounded text-fitfuel-purple">VITE_DEEPSEEK_API_KEY=your_api_key_here</code><br/>
              3. Restart your development server.<br/>
              4. For production, add this environment variable to your hosting platform.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Step 4: Restart Development Server</h3>
            <p className="text-sm text-gray-600">
              After adding the API key, restart your development server to apply the changes.
            </p>
          </div>
          
          <Alert className="bg-green-50 border-green-300">
            <AlertTitle className="text-green-800">Pro Tip</AlertTitle>
            <AlertDescription className="text-green-700">
              For testing purposes, DeepSeek offers free credits to new accounts which should be sufficient to try out the AI assistant functionality.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ApiKeyInstructions;
