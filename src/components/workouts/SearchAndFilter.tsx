
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  currentTab,
  setCurrentTab
}) => {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      className="flex flex-col gap-4 w-full"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder="Search workouts..." 
          className="pl-10 border-purple-300 focus:border-purple-500" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <ScrollArea className="w-full">
        <Tabs defaultValue="all" className="w-full" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className={`flex ${isMobile ? 'w-[800px]' : 'w-full'} bg-purple-100 p-1 rounded-lg`}>
            <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white">All</TabsTrigger>
            <TabsTrigger value="beginner" className="flex-1 data-[state=active]:bg-green-500 data-[state=active]:text-white">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate" className="flex-1 data-[state=active]:bg-yellow-500 data-[state=active]:text-white">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">Advanced</TabsTrigger>
            <TabsTrigger value="cardio" className="flex-1 data-[state=active]:bg-red-500 data-[state=active]:text-white">Cardio</TabsTrigger>
            <TabsTrigger value="strength" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Strength</TabsTrigger>
            <TabsTrigger value="yoga" className="flex-1 data-[state=active]:bg-green-600 data-[state=active]:text-white">Yoga</TabsTrigger>
            <TabsTrigger value="hiit" className="flex-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white">HIIT</TabsTrigger>
            <TabsTrigger value="core" className="flex-1 data-[state=active]:bg-yellow-500 data-[state=active]:text-white">Core</TabsTrigger>
            <TabsTrigger value="mobility" className="flex-1 data-[state=active]:bg-teal-500 data-[state=active]:text-white">Recovery</TabsTrigger>
          </TabsList>
        </Tabs>
      </ScrollArea>
    </motion.div>
  );
};

export default SearchAndFilter;
