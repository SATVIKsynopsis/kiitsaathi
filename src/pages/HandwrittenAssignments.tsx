import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Clock,
  User,
  CheckCircle,
  Star,
  MapPin,
  MessageCircle,
  ArrowRight,
  Calculator,
  PenTool,
  FileText,
  Truck,
  Coffee,
  ArrowLeft,
  X,
  FileImage,
  AlertTriangle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useAssignmentManager } from "@/hooks/useAssignmentManager";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const HandwrittenAssignments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { helpers, createAssignment, loading } = useAssignmentManager();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    year: "",
    branch: "",
    pages: "",
    deadline: "",
    hostel: "",
    room: "",
    notes: "",
    urgent: false,
    matchHandwriting: false,
    deliveryMethod: "hostel_delivery",
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatePrice = () => {
    const pages = parseInt(formData.pages) || 0;
    const basePrice = pages * (formData.urgent ? 15 : 10);
    const matchingFee = formData.matchHandwriting ? 20 : 0;
    const deliveryFee = formData.deliveryMethod === "hostel_delivery" ? 10 : 0;
    const total = basePrice + matchingFee + deliveryFee;
    setCalculatedPrice(total);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.includes("image/") || file.type === "application/pdf";
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        toast.error(
          `${file.name} is not a valid file type. Please upload images or PDFs only.`
        );
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      return true;
    });

    setUploadedFiles((prev) => [...prev, ...validFiles]);

    // Auto-detect pages from PDFs or estimate from images
    const totalPages = validFiles.reduce((acc, file) => {
      if (file.type === "application/pdf") {
        // This is a simplified estimation - in reality you'd use a PDF parser
        return acc + Math.ceil(file.size / (100 * 1024)); // Rough estimate
      }
      return acc + 1; // 1 page per image
    }, parseInt(formData.pages) || 0);

    setFormData((prev) => ({ ...prev, pages: totalPages.toString() }));
    calculatePrice();
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return uploadedFiles.length > 0;
      case 2:
        return !!(
          formData.name &&
          formData.whatsapp &&
          formData.year &&
          formData.branch &&
          formData.pages &&
          formData.deadline &&
          formData.hostel &&
          formData.room
        );
      case 3:
        return !!formData.deliveryMethod;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      toast.error("Please complete all required fields before proceeding.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to submit assignment request");
      navigate("/auth");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one assignment file");
      return;
    }

    if (!validateStep(2)) {
      toast.error("Please fill in all required details");
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataWithFiles = new FormData();
      formDataWithFiles.append("name", formData.name);
      formDataWithFiles.append("whatsapp", formData.whatsapp);
      formDataWithFiles.append("year", formData.year);
      formDataWithFiles.append("branch", formData.branch);
      formDataWithFiles.append("pages", formData.pages);
      formDataWithFiles.append("deadline", formData.deadline);
      formDataWithFiles.append("hostel", formData.hostel);
      formDataWithFiles.append("room", formData.room);
      formDataWithFiles.append("notes", formData.notes);
      formDataWithFiles.append("urgent", String(formData.urgent));
      formDataWithFiles.append(
        "matchHandwriting",
        String(formData.matchHandwriting)
      );
      formDataWithFiles.append("deliveryMethod", formData.deliveryMethod);
      formDataWithFiles.append("totalPrice", String(calculatedPrice));
      uploadedFiles.forEach((file, index) => {
        formDataWithFiles.append(`file${index}`, file);
      });
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${BASE_URL}/api/assignments/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
        body: formDataWithFiles,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to submit assignment: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `Invalid response: Expected JSON, got ${contentType} - ${text.slice(
            0,
            100
          )}...`
        );
      }

      const { assignment } = await response.json();

      toast.success(
        "Assignment request submitted successfully! Check your email for confirmation."
      );

      // Reset form
      setFormData({
        name: "",
        whatsapp: "",
        year: "",
        branch: "",
        pages: "",
        deadline: "",
        hostel: "",
        room: "",
        notes: "",
        urgent: false,
        matchHandwriting: false,
        deliveryMethod: "hostel_delivery",
      });
      setUploadedFiles([]);
      setCurrentStep(1);
      setCalculatedPrice(0);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit assignment request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const writers = [
    {
      name: "Priya S.",
      year: "3rd Year",
      course: "CSE",
      rating: 4.9,
      tags: ["Fast writer", "Neat handwriting"],
      sample: "✨ Beautiful cursive style",
    },
    {
      name: "Rahul M.",
      year: "4th Year",
      course: "Mechanical",
      rating: 4.8,
      tags: ["Technical diagrams", "Engineering notes"],
      sample: "📐 Perfect for technical work",
    },
    {
      name: "Sneha K.",
      year: "2nd Year",
      course: "MBBS",
      rating: 5.0,
      tags: ["Medical student", "Precise writing"],
      sample: "💊 Medical precision writing",
    },
  ];

  const faqs = [
    {
      question: "Will the handwriting match mine?",
      answer:
        "If you upload a sample, we'll try our best to match your style. Our writers are skilled at adapting different handwriting styles.",
    },
    {
      question: "Is this allowed by college?",
      answer:
        "This is just handwriting support. The content must be your own original work. We're simply helping with the physical writing process.",
    },
    {
      question: "Can I request urgent assignments?",
      answer:
        "Yes, but we charge extra for urgent same-day deliveries. We recommend placing orders at least 24 hours in advance for best results.",
    },
    {
      question: "Who writes my assignments?",
      answer:
        "KIIT students who love neat handwriting and earn through this service. All writers are verified and their work is reviewed before delivery.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50">
      {/* Back to Home Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-kiit-green hover:text-kiit-green-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient font-poppins">
              📝 Handwritten Assignments
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Don't have time to write? We've got real students who'll do it for
              you — neat, accurate, and on time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Badge variant="secondary" className="text-lg py-2 px-4">
                Your handwriting break starts here
              </Badge>
              <Badge variant="outline" className="text-lg py-2 px-4">
                Real handwriting. Real paper. Real students.
              </Badge>
            </div>
            <Button
              size="lg"
              className="gradient-primary text-white px-8 py-4 text-lg"
              onClick={() =>
                document
                  .getElementById("upload-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Place an Assignment Request
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white/60">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
            🎒 How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="glass-card hover:scale-105 transition-transform">
              <CardContent className="pt-6 text-center">
                <Upload className="w-12 h-12 text-kiit-green mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  Upload Assignment
                </h3>
                <p className="text-muted-foreground">
                  Upload your PDF or image of the assignment
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-105 transition-transform">
              <CardContent className="pt-6 text-center">
                <PenTool className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Choose Style</h3>
                <p className="text-muted-foreground">
                  Select writing style and delivery time
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-105 transition-transform">
              <CardContent className="pt-6 text-center">
                <User className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Writer Assigned</h3>
                <p className="text-muted-foreground">
                  We assign a verified student writer
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-105 transition-transform">
              <CardContent className="pt-6 text-center">
                <Truck className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Delivered</h3>
                <p className="text-muted-foreground">
                  Handwritten copy delivered to your hostel
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="text-center mt-8 text-muted-foreground italic">
            "We use college students who love handwriting and need extra income
            — so it helps everyone."
          </p>
        </div>
      </section>

      {/* Step-by-Step Upload Form */}
      <section id="upload-form" className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto glass-card">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-gradient">
                📤 Assignment Request Form
              </CardTitle>

              {/* Progress Indicator */}
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          currentStep >= step
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step}
                      </div>
                      {step < 4 && (
                        <div
                          className={`w-12 h-1 mx-2 ${
                            currentStep > step ? "bg-primary" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-muted-foreground mt-4">
                {currentStep === 1 &&
                  "Step 1: Upload Assignment Content (Mandatory)"}
                {currentStep === 2 && "Step 2: Enter Assignment Details"}
                {currentStep === 3 && "Step 3: Select Delivery Method"}
                {currentStep === 4 && "Step 4: Review & Confirm"}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: File Upload */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      📁 Upload Assignment Files *
                    </Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Click to upload PDF or images
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Supported: JPG, PNG, PDF (Max 10MB each)
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Uploaded Files Display */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <Label className="font-medium">
                        Uploaded Files ({uploadedFiles.length})
                      </Label>
                      <div className="grid gap-3">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileImage className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium text-sm">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-800 mb-2">
                          Important Disclaimer
                        </p>
                        <p className="text-sm text-yellow-700">
                          <strong>Marks depend on the provided content.</strong>{" "}
                          KIIT Saathi and the helper are not responsible for low
                          marks if the content is copied exactly as provided.
                          Please ensure your uploaded content is accurate and
                          complete.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Assignment Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>WhatsApp Number *</Label>
                      <Input
                        placeholder="+91 99999 99999"
                        value={formData.whatsapp}
                        onChange={(e) =>
                          handleInputChange("whatsapp", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Academic Year *</Label>
                      <Input
                        placeholder="1st/2nd/3rd/4th Year"
                        value={formData.year}
                        onChange={(e) =>
                          handleInputChange("year", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Branch/Subject *</Label>
                      <Input
                        placeholder="CSE/EEE/Mechanical/etc."
                        value={formData.branch}
                        onChange={(e) =>
                          handleInputChange("branch", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Number of Pages *</Label>
                      <Input
                        type="number"
                        placeholder="Auto-detected from files"
                        value={formData.pages}
                        onChange={(e) => {
                          handleInputChange("pages", e.target.value);
                          calculatePrice();
                        }}
                        required
                      />
                    </div>
                    <div>
                      <Label>Deadline *</Label>
                      <Input
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={(e) =>
                          handleInputChange("deadline", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Hostel Name *</Label>
                      <Input
                        placeholder="CV Raman/Kalam/etc."
                        value={formData.hostel}
                        onChange={(e) =>
                          handleInputChange("hostel", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Room Number *</Label>
                      <Input
                        placeholder="Room 101"
                        value={formData.room}
                        onChange={(e) =>
                          handleInputChange("room", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Special Instructions (Optional)</Label>
                    <Textarea
                      placeholder="Any specific requirements, handwriting style preferences, etc."
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="urgent"
                        checked={formData.urgent}
                        onChange={(e) => {
                          handleInputChange("urgent", e.target.checked);
                          calculatePrice();
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="urgent" className="text-sm">
                        Urgent delivery (within 24 hrs) - ₹5 extra per page
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="match"
                        checked={formData.matchHandwriting}
                        onChange={(e) => {
                          handleInputChange(
                            "matchHandwriting",
                            e.target.checked
                          );
                          calculatePrice();
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="match" className="text-sm">
                        Match my handwriting style - ₹20 extra
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Delivery Method */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      🚚 Choose Delivery Method
                    </Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card
                        className={`cursor-pointer transition-colors ${
                          formData.deliveryMethod === "hostel_delivery"
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          handleInputChange(
                            "deliveryMethod",
                            "hostel_delivery"
                          );
                          calculatePrice();
                        }}
                      >
                        <CardContent className="pt-6 text-center">
                          <Truck className="w-12 h-12 text-primary mx-auto mb-4" />
                          <h3 className="font-semibold text-lg mb-2">
                            🏠 Hostel Delivery
                          </h3>
                          <p className="text-muted-foreground mb-2">
                            Delivered directly to your hostel room
                          </p>
                          <Badge variant="secondary">+ ₹10 delivery fee</Badge>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-colors ${
                          formData.deliveryMethod === "pickup"
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          handleInputChange("deliveryMethod", "pickup");
                          calculatePrice();
                        }}
                      >
                        <CardContent className="pt-6 text-center">
                          <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                          <h3 className="font-semibold text-lg mb-2">
                            📍 Campus Pickup
                          </h3>
                          <p className="text-muted-foreground mb-2">
                            Pick up from helper's location on campus
                          </p>
                          <Badge variant="outline">Free</Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Confirm */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      📋 Review Your Order
                    </Label>

                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Student Name</p>
                          <p className="font-medium">{formData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">WhatsApp</p>
                          <p className="font-medium">{formData.whatsapp}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Subject/Branch
                          </p>
                          <p className="font-medium">{formData.branch}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Academic Year</p>
                          <p className="font-medium">{formData.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pages</p>
                          <p className="font-medium">{formData.pages} pages</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Deadline</p>
                          <p className="font-medium">
                            {new Date(formData.deadline).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Delivery Address
                          </p>
                          <p className="font-medium">
                            {formData.hostel}, Room {formData.room}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Delivery Method
                          </p>
                          <p className="font-medium">
                            {formData.deliveryMethod === "hostel_delivery"
                              ? "🏠 Hostel Delivery"
                              : "📍 Campus Pickup"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Files Uploaded
                          </p>
                          <p className="font-medium">
                            {uploadedFiles.length} files
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Special Options
                          </p>
                          <p className="font-medium">
                            {formData.urgent && "Urgent, "}
                            {formData.matchHandwriting && "Handwriting Match, "}
                            {!formData.urgent &&
                              !formData.matchHandwriting &&
                              "None"}
                          </p>
                        </div>
                      </div>

                      {formData.notes && (
                        <div>
                          <p className="text-sm text-gray-600">
                            Special Instructions
                          </p>
                          <p className="font-medium">{formData.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Price Display */}
              {calculatedPrice > 0 && (
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{calculatedPrice}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Base: ₹
                    {parseInt(formData.pages || "0") *
                      (formData.urgent ? 15 : 10)}{" "}
                    •{formData.matchHandwriting && " Handwriting Match: ₹20 •"}
                    {formData.deliveryMethod === "hostel_delivery" &&
                      " Delivery: ₹10"}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !user}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {!user && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">
                    Please{" "}
                    <Button
                      variant="link"
                      onClick={() => navigate("/auth")}
                      className="p-0 h-auto"
                    >
                      log in
                    </Button>{" "}
                    to submit your assignment request.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white/60">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
            💸 Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <Calculator className="w-12 h-12 text-kiit-green mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">₹10/page</h3>
                <p className="text-muted-foreground">Standard delivery</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center border-kiit-green">
              <CardContent className="pt-6">
                <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">₹15/page</h3>
                <p className="text-muted-foreground">Urgent (24 hrs)</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <PenTool className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">+₹20</h3>
                <p className="text-muted-foreground">Handwriting match</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-center mt-8 text-muted-foreground">
            + ₹10 delivery fee (pickup also available for free)
          </p>
        </div>
      </section>

      {/* Meet the Writers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
            🧑‍💼 Meet the Writers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {writers.map((writer, index) => (
              <Card
                key={index}
                className="glass-card hover:scale-105 transition-transform"
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-kiit-green to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                    {writer.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-lg">{writer.name}</h3>
                  <p className="text-muted-foreground">
                    {writer.year} • {writer.course}
                  </p>
                  <div className="flex justify-center items-center gap-1 my-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{writer.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {writer.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    {writer.sample}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center mt-8 text-muted-foreground italic">
            "All writers are KIIT students. We review all work before sending it
            to you."
          </p>
        </div>
      </section>

      {/* Why This Works */}
      <section className="py-16 bg-white/60">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
            🧠 Why This Works
          </h2>
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card mb-8">
              <CardContent className="pt-6">
                <blockquote className="text-xl italic text-center text-muted-foreground mb-4">
                  "I was totally overwhelmed with 5 assignments due the same
                  week. This service saved my semester!"
                </blockquote>
                <p className="text-center font-semibold">
                  — 2nd Year CSE Student
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-3xl font-bold text-kiit-green mb-2">
                  1,000+
                </h3>
                <p className="text-muted-foreground">Assignments completed</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-blue-500 mb-2">200+</h3>
                <p className="text-muted-foreground">Verified writers</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-500 mb-2">90%</h3>
                <p className="text-muted-foreground">Student satisfaction</p>
              </div>
            </div>

            <div className="mt-12 space-y-4 text-center">
              <p className="text-lg">
                Perfect for when you're unwell, overbooked, or stuck with other
                work.
              </p>
              <p className="text-lg font-semibold">
                No AI, no copy-paste — just real handwritten work.
              </p>
              <blockquote className="text-lg italic text-muted-foreground mt-8">
                "Wrote for 3 hours, forgot to write my own." – A satisfied user
                😅
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
            🙋 FAQs
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Delivery Options */}
      <section className="py-16 bg-white/60">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
            📦 Delivery Options
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <Truck className="w-12 h-12 text-kiit-green mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">
                  📬 To your hostel room
                </h3>
                <p className="text-muted-foreground">Extra ₹10</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">📍 Campus pickup</h3>
                <p className="text-muted-foreground">Free</p>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <MessageCircle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">📸 WhatsApp preview</h3>
                <p className="text-muted-foreground">Before delivery</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-center mt-8 text-xl font-semibold text-kiit-green">
            "You'll never miss a deadline again."
          </p>
        </div>
      </section>

      {/* Become a Writer */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto glass-card text-center">
            <CardContent className="pt-8">
              <h2 className="text-4xl font-bold mb-6 text-gradient">
                🙌 Love Handwriting? Earn with Us
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                We're looking for neat writers who want to earn ₹8–₹12 per page.
                Flexible, chill work.
              </p>
              <Button
                size="lg"
                className="gradient-primary text-white px-8 py-4 text-lg"
              >
                Join as a Writer
                <Coffee className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sticky WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600 text-white shadow-lg">
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default HandwrittenAssignments;
