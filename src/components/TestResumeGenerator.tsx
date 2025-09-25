import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube, User, GraduationCap, Briefcase } from 'lucide-react';
import { ResumeData } from '@/pages/ResumeSaathi/ResumeSaathi';

interface TestResumeGeneratorProps {
  onTestResume: (data: ResumeData, template: string) => void;
}

export function TestResumeGenerator({ onTestResume }: TestResumeGeneratorProps) {
  const generateTestResume = () => {
    const testData: ResumeData = {
      personalInfo: {
        fullName: "Arjun Kumar Sharma",
        email: "arjun.sharma@kiit.ac.in",
        phone: "+91 9876543210",
        city: "Bhubaneswar, Odisha",
        linkedin: "https://linkedin.com/in/arjunksharma",
        portfolio: "https://arjunsharma.dev"
      },
      summary: "Passionate Computer Science Engineering student at KIIT University with strong programming skills in Java, Python, and web technologies. Experienced in full-stack development with hands-on projects in machine learning and mobile app development. Seeking opportunities to apply technical skills in a challenging software development role.",
      education: [
        {
          degree: "B.Tech in Computer Science & Engineering",
          institution: "KIIT University",
          startDate: "2021",
          endDate: "2025",
          cgpa: "8.7 CGPA"
        },
        {
          degree: "12th Grade (Science - PCM)",
          institution: "Delhi Public School",
          startDate: "2019",
          endDate: "2021",
          cgpa: "92.5%"
        }
      ],
      experience: [
        {
          title: "Software Development Intern",
          company: "TechCorp Solutions",
          startDate: "Jun 2024",
          endDate: "Aug 2024",
          bullets: [
            "Developed REST APIs using Node.js and Express.js, reducing response time by 30%",
            "Collaborated with a team of 5 developers using Git and Agile methodologies",
            "Built responsive web interfaces using React.js and Bootstrap, serving 1000+ users",
            "Implemented database optimization techniques, improving query performance by 25%"
          ]
        },
        {
          title: "Web Development Freelancer",
          company: "Self-Employed",
          startDate: "Jan 2024",
          endDate: "Present",
          bullets: [
            "Created 8+ websites for local businesses, increasing their online presence by 40%",
            "Managed full project lifecycle from requirement gathering to deployment",
            "Generated ₹25,000+ revenue through freelance projects"
          ]
        }
      ],
      projects: [
        {
          name: "Smart Campus Navigation System",
          description: "Android app helping KIIT students navigate campus efficiently using GPS and indoor mapping. Features include real-time location tracking, classroom finder, and event notifications.",
          technologies: ["Android Studio", "Java", "Firebase", "Google Maps API", "SQLite"],
          link: "https://github.com/arjun/smart-campus"
        },
        {
          name: "Student Result Prediction ML Model",
          description: "Machine learning model predicting student academic performance using historical data. Achieved 87% accuracy using ensemble methods and feature engineering.",
          technologies: ["Python", "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Jupyter"],
          link: "https://github.com/arjun/result-prediction"
        },
        {
          name: "E-Commerce Platform",
          description: "Full-stack e-commerce website with user authentication, payment integration, and admin dashboard. Handles 100+ concurrent users with responsive design.",
          technologies: ["React.js", "Node.js", "MongoDB", "Express.js", "Stripe API", "Bootstrap"]
        }
      ],
      skills: {
        technical: [
          "Java", "Python", "JavaScript", "React.js", "Node.js", "MongoDB", 
          "MySQL", "Git", "AWS", "Docker", "Android Development", "Machine Learning"
        ],
        soft: [
          "Leadership", "Team Collaboration", "Problem Solving", "Communication", 
          "Project Management", "Adaptability"
        ]
      },
      certifications: [
        "AWS Cloud Practitioner - Amazon Web Services (2024)",
        "Full Stack Web Development Certification - Coursera (2023)",
        "Java Programming Masterclass - Udemy (2023)",
        "Google Analytics Certified (2024)"
      ],
      awards: [
        "Best Project Award - KIIT Tech Fest 2024",
        "2nd Place - National Level Coding Competition (2023)",
        "Dean's List - Academic Excellence (2022-2023)",
        "Winner - University Hackathon (2023)"
      ],
      languages: [
        "English (Fluent)",
        "Hindi (Native)",
        "Odia (Conversational)",
        "Spanish (Basic)"
      ],
      interests: [
        "Open Source Contributing",
        "Tech Blogging",
        "Photography",
        "Cricket",
        "Traveling",
        "Reading Tech Articles"
      ]
    };

    onTestResume(testData, "modern");
  };

  return (
    <Card className="glass-card border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <TestTube className="w-5 h-5" />
          Test Resume Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Demo Resume Includes:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Complete Personal Info
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                KIIT Education Details
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Real Internship Experience
              </div>
              <div className="flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Technical Projects
              </div>
            </div>
          </div>
          
          <Button 
            onClick={generateTestResume}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Generate Test Resume
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            This will populate the form with realistic KIIT student data for testing
          </p>
        </div>
      </CardContent>
    </Card>
  );
}