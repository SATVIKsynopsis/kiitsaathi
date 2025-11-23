import React from 'react';
import { ExternalLink, Instagram, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SocietyCardProps {
  name: string;
  description: string;
  memberCount: string;
  upcomingEvent: string;
  website?: string;
  instagram: string;
  logoPlaceholder: string;
  variant: 'fedkiit' | 'ecell' | 'usc';
}

const SocietyCard: React.FC<SocietyCardProps> = ({
  name,
  description,
  memberCount,
  upcomingEvent,
  website,
  instagram,
  logoPlaceholder,
  variant
}) => {
  const getCardClasses = () => {
    switch (variant) {
      case 'fedkiit':
        return {
          card: "bg-gradient-to-br from-fedkiit-green to-fedkiit-green/80 text-white hover:shadow-fedkiit-light-grey/50",
          button: "bg-fedkiit-black/20 hover:bg-fedkiit-black/30 text-white border-white/20",
          eventBox: "bg-white/20 border-white/30 text-white backdrop-blur-sm",
          font: "font-inter"
        };
      case 'ecell':
        return {
          card: "bg-ecell-black text-ecell-white hover:shadow-ecell-cyan/50 border-ecell-cyan/20",
          button: "bg-ecell-cyan hover:bg-ecell-cyan/80 text-ecell-black",
          eventBox: "bg-ecell-cyan/20 border-ecell-cyan/50 text-ecell-cyan backdrop-blur-sm",
          font: "font-inter"
        };
      case 'usc':
        return {
          card: "bg-gradient-to-br from-usc-white to-usc-white/95 text-usc-black hover:shadow-usc-orange/30 border-usc-maroon/20",
          button: "bg-usc-orange hover:bg-usc-orange/80 text-white",
          eventBox: "bg-usc-orange/10 border-usc-orange/30 text-usc-maroon backdrop-blur-sm",
          font: "font-poppins"
        };
      default:
        return {
          card: "",
          button: "",
          eventBox: "",
          font: ""
        };
    }
  };

  const styles = getCardClasses();

  const handleWebsiteClick = () => {
    if (website) {
      window.open(website, '_blank');
    }
  };

  const handleInstagramClick = () => {
    window.open(instagram, '_blank');
  };

  const handleEventClick = () => {
    if (website) {
      window.open(website, '_blank');
    }
  };

  return (
    <Card className={`
      ${styles.card} ${styles.font}
      group relative overflow-hidden rounded-2xl border-2 
      transition-all duration-300 hover:scale-105 hover:shadow-2xl
      cursor-pointer h-full
    `}>
      <CardHeader className="relative p-6 pb-4">
        {/* Logo Placeholder */}
        <div className="absolute top-4 left-4 w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-sm font-semibold">
          {logoPlaceholder}
        </div>
        
        {/* Instagram Icon */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleInstagramClick}
            className={`h-8 w-8 ${styles.button} hover:scale-110 transition-all duration-200`}
          >
            <Instagram className="h-4 w-4" />
          </Button>
        </div>

        {/* Society Name */}
        <div className="mt-8 mb-4">
          <h3 
            onClick={handleWebsiteClick}
            className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity duration-200"
          >
            {name}
          </h3>
        </div>

        {/* Member Count */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 opacity-80" />
          <span className="text-sm opacity-90">{memberCount}</span>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        {/* Upcoming Event Box */}
        <div 
          onClick={handleEventClick}
          className={`
            ${styles.eventBox}
            p-4 rounded-xl border-2 mb-4 cursor-pointer
            hover:scale-[1.02] transition-all duration-200
            shadow-lg hover:shadow-xl
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-semibold">Upcoming Event</span>
          </div>
          <p className="text-sm font-medium">{upcomingEvent}</p>
        </div>

        {/* Society Description - Expands on Hover */}
        <div className={`
          max-h-0 overflow-hidden group-hover:max-h-32 
          transition-all duration-500 ease-in-out
          opacity-0 group-hover:opacity-100
        `}>
          <div className="pt-2 border-t border-current/20">
            <p className="text-sm leading-relaxed opacity-90">
              {description}
            </p>
          </div>
        </div>

        {/* Website Link Button */}
        {website && (
          <div className="mt-4 pt-4 border-t border-current/20">
            <Button
              onClick={handleWebsiteClick}
              className={`
                ${styles.button}
                w-full hover:scale-[1.02] transition-all duration-200
                flex items-center gap-2
              `}
            >
              <ExternalLink className="h-4 w-4" />
              Visit Website
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Pre-configured Society Cards
export const FedKIITCard: React.FC = () => (
  <SocietyCard
    name="Fed KIIT"
    description="Fostering innovation and development through hackathons, workshops, and tech-driven projects."
    memberCount="500+ Active Members"
    upcomingEvent="Tech Innovation Summit 2024"
    website="https://www.fedkiit.com/"
    instagram="https://www.instagram.com/fedkiit/?hl=en"
    logoPlaceholder="FK"
    variant="fedkiit"
  />
);

export const KIITECellCard: React.FC = () => (
  <SocietyCard
    name="KIIT E-Cell"
    description="Promoting entrepreneurship through mentorship, startup incubations, and networking."
    memberCount="300+ Members"
    upcomingEvent="Startup Pitch Competition"
    website="https://www.kiitecell.org/"
    instagram="https://www.instagram.com/ecell_kiit/?hl=en"
    logoPlaceholder="EC"
    variant="ecell"
  />
);

export const USCKIITCard: React.FC = () => (
  <SocietyCard
    name="USC KIIT"
    description="Uniting students across cultures with leadership programs, global events, and community initiatives."
    memberCount="200+ Members"
    upcomingEvent="Cultural Leadership Workshop"
    instagram="https://www.instagram.com/usc.kiit/?hl=en"
    logoPlaceholder="USC"
    variant="usc"
  />
);

export { SocietyCard };