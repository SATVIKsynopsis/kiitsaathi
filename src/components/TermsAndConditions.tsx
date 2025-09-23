import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface TermsAndConditionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  serviceName?: string;
}

export function TermsAndConditions({ open, onOpenChange, onAccept, serviceName }: TermsAndConditionsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-gradient flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Terms and Conditions - KIIT Saathi
          </DialogTitle>
          <DialogDescription>
            Please read and accept our terms before proceeding with {serviceName || 'this service'}.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">1. Service Overview</h3>
              <p className="text-muted-foreground mb-3">
                KIIT Saathi is an unofficial student initiative platform providing various services to KIIT University students including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>KIIT Saathi AI Assistant for campus guidance</li>
                <li>Study Material access (PYQs, Notes, YouTube Videos)</li>
                <li>Lost & Found Portal for campus items</li>
                <li>Interactive Campus Map with navigation</li>
                <li>KIIT Societies, Fests, and Sports information</li>
                <li>Resume Saathi for resume building</li>
                <li>SplitSaathi for group expense management</li>
                <li>SGPA & CGPA Calculator</li>
                <li>Other campus utility services</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">2. User Eligibility & Authentication</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Only students with valid KIIT College email IDs (@kiit.ac.in) are allowed to access our services.</p>
                <p>• Users must provide accurate and up-to-date information during registration.</p>
                <p>• Account sharing or misuse of credentials is strictly prohibited.</p>
                <p>• KIIT Saathi reserves the right to suspend accounts for policy violations.</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">3. Service Availability & Limitations</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Services are provided on an "as-is" basis without warranties of any kind.</p>
                <p>• We strive for 99% uptime but cannot guarantee uninterrupted service availability.</p>
                <p>• Some services may have usage limits or require payment for premium features.</p>
                <p>• Service features may be updated, modified, or discontinued with prior notice.</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">4. User Responsibilities</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Users are responsible for maintaining the confidentiality of their account information.</p>
                <p>• Prohibited activities include: spam, harassment, copyright infringement, or illegal content.</p>
                <p>• Users must respect other students' privacy and intellectual property rights.</p>
                <p>• Any misuse of the platform may result in immediate account termination.</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">5. Payment & Refunds</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• All payments are processed securely through Razorpay payment gateway.</p>
                <p>• Refund eligibility and processing follow Razorpay's standard refund policy.</p>
                <p>• Service-specific refund terms may apply for certain premium features.</p>
                <p>• Processing fees may be deducted from refund amounts as per gateway policies.</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">6. Static Features Disclaimer</h3>
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="space-y-2 text-amber-800 dark:text-amber-200">
                    <p className="font-medium">Important Notice for Static Features:</p>
                    <p>• Campus Map locations and information are based on available data and may not be 100% accurate.</p>
                    <p>• Society information, fest details, and sports schedules are updated periodically but may not reflect real-time changes.</p>
                    <p>• Users should verify critical information independently before making decisions.</p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">7. Limitation of Liability</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• KIIT Saathi is not liable for any direct, indirect, or consequential damages arising from service use.</p>
                <p>• We are not responsible for decisions made based on information provided through our platform.</p>
                <p>• Maximum liability is limited to the amount paid for premium services, if any.</p>
                <p>• Users acknowledge that they use the service at their own risk.</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">8. Modifications & Updates</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• These terms may be updated periodically with advance notice to users.</p>
                <p>• Continued use of services after term updates constitutes acceptance of new terms.</p>
                <p>• Major changes will be communicated via email or platform notifications.</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">9. Contact Information</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>For questions, concerns, or support:</p>
                <p>• Email: official@kiitsaathi.in</p>
                <p>• Phone: +91 9717008778</p>
                <p>• Address: KIIT University, Bhubaneswar, Odisha</p>
              </div>
            </section>

            <div className="text-xs text-muted-foreground mt-6 p-4 bg-muted/50 rounded-lg">
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
              <p>By proceeding, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAccept} className="gradient-primary text-white">
            I Accept Terms & Conditions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}