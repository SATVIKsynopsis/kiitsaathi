import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb,
  Code,
  Palette,
  TrendingUp,
  Users,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SkillSessions = () => {
  const navigate = useNavigate();

  const sessions = [
    {
      id: 1,
      title: "Figma Mastery Workshop",
      instructor: "Design Mentor",
      description: "Learn UI/UX design from scratch with hands-on projects",
      price: "₹299",
      duration: "3 hours",
      participants: 24,
      rating: 4.8,
      icon: Palette,
      color: "from-pink-400 to-purple-500",
      bgColor: "from-pink-50 to-purple-50"
    },
    {
      id: 2,
      title: "AI Tools for Students",
      instructor: "Tech Mentor",
      description: "Master ChatGPT, Midjourney, and other AI tools for productivity",
      price: "₹399",
      duration: "2.5 hours", 
      participants: 32,
      rating: 4.9,
      icon: Lightbulb,
      color: "from-blue-400 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      id: 3,
      title: "Excel for Career Success",
      instructor: "Business Mentor",
      description: "Advanced Excel skills that employers actually want",
      price: "₹249",
      duration: "4 hours",
      participants: 18,
      rating: 4.7,
      icon: TrendingUp,
      color: "from-green-400 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    },
    {
      id: 4,
      title: "Freelancing 101",
      instructor: "Career Mentor", 
      description: "Start your freelancing journey while still in college",
      price: "₹449",
      duration: "5 hours",
      participants: 15,
      rating: 4.8,
      icon: Code,
      color: "from-orange-400 to-red-500", 
      bgColor: "from-orange-50 to-red-50"
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
      y: -8,
      scale: 1.02
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-kiit-green-soft/20 via-white to-campus-blue/5">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-kiit-green" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Skill-Enhancing Sessions
            </h2>
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn practical skills from your peers and mentors. Because growth happens when students teach students! 🚀
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {sessions.map((session, index) => {
            const IconComponent = session.icon;
            
            return (
              <motion.div
                key={session.id}
                variants={itemVariants}
                whileHover="hover"
                custom={index}
              >
                <motion.div variants={hoverVariants}>
                  <Card className={`h-full bg-gradient-to-br ${session.bgColor} border-2 border-transparent hover:border-kiit-green/30 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${session.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                          >
                            <IconComponent className="w-6 h-6 text-white" />
                          </motion.div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-kiit-green transition-colors">
                              {session.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              by {session.instructor}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="bg-kiit-green/10 text-kiit-green border-kiit-green/20"
                        >
                          {session.price}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {session.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{session.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{session.participants} joined</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span>{session.rating}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        size="sm"
                        className="w-full bg-gradient-to-r from-kiit-green to-kiit-green-dark hover:from-kiit-green-dark hover:to-kiit-green text-white group/btn"
                        onClick={() => navigate('/skill-enhancing-sessions')}
                      >
                        <span>Join Session</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-kiit-green/5 via-white to-campus-blue/5 border-2 border-kiit-green/20 rounded-2xl">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-6 h-6 text-pink-400 animate-pulse" />
                  <h3 className="text-xl font-bold text-foreground">Want to Teach?</h3>
                  <Sparkles className="w-6 h-6 text-kiit-green animate-bounce" />
                </div>
                <p className="text-muted-foreground">
                  Share your skills with fellow students and earn while you learn!
                </p>
                <Button 
                  variant="outline"
                  className="border-kiit-green text-kiit-green hover:bg-kiit-green hover:text-white"
                  onClick={() => navigate('/skill-enhancing-sessions')}
                >
                  Become an Instructor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default SkillSessions;