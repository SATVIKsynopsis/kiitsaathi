import React, { useState } from "react";
import { Linkedin, Instagram, Github } from "lucide-react";
import { teamData } from "@/data/team.js";

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
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="relative h-80 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col items-center justify-center h-full p-6">
        {/* Image with hover overlay */}
        <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 bg-gray-200">
          {!imageError && member.Image ? (
            <img
              src={member.Image}
              alt={member.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-400">
              <span className="text-white text-4xl font-bold">
                {member.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Hover overlay with social icons */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex space-x-4" onClick={(e) => e.stopPropagation()}>
              {member.LinkedIn && (
                <a
                  href={member.LinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-110 transition-transform duration-200"
                >
                  <Linkedin className="w-7 h-7 text-white hover:text-blue-400" />
                </a>
              )}
              {member.Instagram && (
                <a
                  href={member.Instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-110 transition-transform duration-200"
                >
                  <Instagram className="w-7 h-7 text-white hover:text-pink-400" />
                </a>
              )}
              {member.Github && (
                <a
                  href={member.Github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-110 transition-transform duration-200"
                >
                  <Github className="w-7 h-7 text-white hover:text-gray-300" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Member info */}
        <h3 className="text-xl font-semibold text-gray-800 text-center">
          {member.name}
        </h3>
        {member.role && (
          <p className="text-sm text-gray-600 text-center mt-1">{member.role}</p>
        )}
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
    <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The passionate individuals building the future of campus life at KIIT
          </p>
        </div>

        {/* Team Grid */}
        <div className="space-y-8">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid gap-6 ${
                rowIndex === 4
                  ? "grid-cols-1 max-w-xs mx-auto"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
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