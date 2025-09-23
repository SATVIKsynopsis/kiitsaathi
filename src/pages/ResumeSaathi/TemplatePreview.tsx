import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Mail, Phone, MapPin, Linkedin, Globe, Calendar } from "lucide-react";
import { ResumeData } from "./ResumeSaathi";

interface TemplatePreviewProps {
  data: ResumeData;
  template: string;
  atsScore: number;
}

export const TemplatePreview = ({ data, template, atsScore }: TemplatePreviewProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 85) return "Excellent - ATS Friendly";
    if (score >= 70) return "Good - Minor improvements needed";
    return "Needs improvement - Check suggestions";
  };

  const ClassicTemplate = () => (
    <div className="bg-white p-8 shadow-lg" id="resume-content">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {data.personalInfo.fullName}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {data.personalInfo.email}
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {data.personalInfo.phone}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {data.personalInfo.city}
          </div>
          {data.personalInfo.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </div>
          )}
          {data.personalInfo.portfolio && (
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              Portfolio
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300">
            EXPERIENCE
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{exp.title}</h3>
                  <p className="text-gray-600 font-medium">{exp.company}</p>
                </div>
                <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
              </div>
              <ul className="mt-2 text-gray-700">
                {exp.bullets.map((bullet, i) => (
                  <li key={i} className="mb-1">• {bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300">
            EDUCATION
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                  <p className="text-gray-600">{edu.institution}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{edu.startDate} - {edu.endDate}</p>
                  {edu.cgpa && <p>{edu.cgpa}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(data.skills.technical.length > 0 || data.skills.soft.length > 0) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300">
            SKILLS
          </h2>
          {data.skills.technical.length > 0 && (
            <div className="mb-2">
              <strong className="text-gray-700">Technical Skills: </strong>
              <span className="text-gray-600">{data.skills.technical.join(', ')}</span>
            </div>
          )}
          {data.skills.soft.length > 0 && (
            <div>
              <strong className="text-gray-700">Soft Skills: </strong>
              <span className="text-gray-600">{data.skills.soft.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300">
            PROJECTS
          </h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
              <p className="text-gray-700 mb-1">{project.description}</p>
              <p className="text-sm text-gray-600">
                <strong>Technologies:</strong> {project.technologies.join(', ')}
              </p>
              {project.link && (
                <p className="text-sm text-gray-600">
                  <strong>Link:</strong> {project.link}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Additional Sections */}
      {data.certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300">
            CERTIFICATIONS
          </h2>
          <ul className="text-gray-700">
            {data.certifications.map((cert, index) => (
              <li key={index} className="mb-1">• {cert}</li>
            ))}
          </ul>
        </div>
      )}

      {data.awards.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300">
            AWARDS & ACHIEVEMENTS
          </h2>
          <ul className="text-gray-700">
            {data.awards.map((award, index) => (
              <li key={index} className="mb-1">• {award}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Watermark */}
      <div className="text-right text-xs text-gray-400 mt-8 border-t pt-2">
        Made by <a href="https://ksaathi.vercel.app/" className="text-blue-500 hover:underline">KIIT Saathi</a>
      </div>
    </div>
  );

  const ModernTemplate = () => (
    <div className="bg-gray-50 p-8 shadow-lg" id="resume-content">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 -m-8 mb-6">
        <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName}</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.city}</span>
          {data.personalInfo.linkedin && <span>LinkedIn</span>}
          {data.personalInfo.portfolio && <span>Portfolio</span>}
        </div>
      </div>

      {/* Content with modern styling */}
      <div className="space-y-6">
        {data.summary && (
          <div>
            <h2 className="text-xl font-bold text-blue-600 mb-3 uppercase tracking-wide">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm">
              {data.summary}
            </p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-600 mb-3 uppercase tracking-wide">
              Experience
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{exp.title}</h3>
                      <p className="text-purple-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <ul className="text-gray-700 space-y-1">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i}>• {bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue with other sections in modern style... */}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-600 mb-3 uppercase tracking-wide">
              Education
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              {data.education.map((edu, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                      <p className="text-purple-600">{edu.institution}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{edu.startDate} - {edu.endDate}</p>
                      {edu.cgpa && <p className="font-medium">{edu.cgpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills with modern badges */}
        {(data.skills.technical.length > 0 || data.skills.soft.length > 0) && (
          <div>
            <h2 className="text-xl font-bold text-blue-600 mb-3 uppercase tracking-wide">
              Skills
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              {data.skills.technical.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Technical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.technical.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Soft Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.soft.map((skill, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-600 mb-3 uppercase tracking-wide">
              Projects
            </h2>
            <div className="space-y-4">
              {data.projects.map((project, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.name}</h3>
                  <p className="text-gray-700 mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.link && (
                    <p className="text-sm text-blue-600">{project.link}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Watermark */}
      <div className="text-right text-xs text-gray-400 mt-8 border-t pt-2">
        Made by <a href="https://ksaathi.vercel.app/" className="text-blue-500 hover:underline">KIIT Saathi</a>
      </div>
    </div>
  );

  const ProfessionalTemplate = () => (
    <div className="bg-white p-8 shadow-lg" id="resume-content">
      {/* Header */}
      <div className="border-l-4 border-blue-600 pl-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">
          {data.personalInfo.fullName}
        </h1>
        <div className="text-gray-600 space-y-1">
          <p>{data.personalInfo.email} | {data.personalInfo.phone} | {data.personalInfo.city}</p>
          {(data.personalInfo.linkedin || data.personalInfo.portfolio) && (
            <p>
              {data.personalInfo.linkedin && <span>LinkedIn | </span>}
              {data.personalInfo.portfolio && <span>Portfolio</span>}
            </p>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-600 mb-2 uppercase">
            Professional Summary
          </h2>
          <hr className="border-blue-200 mb-3" />
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Professional Experience */}
      {data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-600 mb-2 uppercase">
            Professional Experience
          </h2>
          <hr className="border-blue-200 mb-3" />
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-base font-bold text-gray-800">{exp.title}</h3>
                <span className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</span>
              </div>
              <p className="text-gray-700 font-medium mb-2">{exp.company}</p>
              <ul className="text-gray-700 text-sm space-y-1">
                {exp.bullets.map((bullet, i) => (
                  <li key={i}>• {bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-600 mb-2 uppercase">
            Education
          </h2>
          <hr className="border-blue-200 mb-3" />
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="text-base font-bold text-gray-800">{edu.degree}</h3>
                <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="text-gray-700">{edu.institution}</p>
              {edu.cgpa && <p className="text-sm text-gray-600">{edu.cgpa}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Core Competencies */}
      {(data.skills.technical.length > 0 || data.skills.soft.length > 0) && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-600 mb-2 uppercase">
            Core Competencies
          </h2>
          <hr className="border-blue-200 mb-3" />
          <div className="grid grid-cols-2 gap-4">
            {data.skills.technical.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Technical Skills</h4>
                <p className="text-sm text-gray-700">{data.skills.technical.join(' • ')}</p>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Professional Skills</h4>
                <p className="text-sm text-gray-700">{data.skills.soft.join(' • ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Projects */}
      {data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-600 mb-2 uppercase">
            Key Projects
          </h2>
          <hr className="border-blue-200 mb-3" />
          {data.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-base font-bold text-gray-800">{project.name}</h3>
              <p className="text-gray-700 text-sm mb-1">{project.description}</p>
              <p className="text-xs text-gray-600">
                <strong>Technologies:</strong> {project.technologies.join(', ')}
              </p>
              {project.link && (
                <p className="text-xs text-blue-600">{project.link}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Watermark */}
      <div className="text-right text-xs text-gray-400 mt-8 border-t pt-2">
        Made by <a href="https://ksaathi.vercel.app/" className="text-blue-500 hover:underline">KIIT Saathi</a>
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate />;
      case 'professional':
        return <ProfessionalTemplate />;
      default:
        return <ClassicTemplate />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ATS Score Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              ATS Score Analysis
            </span>
            <Badge variant={atsScore >= 85 ? "default" : atsScore >= 70 ? "secondary" : "destructive"}>
              {atsScore}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={atsScore} className="h-3" />
            <p className={`text-sm font-medium ${getScoreColor(atsScore)}`}>
              {getScoreDescription(atsScore)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resume Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{template} Template Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-200 bg-white" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', transform: 'scale(0.7)', transformOrigin: 'top center' }}>
            {renderTemplate()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};