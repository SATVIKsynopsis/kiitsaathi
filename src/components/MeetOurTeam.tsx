import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Linkedin, Instagram, Github } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  images: {
    center: string;
    north: string;
    northeast: string;
    east: string;
    southeast: string;
    south: string;
    southwest: string;
    west: string;
    northwest: string;
  };
  linkedin?: string;
  instagram?: string;
  github?: string;
}

// Team data with 9 directional face images for cursor tracking
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Aditya Sharma",
    role: "Founder & Coordinator",
    images: {
      center: "/team/member-1-center.png",
      north: "/team/member-1-north.png",
      northeast: "/team/member-1-northeast.png",
      east: "/team/member-1-east.png",
      southeast: "/team/member-1-southeast.png",
      south: "/team/member-1-south.png",
      southwest: "/team/member-1-southwest.png",
      west: "/team/member-1-west.png",
      northwest: "/team/member-1-northwest.png",
    },
    linkedin: "https://www.linkedin.com/in/aditya-sharma-757886269/",
    instagram: "https://www.instagram.com/aditya_sharma3805?igsh=bmpzeGVuYXJvbDdt&utm_source=qr",
    github: "#",
  },
  {
    id: 2,
    name: "Anushka Gupta",
    role: "Marketing Lead",
    images: {
      center: "/team/member-2-center.png",
      north: "/team/member-2-north.png",
      northeast: "/team/member-2-northeast.png",
      east: "/team/member-2-east.png",
      southeast: "/team/member-2-southeast.png",
      south: "/team/member-2-south.png",
      southwest: "/team/member-2-southwest.png",
      west: "/team/member-2-west.png",
      northwest: "/team/member-2-northwest.png",
    },
    linkedin:
      "https://www.linkedin.com/in/anushka-gupta-4a366b2b6?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    instagram: "https://www.instagram.com/momsaid_noname?igsh=MWxpaTg3ajNpeXUycg==",
    github: "#",
  },
  {
    id: 3,
    name: "Prajjwal Patel",
    role: "Operations",
    images: {
      center: "/team/member-3-center.png",
      north: "/team/member-3-north.png",
      northeast: "/team/member-3-northeast.png",
      east: "/team/member-3-east.png",
      southeast: "/team/member-3-southeast.png",
      south: "/team/member-3-south.png",
      southwest: "/team/member-3-southwest.png",
      west: "/team/member-3-west.png",
      northwest: "/team/member-3-northwest.png",
    },
    linkedin: "https://www.linkedin.com/in/prajjwal-patel-5642b7318/",
    instagram: "#",
    github: "https://github.com/prajj267",
  },
  {
    id: 4,
    name: "Piyush Kumar Swain",
    role: "Operations",
    images: {
      center: "/team/member-4-center.png",
      north: "/team/member-4-north.png",
      northeast: "/team/member-4-northeast.png",
      east: "/team/member-4-east.png",
      southeast: "/team/member-4-southeast.png",
      south: "/team/member-4-south.png",
      southwest: "/team/member-4-southwest.png",
      west: "/team/member-4-west.png",
      northwest: "/team/member-4-northwest.png",
    },
    linkedin: "#",
    instagram: "https://www.instagram.com/mr_piyush2106",
    github: "#",
  },
  {
    id: 5,
    name: "Prangshu",
    role: "Web Developer",
    images: {
      center: "/team/member-5-center.png",
      north: "/team/member-5-north.png",
      northeast: "/team/member-5-northeast.png",
      east: "/team/member-5-east.png",
      southeast: "/team/member-5-southeast.png",
      south: "/team/member-5-south.png",
      southwest: "/team/member-5-southwest.png",
      west: "/team/member-5-west.png",
      northwest: "/team/member-5-northwest.png",
    },
    linkedin: "https://www.linkedin.com/in/prangggshu",
    instagram: "https://www.instagram.com/prangggshu",
    github: "https://github.com/prangggshu",
  },
  {
    id: 6,
    name: "Krishna",
    role: "Web Developer",
    images: {
      center: "/team/member-6-center.png",
      north: "/team/member-6-north.png",
      northeast: "/team/member-6-northeast.png",
      east: "/team/member-6-east.png",
      southeast: "/team/member-6-southeast.png",
      south: "/team/member-6-south.png",
      southwest: "/team/member-6-southwest.png",
      west: "/team/member-6-west.png",
      northwest: "/team/member-6-northwest.png",
    },
    linkedin: "http://www.linkedin.com/in/krishna-mohanty-67a9082b0",
    instagram: "https://www.instagram.com/_krish_na08?igsh=MTlhMXY4cXJ4cm1weA==",
    github: "https://github.com/KrishnaMohanty08?tab=repositories",
  },
  {
    id: 7,
    name: "Satvik",
    role: "Web Developer",
    images: {
      center: "/team/member-7-center.png",
      north: "/team/member-7-north.png",
      northeast: "/team/member-7-northeast.png",
      east: "/team/member-7-east.png",
      southeast: "/team/member-7-southeast.png",
      south: "/team/member-7-south.png",
      southwest: "/team/member-7-southwest.png",
      west: "/team/member-7-west.png",
      northwest: "/team/member-7-northwest.png",
    },
    linkedin: "https://www.linkedin.com/in/satvik-upadhyaya-073978334/",
    instagram: "https://www.instagram.com/being_shelbish1422?igsh=djhhOWUybG03N3c5",
    github: "https://github.com/SATVIKsynopsis",
  },
  {
    id: 8,
    name: "Aadarsh Gupta",
    role: "Graphic Designer",
    images: {
      center: "/team/member-8-center.png",
      north: "/team/member-8-north.png",
      northeast: "/team/member-8-northeast.png",
      east: "/team/member-8-east.png",
      southeast: "/team/member-8-southeast.png",
      south: "/team/member-8-south.png",
      southwest: "/team/member-8-southwest.png",
      west: "/team/member-8-west.png",
      northwest: "/team/member-8-northwest.png",
    },
    linkedin:
      "https://www.linkedin.com/in/aadarshgupta01?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    instagram: "https://www.instagram.com/aadarsh._.gupta01?igsh=MTdzcTM0dmxkZW1iOA==",
    github: "#",
  },
  {
    id: 9,
    name: "Anushka Sinha",
    role: "Graphic Designer",
    images: {
      center: "/team/member-9-center.png",
      north: "/team/member-9-north.png",
      northeast: "/team/member-9-northeast.png",
      east: "/team/member-9-east.png",
      southeast: "/team/member-9-southeast.png",
      south: "/team/member-9-south.png",
      southwest: "/team/member-9-southwest.png",
      west: "/team/member-9-west.png",
      northwest: "/team/member-9-northwest.png",
    },
    linkedin: "https://www.linkedin.com/in/anushka-sinha510/",
    instagram: "https://www.instagram.com/its_ansukaaa04/",
    github: "#",
  },
  {
    id: 10,
    name: "Aditi Srivastava",
    role: "Graphic Designer",
    images: {
      center: "/team/member-10-center.png",
      north: "/team/member-10-north.png",
      northeast: "/team/member-10-northeast.png",
      east: "/team/member-10-east.png",
      southeast: "/team/member-10-southeast.png",
      south: "/team/member-10-south.png",
      southwest: "/team/member-10-southwest.png",
      west: "/team/member-10-west.png",
      northwest: "/team/member-10-northwest.png",
    },
    linkedin: "#",
    instagram: "#",
    github: "#",
  },
  {
    id: 11,
    name: "Siddharth khubchandani",
    role: "Video Editor",
    images: {
      center: "/team/member-11-center.png",
      north: "/team/member-11-north.png",
      northeast: "/team/member-11-northeast.png",
      east: "/team/member-11-east.png",
      southeast: "/team/member-11-southeast.png",
      south: "/team/member-11-south.png",
      southwest: "/team/member-11-southwest.png",
      west: "/team/member-11-west.png",
      northwest: "/team/member-11-northwest.png",
    },
    linkedin:
      "https://www.linkedin.com/in/siddharth-khubchandani-4aa898389?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    instagram: "https://www.instagram.com/siddharth.khubchandani?igsh=bXAwODV4Z3BmMGxj",
    github: "#",
  },
  {
    id: 12,
    name: "Vedant Agrawal",
    role: "Video Editor",
    images: {
      center: "/team/member-12-center.png",
      north: "/team/member-12-north.png",
      northeast: "/team/member-12-northeast.png",
      east: "/team/member-12-east.png",
      southeast: "/team/member-12-southeast.png",
      south: "/team/member-12-south.png",
      southwest: "/team/member-12-southwest.png",
      west: "/team/member-12-west.png",
      northwest: "/team/member-12-northwest.png",
    },
    linkedin:
      "https://www.linkedin.com/in/vedant-agrawal-946353325?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    instagram: "https://www.instagram.com/agrawal_vedant_16?igsh=bTFzZG4zcHd3MmY2",
    github: "#",
  },
  {
    id: 13,
    name: "Smit Bharat Patil",
    role: "Marketing",
    images: {
      center: "/team/member-13-center.png",
      north: "/team/member-13-north.png",
      northeast: "/team/member-13-northeast.png",
      east: "/team/member-13-east.png",
      southeast: "/team/member-13-southeast.png",
      south: "/team/member-13-south.png",
      southwest: "/team/member-13-southwest.png",
      west: "/team/member-13-west.png",
      northwest: "/team/member-13-northwest.png",
    },
    linkedin: "https://www.linkedin.com/in/sbktckp/",
    instagram: "https://www.instagram.com/sbktckp",
    github: "https://github.com/sbktckp",
  },
  {
    id: 14,
    name: "Kirti Kumari",
    role: "Marketing",
    images: {
      center: "/team/member-14-center.png",
      north: "/team/member-14-north.png",
      northeast: "/team/member-14-northeast.png",
      east: "/team/member-14-east.png",
      southeast: "/team/member-14-southeast.png",
      south: "/team/member-14-south.png",
      southwest: "/team/member-14-southwest.png",
      west: "/team/member-14-west.png",
      northwest: "/team/member-14-northwest.png",
    },
    linkedin:
      "https://www.linkedin.com/in/kirti-kumari-246582321?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    instagram: "https://www.instagram.com/cocokirti?igsh=NHBkaHRxd2E3bGRn&utm_source=qr",
    github: "#",
  },
  {
    id: 15,
    name: "Shree",
    role: "Marketing",
    images: {
      center: "/team/member-15-center.png",
      north: "/team/member-15-north.png",
      northeast: "/team/member-15-northeast.png",
      east: "/team/member-15-east.png",
      southeast: "/team/member-15-southeast.png",
      south: "/team/member-15-south.png",
      southwest: "/team/member-15-southwest.png",
      west: "/team/member-15-west.png",
      northwest: "/team/member-15-northwest.png",
    },
    linkedin: "#",
    instagram: "#",
    github: "#",
  },
  {
    id: 16,
    name: "Diya",
    role: "Marketing",
    images: {
      center: "/team/member-16-center.png",
      north: "/team/member-16-north.png",
      northeast: "/team/member-16-northeast.png",
      east: "/team/member-16-east.png",
      southeast: "/team/member-16-southeast.png",
      south: "/team/member-16-south.png",
      southwest: "/team/member-16-southwest.png",
      west: "/team/member-16-west.png",
      northwest: "/team/member-16-northwest.png",
    },
    linkedin: "http://www.linkedin.com/in/diya-dasgupta-747b2a261",
    instagram: "https://www.instagram.com/hester.05?igsh=NWJ2ejJpYTdvam8w",
    github: "#",
  },
  {
    id: 17,
    name: "Shreyansh Duggar",
    role: "Marketing",
    images: {
      center: "/team/member-17-center.png",
      north: "/team/member-17-north.png",
      northeast: "/team/member-17-northeast.png",
      east: "/team/member-17-east.png",
      southeast: "/team/member-17-southeast.png",
      south: "/team/member-17-south.png",
      southwest: "/team/member-17-southwest.png",
      west: "/team/member-17-west.png",
      northwest: "/team/member-17-northwest.png",
    },
    linkedin:
      "https://www.linkedin.com/in/shreyanshduggar01?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    instagram: "https://www.instagram.com/shreyans.h1?igsh=ajMwNTM1NG51aDdv",
    github: "https://github.com/shr4421",
  },
];

const TeamCard: React.FC<{ member: TeamMember; mousePosition: { x: number; y: number } }> = ({
  member,
  mousePosition,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [faceDirection, setFaceDirection] = useState("center");

  useEffect(() => {
    if (!cardRef.current || isFlipped) return;

    const card = cardRef.current.getBoundingClientRect();
    const cardCenterX = card.left + card.width / 2;
    const cardCenterY = card.top + card.height / 2;

    const deltaX = mousePosition.x - cardCenterX;
    const deltaY = mousePosition.y - cardCenterY;

    // Calculate angle and distance
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Only track if cursor is reasonably close (within 500px)
    if (distance > 500) {
      setFaceDirection("center");
      return;
    }

    // Determine direction based on angle
    let direction = "center";
    if (angle >= -22.5 && angle < 22.5) direction = "east";
    else if (angle >= 22.5 && angle < 67.5) direction = "southeast";
    else if (angle >= 67.5 && angle < 112.5) direction = "south";
    else if (angle >= 112.5 && angle < 157.5) direction = "southwest";
    else if (angle >= 157.5 || angle < -157.5) direction = "west";
    else if (angle >= -157.5 && angle < -112.5) direction = "northwest";
    else if (angle >= -112.5 && angle < -67.5) direction = "north";
    else if (angle >= -67.5 && angle < -22.5) direction = "northeast";

    setFaceDirection(direction);
  }, [mousePosition, isFlipped]);

  // Get the appropriate face image based on cursor direction
  const getFaceImage = () => {
    switch (faceDirection) {
      case "north":
        return member.images.north;
      case "northeast":
        return member.images.northeast;
      case "east":
        return member.images.east;
      case "southeast":
        return member.images.southeast;
      case "south":
        return member.images.south;
      case "southwest":
        return member.images.southwest;
      case "west":
        return member.images.west;
      case "northwest":
        return member.images.northwest;
      default:
        return member.images.center;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative h-72 cursor-pointer perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden bg-card border border-border shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="w-36 h-36 rounded-full overflow-hidden mb-3 bg-muted">
              <motion.img
                key={faceDirection}
                src={getFaceImage()}
                alt={member.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center">{member.name}</h3>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="w-36 h-36 rounded-full overflow-hidden mb-3 bg-primary/20">
              <img src={member.images.center} alt={member.name} className="w-full h-full object-cover opacity-70" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1 text-center">{member.name}</h3>
            <p className="text-sm text-primary font-medium mb-3 text-center">{member.role}</p>
            <div className="flex gap-4">
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="w-5 h-5 text-primary" />
                </a>
              )}
              {member.instagram && (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="w-5 h-5 text-primary" />
                </a>
              )}
              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="w-5 h-5 text-primary" />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hover Glow Effect */}
      {isFlipped && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            boxShadow: "0 0 30px hsla(var(--primary) / 0.4)",
          }}
        />
      )}
    </motion.div>
  );
};

export const MeetOurTeam: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Split into rows: 4, 4, 4, 4, 1
  const rows = [
    teamMembers.slice(0, 4),
    teamMembers.slice(4, 8),
    teamMembers.slice(8, 12),
    teamMembers.slice(12, 16),
    teamMembers.slice(16, 17),
  ];

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-kiit-primary/5 via-background to-kiit-secondary/5">
        {/* Abstract Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kiit-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-kiit-primary to-secondary bg-clip-text text-transparent">
            Meet Our Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The passionate individuals building the future of campus life at KIIT
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="space-y-8">
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              className={`grid gap-6 ${
                rowIndex === 4 ? "grid-cols-1 max-w-xs mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: rowIndex * 0.1 }}
            >
              {row.map((member) => (
                <TeamCard key={member.id} member={member} mousePosition={mousePosition} />
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </section>
  );
};
