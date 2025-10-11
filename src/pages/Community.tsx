
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, Heart, MessageSquare, Share2, Send, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';

// Sample community posts with Indian names and content
const communityPosts = [
  {
    id: 1,
    author: {
      name: "Arjun Mehta",
      avatar: "https://i.pravatar.cc/150?img=11",
      location: "Mumbai, Maharashtra"
    },
    type: "success-story",
    date: "2 days ago",
    title: "My 6-Month Transformation Journey",
    content: "I started my fitness journey 6 months ago, weighing 95 kg. Today, I'm at 75 kg and feeling stronger than ever! The FitFuel community has been incredibly supportive throughout my journey. Special thanks to Coach Raj for his guidance.",
    image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0",
    likes: 245,
    comments: 43,
    shares: 12,
    tags: ["transformation", "weight-loss", "fitfuel-success"]
  },
  {
    id: 2,
    author: {
      name: "Priya Sharma",
      avatar: "https://i.pravatar.cc/150?img=5",
      location: "Delhi, NCR"
    },
    type: "recipe",
    date: "1 week ago",
    title: "Protein-Packed Paneer Breakfast Bowl",
    content: "Start your day with this energizing breakfast bowl featuring marinated paneer, quinoa, and fresh veggies. Perfect for vegetarians looking to increase protein intake! I've been having this 3 times a week and my energy levels have skyrocketed.",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af",
    likes: 189,
    comments: 52,
    shares: 31,
    tags: ["recipe", "vegetarian", "high-protein"]
  },
  {
    id: 3,
    author: {
      name: "Rahul Verma",
      avatar: "https://i.pravatar.cc/150?img=12",
      location: "Bengaluru, Karnataka"
    },
    type: "workout",
    date: "3 days ago",
    title: "30-Day Calisthenics Challenge Results",
    content: "Just completed the 30-day calisthenics challenge from the app and I'm amazed at how much my body has changed! I can now do 15 pull-ups in a row, up from just 3 when I started. Consistency really is key.",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
    likes: 321,
    comments: 37,
    shares: 15,
    tags: ["calisthenics", "challenge", "body-weight"]
  },
  {
    id: 4,
    author: {
      name: "Ananya Patel",
      avatar: "https://i.pravatar.cc/150?img=9",
      location: "Ahmedabad, Gujarat"
    },
    type: "motivation",
    date: "5 days ago",
    title: "Finding Time for Fitness as a Working Mom",
    content: "As a mother of two and a full-time IT professional, finding time for fitness was always challenging. I started waking up 45 minutes earlier to follow FitFuel's quick morning routines, and it has changed my life! Remember, you can't pour from an empty cup.",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8",
    likes: 276,
    comments: 64,
    shares: 28,
    tags: ["working-mom", "morning-routine", "self-care"]
  },
  {
    id: 5,
    author: {
      name: "Vikram Singh",
      avatar: "https://i.pravatar.cc/150?img=15",
      location: "Chandigarh, Punjab"
    },
    type: "question",
    date: "1 day ago",
    title: "Best Protein Supplements Available in India?",
    content: "I've been using imported whey protein but looking to switch to something more affordable and locally available. Any recommendations from the community? Preferably something with good taste and minimal artificial ingredients.",
    image: "",
    likes: 87,
    comments: 93,
    shares: 5,
    tags: ["supplements", "protein", "advice"]
  },
  {
    id: 6,
    author: {
      name: "Neha Gupta",
      avatar: "https://i.pravatar.cc/150?img=7",
      location: "Hyderabad, Telangana"
    },
    type: "event",
    date: "2 weeks ago",
    title: "Join Our Yoga by the Lake Event!",
    content: "We're organizing a community yoga session at Hussain Sagar Lake this Sunday at 6 AM. All levels welcome! Bring your own mat and water bottle. Let's connect with nature while working on our flexibility and mindfulness. Drop a comment if you're joining!",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
    likes: 152,
    comments: 47,
    shares: 38,
    tags: ["yoga", "community-event", "hyderabad"]
  }
];

// Sample upcoming events
const upcomingEvents = [
  {
    id: 1,
    title: "Mumbai Marathon Training",
    date: "June 15, 2025",
    location: "Marine Drive, Mumbai",
    attendees: 78
  },
  {
    id: 2,
    title: "Nutrition Workshop",
    date: "June 20, 2025",
    location: "Online Webinar",
    attendees: 145
  },
  {
    id: 3,
    title: "Yoga Retreat",
    date: "July 5-7, 2025",
    location: "Rishikesh, Uttarakhand",
    attendees: 42
  }
];

// Sample featured members
const featuredMembers = [
  {
    name: "Dr. Kavita Reddy",
    avatar: "https://i.pravatar.cc/150?img=20",
    role: "Nutrition Expert",
    posts: 87,
    followers: 1240
  },
  {
    name: "Raj Malhotra",
    avatar: "https://i.pravatar.cc/150?img=30",
    role: "Fitness Coach",
    posts: 156,
    followers: 2350
  },
  {
    name: "Sanjay Dutt",
    avatar: "https://i.pravatar.cc/150?img=33",
    role: "Transformation Specialist",
    posts: 124,
    followers: 1890
  }
];

