import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageCircle, 
  Phone, 
  Video, 
  MapPin,
  Heart,
  Users,
  Sparkles
} from "lucide-react";

const MentorshipFeatures = () => {
  const features = [
    {
      id: "chat",
      icon: MessageCircle,
      title: "Chat Talk",
      description: "Quick text conversations with your mentors anytime, anywhere",
      color: "from-kiit-green to-kiit-green-dark",
      bgColor: "from-kiit-green/10 to-kiit-green/5",
      delay: 0.1
    },
    {
      id: "voice", 
      icon: Phone,
      title: "Voice Call",
      description: "Heart-to-heart voice conversations when you need them most", 
      color: "from-campus-blue to-campus-blue/80",
      bgColor: "from-campus-blue/10 to-campus-blue/5",
      delay: 0.2
    },
    {
      id: "video",
      icon: Video,
      title: "Video Call", 
      description: "Face-to-face mentoring sessions for deeper connections",
      color: "from-campus-purple to-campus-purple/80",
      bgColor: "from-campus-purple/10 to-campus-purple/5",
      delay: 0.3
    },
    {
      id: "meetup",
      icon: MapPin,
      title: "Physical Meetup",
      description: "In-person campus meetings because some conversations are best had in person",
      color: "from-campus-orange to-campus-orange/80", 
      bgColor: "from-campus-orange/10 to-campus-orange/5",
      delay: 0.4
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  const hoverVariants = {
    hover: {
      y: -5,
      scale: 1.02
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-white via-kiit-green-soft/30 to-campus-purple/5">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-pink-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Connect Your Way
            </h2>
            <Sparkles className="w-6 h-6 text-kiit-green" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose how you want to connect with your mentors. Every conversation is a step towards your growth! 💙
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                whileHover="hover"
                custom={index}
              >
                <motion.div variants={hoverVariants}>
                  <Card className={`h-full bg-gradient-to-br ${feature.bgColor} border-2 border-transparent hover:border-opacity-30 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl`}>
                    <CardContent className="p-6 text-center space-y-4">
                      {/* Icon with floating animation */}
                      <motion.div 
                        className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </motion.div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-foreground group-hover:text-kiit-green transition-colors">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Decorative elements */}
                      <div className="flex justify-center space-x-2 opacity-40 group-hover:opacity-70 transition-opacity">
                        <div className="w-2 h-2 rounded-full bg-kiit-green animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-campus-blue animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-campus-purple animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-kiit-green" />
                <span className="text-3xl font-bold text-kiit-green">200+</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Mentors</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="text-3xl font-bold text-kiit-green">1,000+</span>
              </div>
              <p className="text-sm text-muted-foreground">Happy Connections</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-campus-purple" />
                <span className="text-3xl font-bold text-kiit-green">95%</span>
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipFeatures;