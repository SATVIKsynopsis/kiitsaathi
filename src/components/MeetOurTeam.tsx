import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Instagram, Github } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
}

// Placeholder team data - replace images with real team photos
const teamMembers: TeamMember[] = [
  { id: 1, name: 'Aarav Sharma', role: 'Founder & CEO', image: '/team/member-1.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 2, name: 'Priya Patel', role: 'Co-Founder & CTO', image: '/team/member-2.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 3, name: 'Arjun Reddy', role: 'Product Manager', image: '/team/member-3.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 4, name: 'Ananya Singh', role: 'Lead Developer', image: '/team/member-4.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 5, name: 'Rohan Gupta', role: 'UI/UX Designer', image: '/team/member-5.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 6, name: 'Sneha Iyer', role: 'Marketing Lead', image: '/team/member-6.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 7, name: 'Vikram Malhotra', role: 'Content Strategist', image: '/team/member-7.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 8, name: 'Kavya Nair', role: 'Backend Developer', image: '/team/member-8.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 9, name: 'Aditya Joshi', role: 'Frontend Developer', image: '/team/member-9.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 10, name: 'Ishita Desai', role: 'Data Analyst', image: '/team/member-10.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 11, name: 'Karan Mehta', role: 'Business Development', image: '/team/member-11.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 12, name: 'Diya Kapoor', role: 'Operations Manager', image: '/team/member-12.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 13, name: 'Sahil Verma', role: 'Community Manager', image: '/team/member-13.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 14, name: 'Riya Agarwal', role: 'QA Engineer', image: '/team/member-14.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 15, name: 'Nikhil Rao', role: 'DevOps Engineer', image: '/team/member-15.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 16, name: 'Pooja Khanna', role: 'Growth Hacker', image: '/team/member-16.png', linkedin: '#', instagram: '#', github: '#' },
  { id: 17, name: 'Dr. Rajesh Kumar', role: 'Technical Advisor', image: '/team/member-17.png', linkedin: '#', instagram: '#', github: '#' },
];

const TeamCard: React.FC<{ member: TeamMember; mousePosition: { x: number; y: number } }> = ({ 
  member, 
  mousePosition 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [faceDirection, setFaceDirection] = useState('center');

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
      setFaceDirection('center');
      return;
    }

    // Determine direction based on angle
    let direction = 'center';
    if (angle >= -22.5 && angle < 22.5) direction = 'east';
    else if (angle >= 22.5 && angle < 67.5) direction = 'southeast';
    else if (angle >= 67.5 && angle < 112.5) direction = 'south';
    else if (angle >= 112.5 && angle < 157.5) direction = 'southwest';
    else if (angle >= 157.5 || angle < -157.5) direction = 'west';
    else if (angle >= -157.5 && angle < -112.5) direction = 'northwest';
    else if (angle >= -112.5 && angle < -67.5) direction = 'north';
    else if (angle >= -67.5 && angle < -22.5) direction = 'northeast';

    setFaceDirection(direction);
  }, [mousePosition, isFlipped]);

  // Transform value based on face direction for subtle eye-like movement
  const getFaceTransform = () => {
    const moveAmount = 3;
    switch (faceDirection) {
      case 'north': return `translateY(-${moveAmount}px)`;
      case 'northeast': return `translate(${moveAmount}px, -${moveAmount}px)`;
      case 'east': return `translateX(${moveAmount}px)`;
      case 'southeast': return `translate(${moveAmount}px, ${moveAmount}px)`;
      case 'south': return `translateY(${moveAmount}px)`;
      case 'southwest': return `translate(-${moveAmount}px, ${moveAmount}px)`;
      case 'west': return `translateX(-${moveAmount}px)`;
      case 'northwest': return `translate(-${moveAmount}px, -${moveAmount}px)`;
      default: return 'translate(0, 0)';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative h-80 cursor-pointer perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden bg-card border border-border shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-col items-center justify-center h-full p-6">
            <motion.div
              className="w-40 h-40 rounded-full overflow-hidden mb-4 bg-muted"
              style={{ transform: getFaceTransform() }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground text-center">
              {member.name}
            </h3>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-xl"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 bg-primary/20">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover opacity-70"
              />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
              {member.name}
            </h3>
            <p className="text-lg text-primary font-medium mb-4 text-center">
              {member.role}
            </p>
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
            boxShadow: '0 0 30px hsla(var(--primary) / 0.4)',
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

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
                rowIndex === 4 
                  ? 'grid-cols-1 max-w-xs mx-auto' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: rowIndex * 0.1 }}
            >
              {row.map((member) => (
                <TeamCard
                  key={member.id}
                  member={member}
                  mousePosition={mousePosition}
                />
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
