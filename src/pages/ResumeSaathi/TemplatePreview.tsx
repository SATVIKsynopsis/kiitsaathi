import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import { ResumeData } from "./ResumeSaathi";

interface TemplatePreviewProps {
  data: ResumeData;
  template: string;
  atsScore: number;
}

export const TemplatePreview = ({
  data,
  template,
  atsScore,
}: TemplatePreviewProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  /** 🧱 Helper: safe array guard */
  const safeArray = (value: any) => (Array.isArray(value) ? value : []);

  /** ✅ High-ATS Template */
  const HighATSTemplate = () => (
    <div
      className="bg-white p-6 shadow-lg font-sans"
      id="resume-content"
      style={{
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.4",
        fontSize: "11pt",
      }}
    >
      {/* Header */}
      <div className="text-center mb-4 pb-3 border-b border-gray-400">
        <h1 className="text-2xl font-bold text-black mb-1">
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <p className="text-sm text-gray-700 mb-2">
          {data.professionalTitle ||
            "Full Stack Developer | Computer Science Graduate"}
        </p>
        <div className="text-xs text-gray-600 flex justify-center gap-4 flex-wrap">
          {data.personalInfo.email && <span>📧 {data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>📞 {data.personalInfo.phone}</span>}
          {data.personalInfo.city && <span>📍 {data.personalInfo.city}</span>}
          {data.personalInfo.linkedin && (
            <span>
              💼{" "}
              {data.personalInfo.linkedin
                .replace("https://", "")
                .replace("linkedin.com/in/", "")}
            </span>
          )}
          {data.personalInfo.portfolio && (
            <span>🌐 {data.personalInfo.portfolio}</span>
          )}
        </div>
      </div>

      {/* ✅ Professional Summary Section */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-black mb-2 border-b border-gray-300">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">
            {data.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {(data.experience?.length || 0) > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-black mb-2 border-b border-gray-300">
            WORK EXPERIENCE
          </h2>
          {safeArray(data.experience).map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-sm font-bold text-black">{exp.company}</h3>
                  <p className="text-sm text-black">{exp.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
              </div>
              {safeArray(exp.bullets).length > 0 && (
                <ul className="text-xs text-black list-none">
                  {exp.bullets.map((b, j) => (
                    <li key={j}>• {b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {(data.education?.length || 0) > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-black mb-2 border-b border-gray-300">
            EDUCATION
          </h2>
          {safeArray(data.education).map((edu, i) => (
            <div key={i} className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-bold text-black">
                  {edu.institution}
                </h3>
                <p className="text-sm text-black">
                  {edu.degree}
                  {edu.cgpa && ` • ${edu.cgpa}/10`}
                </p>
              </div>
              <p className="text-xs text-gray-600">
                {edu.startDate} - {edu.endDate}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {(data.projects?.length || 0) > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-black mb-2 border-b border-gray-300">
            PROJECTS
          </h2>
          {safeArray(data.projects).map((project, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold text-black">{project.name}</h3>
                {project.dateRange && (
                  <p className="text-xs text-gray-600">{project.dateRange}</p>
                )}
              </div>
              {project.description && (
                <p className="text-xs text-black mb-1">
                  • {project.description}
                </p>
              )}
              {safeArray(project.technologies).length > 0 && (
                <p className="text-xs text-black">
                  <span className="font-semibold">Technologies:</span>{" "}
                  {project.technologies.join(", ")}
                </p>
              )}
              {project.link && (
                <p className="text-xs text-blue-600 underline">
                  {project.link}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(safeArray(data.skills?.technical).length > 0 ||
        safeArray(data.skills?.soft).length > 0) && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-black mb-2 border-b border-gray-300">
            SKILLS
          </h2>
          {safeArray(data.skills.technical).length > 0 && (
            <p className="text-xs text-black mb-1">
              <span className="font-semibold">Technical:</span>{" "}
              {data.skills.technical.join(", ")}
            </p>
          )}
          {safeArray(data.skills.soft).length > 0 && (
            <p className="text-xs text-black">
              <span className="font-semibold">Soft:</span>{" "}
              {data.skills.soft.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Certifications */}
      {(data.certifications?.length || 0) > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-black mb-2 border-b border-gray-300">
            CERTIFICATIONS
          </h2>
          <ul className="text-xs text-black">
            {safeArray(data.certifications).map((cert, i) => (
              <li key={i}>• {cert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Awards */}
      {(data.awards?.length || 0) > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-black mb-2 border-b border-gray-300">
            AWARDS & ACHIEVEMENTS
          </h2>
          <ul className="text-xs text-black">
            {safeArray(data.awards).map((award, i) => (
              <li key={i}>• {award}</li>
            ))}
          </ul>
        </div>
      )}
            {/* Languages */}
            {/* Languages */}
      {Array.isArray(data.languages) && data.languages.filter(l => l.trim()).length > 0 && (
        <div className="mb-3">
          <h2 className="text-sm font-bold text-black mb-1 border-b border-gray-200 pb-[1px]">
            LANGUAGES
          </h2>
          <p className="text-xs text-black leading-relaxed">
            {data.languages.filter(l => l.trim()).join(", ")}
          </p>
        </div>
      )}

      {/* Interests */}
      {Array.isArray(data.interests) && data.interests.filter(i => i.trim()).length > 0 && (
        <div className="mb-3">
          <h2 className="text-sm font-bold text-black mb-1 border-b border-gray-200 pb-[1px]">
            INTERESTS & HOBBIES
          </h2>
          <p className="text-xs text-black leading-relaxed">
            {data.interests.filter(i => i.trim()).join(", ")}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-right text-[10px] text-gray-400 mt-4 pt-2 border-t border-gray-200">
        Made by{" "}
        <a
          href="https://ksaathi.vercel.app/"
          className="text-blue-500 hover:underline"
        >
          KIIT Saathi
        </a>
      </div>


     

      {/* Footer */}

     
    </div>
  );

  /** 🧩 Template Switch */
  const renderTemplate = () => {
    switch (template) {
      case "classic":
      case "modern":
      case "professional":
        return <HighATSTemplate />;
      case "high-ats":
      default:
        return <HighATSTemplate />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Resume Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">
            {template} Template Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border border-gray-200 bg-white"
            style={{
              minHeight: "297mm",
              width: "210mm",
              margin: "0 auto",
              transform: "scale(0.7)",
              transformOrigin: "top center",
            }}
          >
            {renderTemplate()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};