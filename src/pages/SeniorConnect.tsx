import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Users, 
  Heart,
  Sparkles,
  ArrowLeft,
  Star,
  Quote,
  MessageCircle
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import SeniorCard from "@/components/SeniorCard";
import MentorshipFeatures from "@/components/MentorshipFeatures";
import SkillSessions from "@/components/SkillSessions";
import { DemoNameSelector } from "@/components/DemoNameSelector";
import { ChatInterface } from "@/components/ChatInterface";
import { useSeniorConnect } from "@/hooks/useSeniorConnect";
import { useAuth } from "@/hooks/useAuth";
import { seniors } from "@/data/seniors";

const SeniorConnect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isLoading,
    availableDemoNames,
    currentSession,
    messages,
    startChatSession,
    sendMessage,
    endChatSession
  } = useSeniorConnect();
  
  const [currentView, setCurrentView] = useState<'landing' | 'nameSelection' | 'chat'>('landing');
  const [selectedDemoName, setSelectedDemoName] = useState<string>('');

  const handleStartChat = () => {
    if (!user) {
      navigate('/auth?redirect=/senior-connect');
      return;
    }
    setCurrentView('nameSelection');
  };

  const handleNameSelected = (name: string) => {
    setSelectedDemoName(name);
    setCurrentView('chat');
    // In a real app, you'd select a mentor/senior to chat with
    // For now, we'll simulate starting a session
  };

  const handleEndChat = async () => {
    if (currentSession) {
      await endChatSession(currentSession.id);
    }
    setCurrentView('landing');
    setSelectedDemoName('');
  };

  const handleSendMessage = async (message: string) => {
    if (currentSession) {
      return await sendMessage(currentSession.id, message);
    }
    return false;
  };

  // Show chat interface
  if (currentView === 'chat' && currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-kiit-green-soft/30 to-campus-blue/5 p-4">
        <Navbar />
        <div className="container mx-auto pt-20">
          <ChatInterface
            session={currentSession}
            messages={messages}
            onSendMessage={handleSendMessage}
            onEndSession={handleEndChat}
            isLoading={isLoading}
            demoName={selectedDemoName}
          />
        </div>
      </div>
    );
  }

  // Show demo name selection
  if (currentView === 'nameSelection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-kiit-green-soft/30 to-campus-blue/5 p-4">
        <Navbar />
        <div className="container mx-auto pt-20">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <DemoNameSelector
            demoNames={availableDemoNames}
            onSelect={handleNameSelected}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  // Floating doodles for background decoration
  const FloatingDoodle = ({ children, className = "" }) => (
    <motion.div
      className={`absolute opacity-20 ${className}`}
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-kiit-green-soft/30 to-campus-blue/5 relative overflow-hidden">
      {/* Floating Background Doodles */}
      <FloatingDoodle className="top-20 left-10">
        <Heart className="w-8 h-8 text-pink-300" />
      </FloatingDoodle>
      <FloatingDoodle className="top-40 right-20">
        <Sparkles className="w-6 h-6 text-kiit-green" />
      </FloatingDoodle>
      <FloatingDoodle className="bottom-40 left-1/4">
        <GraduationCap className="w-10 h-10 text-campus-blue" />
      </FloatingDoodle>
      <FloatingDoodle className="bottom-20 right-1/3">
        <Users className="w-8 h-8 text-campus-purple" />
      </FloatingDoodle>

      {/* Back to Home Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-kiit-green hover:text-kiit-green-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
      
      <Navbar />
      
      {/* Hero Section - Redesigned with warmth */}
      <section className="pt-24 pb-16 px-4 relative">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex justify-center items-center gap-4 mb-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-12 h-12 text-pink-400" />
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold text-gradient text-center">
                  Senior Connect
                </h1>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-12 h-12 text-kiit-green" />
                </motion.div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-semibold text-kiit-green-dark">
                Your Mentors, Always Here 💙
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Connect with caring seniors through secure online chats. Get real advice, emotional support, and guidance — all while protecting your privacy with demo names.
                <span className="font-semibold text-purple-600 block mt-2">
                  🔒 Only online connections • No personal info shared • AI-monitored for safety
                </span>
              </p>

              {/* Illustration Placeholder - Hand-drawn style */}
              <motion.div 
                className="relative w-80 h-80 mx-auto my-12"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-kiit-green-light/20 via-campus-blue/20 to-campus-purple/20 rounded-full flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-4 bg-gradient-to-br from-white/40 to-white/10 rounded-full"
                  />
                  <div className="relative z-10 text-center">
                    <Users className="w-20 h-20 text-kiit-green mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground font-medium">
                      Students helping Students
                    </p>
                  </div>
                  
                  {/* Floating mini hearts */}
                  <motion.div
                    className="absolute top-8 left-8"
                    animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  >
                    <Heart className="w-6 h-6 text-pink-300" />
                  </motion.div>
                  <motion.div
                    className="absolute bottom-8 right-8"
                    animate={{ y: [0, -8, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    <Sparkles className="w-5 h-5 text-kiit-green" />
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  onClick={handleStartChat}
                  className="bg-gradient-to-r from-kiit-green to-campus-blue hover:from-kiit-green-dark hover:to-campus-blue text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Start Online Chat
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  🌐 Online chats only - Safe, private, and secure
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mentorship Features Section */}
      <MentorshipFeatures />

      {/* Senior Profiles Grid */}
      <section id="mentors-section" className="py-16 px-4 bg-gradient-to-br from-white via-kiit-green-soft/10 to-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-6 h-6 text-kiit-green" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Meet Your Mentors
              </h2>
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real students who've been in your shoes. They're here to guide, support, and cheer you on! 🌟
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {seniors.map((senior, index) => (
              <motion.div
                key={senior.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <SeniorCard senior={senior} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Skill Sessions Section */}
      <SkillSessions />

      {/* Emotional Testimonial Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-center gap-4">
                <Heart className="w-12 h-12 text-pink-400 animate-pulse" />
                <Quote className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <blockquote className="text-2xl md:text-3xl italic text-foreground font-medium leading-relaxed">
                "I was totally lost in my first semester. One chat with my senior helped me feel like I belong here. Now I'm paying it forward!" 
              </blockquote>
              
              <div className="space-y-2">
                <p className="text-muted-foreground text-lg">— Anonymous 2nd Year CSE Student</p>
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
            >
              <div className="space-y-2">
                <div className="text-4xl font-bold text-kiit-green">1,000+</div>
                <div className="text-sm text-muted-foreground">Meaningful Connections</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-kiit-green">200+</div>
                <div className="text-sm text-muted-foreground">Caring Mentors</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-kiit-green">95%</div>
                <div className="text-sm text-muted-foreground">Feel More Confident</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer with Love */}
      <section className="py-12 px-4 bg-gradient-to-r from-kiit-green-soft/20 to-campus-blue/10">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-8 h-8 text-pink-400 animate-pulse" />
              <h3 className="text-2xl font-bold text-foreground">
                Built by Students, for Students — With Love
              </h3>
              <Sparkles className="w-8 h-8 text-kiit-green animate-bounce" />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Because every student deserves someone in their corner. You're not alone in this journey! 💙
            </p>
          </motion.div>
        </div>
      </section>
    
      <Footer />
    </div>
  );
};

export default SeniorConnect;
