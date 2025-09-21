import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, User, FileText, GraduationCap, Briefcase, Code, Award, Globe } from "lucide-react";
import { ResumeData } from "./ResumeSaathi";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const resumeSchema = z
  .object({
    personalInfo: z.object({
      fullName: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Please enter a valid email"),
      phone: z.string().min(10, "Please enter a valid phone number"),
      city: z.string().min(2, "City is required"),
      linkedin: z.string().optional(),
      portfolio: z.string().optional(),
    }),
    summary: z.string().optional().default(""),
    education: z
      .array(
        z.object({
          degree: z.string().min(2, "Degree is required"),
          institution: z.string().min(2, "Institution is required"),
          startDate: z.string().min(4, "Start date is required"),
          endDate: z.string().min(4, "End date is required"),
          cgpa: z.string().optional(),
        })
      )
      .min(1, "At least one education entry is required"),
    experience: z
      .array(
        z.object({
          title: z.string().optional().default(""),
          company: z.string().optional().default(""),
          startDate: z.string().optional().default(""),
          endDate: z.string().optional().default(""),
          bullets: z.array(z.string()).optional().default([]),
        })
      )
      .optional()
      .default([]),
    projects: z
      .array(
        z.object({
          name: z.string().optional().default(""),
          description: z.string().optional().default(""),
          technologies: z.array(z.string()).optional().default([]),
          link: z.string().optional(),
        })
      )
      .optional()
      .default([]),
    skills: z
      .object({
        technical: z.array(z.string()).optional().default([]),
        soft: z.array(z.string()).optional().default([]),
      })
      .optional()
      .default({ technical: [], soft: [] }),
    certifications: z.array(z.string()).optional().default([]),
    awards: z.array(z.string()).optional().default([]),
    languages: z.array(z.string()).optional().default([]),
    interests: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) => {
      const hasExperience = (data.experience || []).some(
        (exp) => (exp.title?.trim() || "") && (exp.company?.trim() || "")
      );
      const hasProject = (data.projects || []).some(
        (p) => (p.name?.trim() || "") && (p.description?.trim() || "")
      );
      return hasExperience || hasProject;
    },
    {
      message:
        "Add at least one Experience (with title and company) or one Project (with name and description).",
      path: ["experience"],
    }
  );

interface ResumeFormProps {
  onSubmit: (data: ResumeData, template: string) => void;
  initialData?: ResumeData | null;
  editingId?: string | null;
  externalError?: string | null;
}

export const ResumeForm = ({ onSubmit, initialData, editingId, externalError }: ResumeFormProps) => {
  const [currentTab, setCurrentTab] = useState("personal");
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [newSkill, setNewSkill] = useState("");
  const [skillType, setSkillType] = useState<"technical" | "soft">("technical");
  const [localError, setLocalError] = useState<string | null>(null);

  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: initialData || {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        city: "",
        linkedin: "",
        portfolio: "",
      },
      summary: "",
      education: [{ degree: "", institution: "", startDate: "", endDate: "", cgpa: "" }],
      experience: [],
      projects: [],
      skills: { technical: [], soft: [] },
      certifications: [],
      awards: [],
      languages: [],
      interests: [],
    },
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    const currentSkills = form.getValues(`skills.${skillType}`);
    form.setValue(`skills.${skillType}`, [...currentSkills, newSkill.trim()]);
    setNewSkill("");
  };

  const removeSkill = (skillType: "technical" | "soft", index: number) => {
    const currentSkills = form.getValues(`skills.${skillType}`);
    form.setValue(`skills.${skillType}`, currentSkills.filter((_, i) => i !== index));
  };

  const addExperienceBullet = (expIndex: number) => {
    const currentBullets = form.getValues(`experience.${expIndex}.bullets`);
    form.setValue(`experience.${expIndex}.bullets`, [...currentBullets, ""]);
  };

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    const currentBullets = form.getValues(`experience.${expIndex}.bullets`);
    form.setValue(`experience.${expIndex}.bullets`, currentBullets.filter((_, i) => i !== bulletIndex));
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = (data: ResumeData) => {
    console.log("Form submitted with data:", data);
    console.log("Selected template:", selectedTemplate);

    // Minimal required fields validation
    if (!data.personalInfo.fullName || !data.personalInfo.email || !data.personalInfo.phone || !data.personalInfo.city) {
      setLocalError("Please fill Full Name, Email, Phone, and City.");
      toast.error("Missing required personal details.");
      setCurrentTab("personal");
      return;
    }

    if (!data.education || data.education.length === 0) {
      setLocalError("Add at least one Education entry.");
      toast.error("Education is required.");
      setCurrentTab("education");
      return;
    }

    const hasExperience = (data.experience || []).some(exp => (exp.title?.trim() && exp.company?.trim()));
    const hasProject = (data.projects || []).some(p => (p.name?.trim() && p.description?.trim()));

    if (!hasExperience && !hasProject) {
      setLocalError("Add at least one Experience (with Title & Company) or one Project (with Name & Description).");
      toast.error("Add Experience or Project to continue.");
      setCurrentTab("experience");
      return;
    }

    setLocalError(null);
    onSubmit(data, selectedTemplate);
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "summary", label: "Summary", icon: FileText },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "projects", label: "Projects", icon: Code },
    { id: "skills", label: "Skills", icon: Award },
    { id: "additional", label: "Additional", icon: Globe },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {editingId ? "Edit Resume" : "Create Your Resume"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {(externalError || localError) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{externalError || localError}</AlertDescription>
              <div className="mt-2">
                <Button type="submit" variant="outline" size="sm">Retry</Button>
              </div>
            </Alert>
          )}
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
            console.log("Form validation errors:", errors);
            const firstErrorKey = Object.keys(errors)[0];
            setLocalError("Please fix the highlighted fields to continue.");
            toast.error("Some required fields are missing.");
          })} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-7">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                      <IconComponent className="w-4 h-4 mr-1" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="personalInfo.fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalInfo.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalInfo.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Bhubaneswar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalInfo.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalInfo.portfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio/Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://johndoe.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a compelling professional summary that highlights your key achievements and career objectives..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                {educationFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Education {index + 1}</h4>
                      {educationFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeEducation(index)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`education.${index}.degree`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Degree *</FormLabel>
                            <FormControl>
                              <Input placeholder="B.Tech Computer Science" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`education.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution *</FormLabel>
                            <FormControl>
                              <Input placeholder="KIIT University" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`education.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <Input placeholder="2020" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`education.${index}.endDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date *</FormLabel>
                            <FormControl>
                              <Input placeholder="2024" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`education.${index}.cgpa`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CGPA/Percentage</FormLabel>
                            <FormControl>
                              <Input placeholder="8.5 CGPA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendEducation({ degree: "", institution: "", startDate: "", endDate: "", cgpa: "" })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                {experienceFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Experience {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeExperience(index)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name={`experience.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`experience.${index}.company`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company *</FormLabel>
                            <FormControl>
                              <Input placeholder="Tech Corp" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`experience.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <Input placeholder="Jan 2023" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`experience.${index}.endDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date *</FormLabel>
                            <FormControl>
                              <Input placeholder="Present" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <FormLabel>Key Responsibilities *</FormLabel>
                      {form.watch(`experience.${index}.bullets`).map((bullet, bulletIndex) => (
                        <div key={bulletIndex} className="flex gap-2 mb-2">
                          <FormField
                            control={form.control}
                            name={`experience.${index}.bullets.${bulletIndex}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input 
                                    placeholder="• Developed and maintained web applications..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeExperienceBullet(index, bulletIndex)}
                            disabled={form.watch(`experience.${index}.bullets`).length === 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addExperienceBullet(index)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Responsibility
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendExperience({ 
                    title: "", 
                    company: "", 
                    startDate: "", 
                    endDate: "", 
                    bullets: [""] 
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                {projectFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Project {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProject(index)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`projects.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="E-commerce Platform" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`projects.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the project, its purpose, and your role..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <FormLabel>Technologies Used *</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {form.watch(`projects.${index}.technologies`).map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                              {tech}
                              <button
                                type="button"
                                onClick={() => {
                                  const currentTechs = form.getValues(`projects.${index}.technologies`);
                                  form.setValue(
                                    `projects.${index}.technologies`,
                                    currentTechs.filter((_, i) => i !== techIndex)
                                  );
                                }}
                                className="ml-1 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add technology (e.g., React, Node.js)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                if (value) {
                                  const currentTechs = form.getValues(`projects.${index}.technologies`);
                                  form.setValue(`projects.${index}.technologies`, [...currentTechs, value]);
                                  e.currentTarget.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name={`projects.${index}.link`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Link (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://github.com/username/project" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendProject({ name: "", description: "", technologies: [], link: "" })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Technical Skills *</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.watch("skills.technical").map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill("technical", index)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add technical skill"
                        value={skillType === "technical" ? newSkill : ""}
                        onChange={(e) => {
                          setSkillType("technical");
                          setNewSkill(e.target.value);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSkillType("technical");
                          addSkill();
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Soft Skills *</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.watch("skills.soft").map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill("soft", index)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add soft skill"
                        value={skillType === "soft" ? newSkill : ""}
                        onChange={(e) => {
                          setSkillType("soft");
                          setNewSkill(e.target.value);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSkillType("soft");
                          addSkill();
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Certifications</FormLabel>
                    <Textarea
                      placeholder="List your certifications (one per line)"
                      value={form.watch("certifications").join('\n')}
                      onChange={(e) => form.setValue("certifications", e.target.value.split('\n').filter(Boolean))}
                    />
                  </div>
                  <div>
                    <FormLabel>Awards & Achievements</FormLabel>
                    <Textarea
                      placeholder="List your awards (one per line)"
                      value={form.watch("awards").join('\n')}
                      onChange={(e) => form.setValue("awards", e.target.value.split('\n').filter(Boolean))}
                    />
                  </div>
                  <div>
                    <FormLabel>Languages</FormLabel>
                    <Textarea
                      placeholder="List languages you speak (one per line)"
                      value={form.watch("languages").join('\n')}
                      onChange={(e) => form.setValue("languages", e.target.value.split('\n').filter(Boolean))}
                    />
                  </div>
                  <div>
                    <FormLabel>Interests & Hobbies</FormLabel>
                    <Textarea
                      placeholder="List your interests (one per line)"
                      value={form.watch("interests").join('\n')}
                      onChange={(e) => form.setValue("interests", e.target.value.split('\n').filter(Boolean))}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-4">Choose Template</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["classic", "modern", "professional"].map((template) => (
                    <Card
                      key={template}
                      className={`cursor-pointer transition-all ${selectedTemplate === template ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="p-4 text-center">
                        <h5 className="font-semibold capitalize">{template}</h5>
                        <p className="text-sm text-muted-foreground">
                          {template === "classic" && "Clean and traditional design"}
                          {template === "modern" && "Contemporary with subtle colors"}
                          {template === "professional" && "Corporate-ready layout"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentTab === tabs[0].id}
                >
                  Previous
                </Button>
                
                {currentTab === tabs[tabs.length - 1].id ? (
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    onClick={() => {
                      console.log("Generate button clicked");
                      console.log("Form state:", form.formState);
                      console.log("Form errors:", form.formState.errors);
                    }}
                  >
                    Generate Resume
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};