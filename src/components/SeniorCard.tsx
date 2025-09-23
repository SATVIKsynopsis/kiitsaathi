import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Phone, 
  Video, 
  MapPin, 
  Star, 
  Clock,
  Heart,
  Users,
  GraduationCap
} from "lucide-react";
import { Senior } from "@/data/seniors";

interface SeniorCardProps {
  senior: Senior;
}

const SeniorCard: React.FC<SeniorCardProps> = ({ senior }) => {
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showMeetupModal, setShowMeetupModal] = useState(false);

  const cardVariants = {
    hover: {
      y: -8,
      scale: 1.02
    }
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="group"
      >
        <Card className="h-full bg-gradient-to-br from-white via-kiit-green-soft/20 to-campus-purple/10 border-2 border-transparent hover:border-kiit-green/30 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0">
            {/* Profile Header */}
            <div className="relative bg-gradient-to-br from-kiit-green-light/20 to-campus-blue/20 p-6 text-center">
              {/* Floating Doodles */}
              <div className="absolute top-2 right-2 opacity-30">
                <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
              </div>
              <div className="absolute bottom-2 left-2 opacity-30">
                <GraduationCap className="w-4 h-4 text-kiit-green animate-bounce" />
              </div>

              <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-white/50 shadow-lg">
                <AvatarImage 
                  src={senior.profileImage} 
                  alt={`Mentor ${senior.mentorCode}`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-kiit-green to-campus-blue text-white text-xl font-bold">
                  {senior.mentorCode}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">
                  {senior.mentorCode}
                </h3>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {senior.branch} • {senior.year}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Mentorship Tags */}
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {senior.mentorshipTags.map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="text-xs bg-gradient-to-r from-kiit-green/10 to-campus-blue/10 border-kiit-green/30 text-kiit-green-dark hover:bg-kiit-green/20 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground text-center italic leading-relaxed">
                "{senior.bio}"
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-4 py-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="font-medium">{senior.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3 text-kiit-green" />
                  <span>{senior.totalSessions} helped</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 text-campus-blue" />
                  <span>{senior.availability}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowChatModal(true)}
                  className="bg-gradient-to-r from-kiit-green/10 to-transparent border-kiit-green/30 hover:bg-kiit-green/20 hover:border-kiit-green text-kiit-green-dark group/btn"
                >
                  <MessageCircle className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                  Chat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCallModal(true)}
                  className="bg-gradient-to-r from-campus-blue/10 to-transparent border-campus-blue/30 hover:bg-campus-blue/20 hover:border-campus-blue text-campus-blue group/btn"
                >
                  <Phone className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                  Call
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowVideoModal(true)}
                  className="bg-gradient-to-r from-campus-purple/10 to-transparent border-campus-purple/30 hover:bg-campus-purple/20 hover:border-campus-purple text-campus-purple group/btn"
                >
                  <Video className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                  Video
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMeetupModal(true)}
                  className="bg-gradient-to-r from-campus-orange/10 to-transparent border-campus-orange/30 hover:bg-campus-orange/20 hover:border-campus-orange text-campus-orange group/btn"
                >
                  <MapPin className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                  Meet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-kiit-green" />
              Chat with {senior.mentorCode}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-kiit-green-soft to-white rounded-xl">
              <Heart className="w-12 h-12 mx-auto mb-3 text-pink-400" />
              <p className="text-sm text-muted-foreground">
                Chat feature is coming soon! 💬<br />
                Your mentor will be notified and will reach out to you shortly.
              </p>
            </div>
            <Button className="w-full bg-kiit-green hover:bg-kiit-green-dark">
              Start Conversation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Voice Call Modal */}
      <Dialog open={showCallModal} onOpenChange={setShowCallModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-campus-blue" />
              Voice Call with {senior.mentorCode}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-campus-blue/10 to-white rounded-xl">
              <Phone className="w-12 h-12 mx-auto mb-3 text-campus-blue animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Voice call feature is coming soon! 📞<br />
                You'll be able to have heart-to-heart conversations with your mentors.
              </p>
            </div>
            <Button className="w-full bg-campus-blue hover:bg-campus-blue/80">
              Schedule Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Call Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-campus-purple" />
              Video Call with {senior.mentorCode}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-campus-purple/10 to-white rounded-xl">
              <Video className="w-12 h-12 mx-auto mb-3 text-campus-purple animate-bounce" />
              <p className="text-sm text-muted-foreground">
                Video call feature is coming soon! 🎥<br />
                Face-to-face mentoring sessions will be available shortly.
              </p>
            </div>
            <Button className="w-full bg-campus-purple hover:bg-campus-purple/80">
              Schedule Video Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Physical Meetup Modal */}
      <Dialog open={showMeetupModal} onOpenChange={setShowMeetupModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-campus-orange" />
              Meetup with {senior.mentorCode}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-campus-orange/10 to-white rounded-xl">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-campus-orange animate-float" />
              <p className="text-sm text-muted-foreground">
                Physical meetup booking is coming soon! 🤝<br />
                You'll be able to meet your mentors in person on campus.
              </p>
            </div>
            <Button className="w-full bg-campus-orange hover:bg-campus-orange/80">
              Request Meetup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SeniorCard;