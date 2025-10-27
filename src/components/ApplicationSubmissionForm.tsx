import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { X, ImageIcon, Upload, CheckCircle } from "lucide-react";

interface ApplicationSubmissionFormProps {
  lostItemId: string;
  lostItemTitle: string;
  lostItemOwnerEmail: string;
  currentUserEmail: string;
  currentUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplicationSubmissionForm: React.FC<ApplicationSubmissionFormProps> = ({
  lostItemId,
  lostItemTitle,
  lostItemOwnerEmail,
  currentUserEmail,
  currentUserId,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: currentUserEmail || '',
    applicantPhone: '',
    foundDescription: '',
    foundLocation: '',
    foundDate: ''
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ 
        title: "Invalid file type", 
        description: "Please select a JPG or PNG image.", 
        variant: "destructive" 
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('lostItemId', lostItemId);
    // You can add more fields if needed

    const response = await fetch(`${import.meta.env.VITE_HOSTED_URL}/api/upload-lost-found-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to upload image');
    }
    const result = await response.json();
    if (!result.publicUrl) throw new Error('No image URL returned');
    return result.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast({
        title: "Photo Required",
        description: "Please upload a photo of the found item.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Upload image first
      const photoUrl = await uploadImage(selectedImage);

      // Submit application to backend
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${import.meta.env.VITE_HOSTED_URL}/api/lostfound/submit-lost-item-application`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          lostItemId,
          lostItemTitle,
          lostItemOwnerEmail,
          applicantUserId: currentUserId,
          applicantName: formData.applicantName,
          applicantEmail: formData.applicantEmail,
          applicantPhone: formData.applicantPhone,
          foundPhotoUrl: photoUrl,
          foundDescription: formData.foundDescription,
          foundLocation: formData.foundLocation,
          foundDate: formData.foundDate
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Check for duplicate application error
        if (result.error && result.error.includes('duplicate') || result.error?.includes('already applied')) {
          toast({
            title: "Already Applied",
            description: "You have already submitted an application for this item. Please wait for the owner to review it.",
            variant: "destructive",
            duration: 6000,
          });
        } else {
          throw new Error(result.error || 'Failed to submit application');
        }
        return;
      }

      toast({
        title: "✅ Application Submitted!",
        description: "The item owner will receive an email with your photo and review your application.",
        duration: 5000,
      });

      onSuccess();
      onClose();

    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8 shadow-2xl border-0">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">📝 Apply for Lost Item</CardTitle>
              <CardDescription className="mt-2 text-base">
                Applying for: <span className="font-semibold text-foreground">{lostItemTitle}</span>
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={submitting}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload - REQUIRED */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Photo of Found Item <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                This photo will be sent to the item owner to confirm if this is their lost item.
              </p>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-3 right-3 shadow-lg"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    disabled={submitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="found-item-image"
                    required
                  />
                  <label htmlFor="found-item-image" className="cursor-pointer">
                    <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-base text-muted-foreground font-medium">Click to upload photo</p>
                    <p className="text-sm text-muted-foreground mt-1">(JPG/PNG, max 5MB)</p>
                  </label>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="foundDescription" className="text-base font-semibold mb-3 block">
                Description of Found Item <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="foundDescription"
                placeholder="Describe the item you found in detail..."
                value={formData.foundDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, foundDescription: e.target.value }))}
                required
                rows={4}
                className="text-base border-2 focus:border-primary/50"
                disabled={submitting}
              />
            </div>

            {/* Location and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="foundLocation" className="text-base font-semibold mb-3 block">
                  Where did you find it? <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="foundLocation"
                  placeholder="e.g., Food Court, Library"
                  value={formData.foundLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, foundLocation: e.target.value }))}
                  required
                  className="h-12 text-base border-2 focus:border-primary/50"
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="foundDate" className="text-base font-semibold mb-3 block">
                  When did you find it? <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="foundDate"
                  type="date"
                  value={formData.foundDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, foundDate: e.target.value }))}
                  required
                  className="h-12 text-base border-2 focus:border-primary/50"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h4 className="font-bold text-lg mb-4">Your Contact Information</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Your contact details will only be visible to the item owner after they confirm and pay ₹5.
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="applicantName" className="text-base font-semibold mb-3 block">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="applicantName"
                    placeholder="Your full name"
                    value={formData.applicantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicantName: e.target.value }))}
                    required
                    className="h-12 text-base border-2 focus:border-primary/50"
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="applicantEmail" className="text-base font-semibold mb-3 block">
                      Your Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="applicantEmail"
                      type="email"
                      placeholder="your.email@kiit.ac.in"
                      value={formData.applicantEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, applicantEmail: e.target.value }))}
                      required
                      className="h-12 text-base border-2 focus:border-primary/50"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="applicantPhone" className="text-base font-semibold mb-3 block">
                      Your Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="applicantPhone"
                      placeholder="Your phone number"
                      value={formData.applicantPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, applicantPhone: e.target.value }))}
                      required
                      className="h-12 text-base border-2 focus:border-primary/50"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="h-12 px-8 text-base font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-12 text-base font-semibold shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <>
                    <Upload className="w-5 h-5 mr-2 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
