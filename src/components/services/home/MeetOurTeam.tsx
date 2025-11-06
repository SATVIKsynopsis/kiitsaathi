import React, { useState } from "react";
import { Linkedin, Instagram, Github } from "lucide-react";
import { teamData } from "@/data/team.js";
import { error } from "console";

interface TeamMember {
  id?: number;
  name: string;
  role?: string;
  Image?: string;
  LinkedIn?: string;
  Instagram?: string;
  Github?: string;
}

const TeamCard = ({ member }: { member: TeamMember }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="[perspective:1000px] h-72 sm:h-80">
      <div
        className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500 ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        onTouchStart={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT FACE */}
        <div className="hover:cursor-pointer hover:kiit-green-soft absolute inset-0 [backface-visibility:hidden] rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg">
          <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6">
            {/* Image */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-3 sm:mb-4 bg-gray-200">
              {!imageError && member.Image ? (
                <img
                  src={member.Image}
                  alt={member.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-400">
                  <span className="text-white text-4xl font-bold">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Member info */}
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 text-center">
              {member.name}
            </h3>
            
          </div>
        </div>

        {/* BACK FACE */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl sm:rounded-2xl bg-kiit-green-light overflow-hidden shadow-lg shadow-kiit-green-dark">
          <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-white">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-3 sm:mb-4 bg-gray-200">
              {!imageError && member.Image ? (
                <img
                  src={member.Image}
                  alt={member.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover border border-gray-300 rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-400">
                  <span className="text-white text-4xl font-bold">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{member.name}</h3>
            {member.role && (
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 opacity-90">{member.role}</p>
            )}
            
            {/* Social Icons */}
            <div className="flex space-x-4 sm:space-x-6">
              {member.LinkedIn && (
                <a
                  href={member.LinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-125 transition-transform duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white hover:text-blue-200" />
                </a>
              )}
              {member.Instagram && (
                <a
                  href={member.Instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-125 transition-transform duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white hover:text-pink-200" />
                </a>
              )}
              
              {member.Github && (
                <a
                  href={member.Github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-125 transition-transform duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white hover:text-gray-200" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MeetOurTeam: React.FC = () => {
  const teamMembers: TeamMember[] = teamData;

  const rows = [
    teamMembers.slice(0, 4),
    teamMembers.slice(4, 8),
    teamMembers.slice(8, 12),
    teamMembers.slice(12, 16),
    teamMembers.slice(16, 17),
  ];

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-pink-200/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto">
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Heading */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent px-4">
              Meet Our Team          </h2>
            <p className="text-muted-foreground text-base sm:text-lg italic px-4">
              Helping you connect with the best.
            </p>
          </div>
        </div>

          {/* Team Grid */}
          <div className="space-y-6 sm:space-y-8">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`grid gap-4 sm:gap-6 ${rowIndex === 4
                    ? "grid-cols-1 max-w-xs mx-auto"
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  }`}
              >
                {row.map((member, index) => (
                  <TeamCard key={index} member={member} />
                ))}
              </div>
            ))}
          </div>
        </div>
    </section>
  );
};

export default MeetOurTeam;