const CommunityPage = () => {
  const { userData } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [commentText, setCommentText] = useState('');
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  // Filter posts based on search and current tab
  const filteredPosts = communityPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (currentTab === 'all') return matchesSearch;
    return matchesSearch && post.type === currentTab;
  });

  const handleLike = (postId: number) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
      toast({
        title: "Post liked!",
        description: "Your appreciation has been shared with the community.",
      });
    }
  };

  const handleComment = (postId: number) => {
    if (commentText.trim() === '') return;
    
    toast({
      title: "Comment posted!",
      description: "Your comment has been added to the discussion.",
    });
    
    setCommentText('');
    setExpandedPost(null);
  };

  const handleShare = (postId: number) => {
    toast({
      title: "Post shared!",
      description: "The post has been shared to your profile.",
    });
  };

  const handleJoinEvent = (eventId: number, eventTitle: string) => {
    toast({
      title: "Event joined!",
      description: `You've successfully registered for ${eventTitle}.`,
    });
  };

  const handleFollowMember = (memberName: string) => {
    toast({
      title: "Following!",
      description: `You are now following ${memberName}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl md:text-4xl font-heading font-bold">FitFuel Community</h1>
            <p className="text-gray-600">
              Connect, share, and grow with fitness enthusiasts across India. 
              {userData.name ? ` Welcome to the community, ${userData.name}!` : ' Join our community today!'}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Events and Featured Members */}
            <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
              {/* Upcoming Events */}
              <Card className="shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl">
                    <Calendar className="mr-2 h-5 w-5 text-fitfuel-purple" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Join our community activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.date}</p>
                      <p className="text-sm text-gray-500">{event.location}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">{event.attendees} attending</span>
                        <Button size="sm" onClick={() => handleJoinEvent(event.id, event.title)}>
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full">
                    View All Events
                  </Button>
                </CardFooter>
              </Card>

              {/* Featured Members */}
              <Card className="shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl">
                    <Users className="mr-2 h-5 w-5 text-fitfuel-purple" />
                    Featured Members
                  </CardTitle>
                  <CardDescription>Experts and active contributors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featuredMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                        <div className="flex text-xs text-gray-400 mt-1 space-x-2">
                          <span>{member.posts} posts</span>
                          <span>{member.followers} followers</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleFollowMember(member.name)}>
                        Follow
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Posts Feed */}
            <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Search community..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Tabs defaultValue="all" className="w-full md:w-2/3" value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="success-story">Success Stories</TabsTrigger>
                    <TabsTrigger value="recipe">Recipes</TabsTrigger>
                    <TabsTrigger value="workout">Workouts</TabsTrigger>
                    <TabsTrigger value="question">Questions</TabsTrigger>
                    <TabsTrigger value="event">Events</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Create Post Card */}
              <Card className="shadow-md">
                <CardContent className="pt-6">
                  <div className="flex space-x-3">
                    <Avatar>
                      <AvatarFallback>{userData.name ? userData.name.charAt(0) : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <Input 
                        placeholder={userData.name ? `What's on your mind, ${userData.name.split(' ')[0]}?` : "What's on your mind?"} 
                        onClick={() => toast({
                          description: "Post creation will be available after AI Assistant personalization."
                        })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button>Create Post</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              {filteredPosts.length > 0 ? (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="shadow-md overflow-hidden animate-fade-in">
                      {/* Post Header */}
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{post.author.name}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <span>{post.date} • {post.author.location}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {/* Post Content */}
                      <CardContent className="pb-3">
                        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                        <p className="text-gray-600 mb-4">{post.content}</p>
                        
                        {/* Post Image (if available) */}
                        {post.image && (
                          <div className="rounded-lg overflow-hidden mb-4">
                            <img 
                              src={post.image} 
                              alt={post.title} 
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Post Tags */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {post.tags.map((tag, index) => (
                            <Badge variant="secondary" key={index} className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Post Stats */}
                        <div className="flex justify-between text-xs text-gray-500 mt-3">
                          <span>{post.likes + (likedPosts.includes(post.id) ? 1 : 0)} likes</span>
                          <span>{post.comments} comments • {post.shares} shares</span>
                        </div>
                      </CardContent>
                      
                      <Separator />
                      
                      {/* Post Actions */}
                      <CardFooter className="py-2 justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`flex-1 ${likedPosts.includes(post.id) ? 'text-red-500' : ''}`}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`mr-1 h-4 w-4 ${likedPosts.includes(post.id) ? 'fill-red-500' : ''}`} />
                          Like
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        >
                          <MessageSquare className="mr-1 h-4 w-4" />
                          Comment
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleShare(post.id)}
                        >
                          <Share2 className="mr-1 h-4 w-4" />
                          Share
                        </Button>
                      </CardFooter>
                      
                      {/* Comment Input (when expanded) */}
                      {expandedPost === post.id && (
                        <div className="px-6 py-3 bg-gray-50">
                          <div className="flex space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{userData.name ? userData.name.charAt(0) : 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow flex">
                              <Input 
                                placeholder="Write a comment..." 
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="flex-grow"
                              />
                              <Button size="sm" className="ml-2" onClick={() => handleComment(post.id)}>
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-10 bg-white rounded-lg shadow-md">
                  <p className="text-gray-500">No posts found. Try adjusting your search or filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
