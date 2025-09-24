import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield, Database, Eye, Trash2 } from 'lucide-react';

interface PrivacyPolicyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  isFirstTime?: boolean;
}

export function PrivacyPolicy({ open, onOpenChange, onAccept, isFirstTime = false }: PrivacyPolicyProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-gradient flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Policy - KIIT Saathi
          </DialogTitle>
          <DialogDescription>
            {isFirstTime 
              ? "Welcome! Please review our privacy policy before continuing." 
              : "Your privacy and data security are our top priorities."}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                1. Data Collection
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Personal Information We Collect:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>KIIT College email address (@kiit.ac.in) - required for authentication</li>
                  <li>Full name and basic profile information</li>
                  <li>Service usage data and preferences</li>
                  <li>IP address and device information for security purposes</li>
                  <li>Payment information (processed securely through Razorpay)</li>
                </ul>
                
                <p className="mt-3"><strong>Usage Analytics We Track:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Page visits and service usage patterns</li>
                  <li>Feature interaction and performance metrics</li>
                  <li>Error logs for debugging and improvement</li>
                  <li>Anonymous user behavior for platform optimization</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">2. How We Use Your Data</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• <strong>Service Provision:</strong> To provide and maintain our campus services</p>
                <p>• <strong>Authentication:</strong> To verify your KIIT student status and secure access</p>
                <p>• <strong>Communication:</strong> To send service updates, notifications, and support responses</p>
                <p>• <strong>Improvement:</strong> To analyze usage patterns and enhance user experience</p>
                <p>• <strong>Security:</strong> To detect fraud, abuse, and maintain platform integrity</p>
                <p>• <strong>Legal Compliance:</strong> To meet legal obligations and protect user rights</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                3. Data Access and Sharing
              </h3>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="space-y-2 text-green-800 dark:text-green-200">
                    <p className="font-medium">Our Privacy Commitment:</p>
                    <p>• We NEVER sell, rent, or trade your personal data to third parties</p>
                    <p>• Data access is strictly limited to authorized KIIT Saathi team members</p>
                    <p>• All data is encrypted and stored securely on trusted cloud infrastructure</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Limited Data Sharing Scenarios:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>With your explicit consent for specific features</li>
                  <li>To comply with legal requirements or court orders</li>
                  <li>To protect our rights, privacy, safety, or property</li>
                  <li>With service providers who assist our operations (under strict confidentiality)</li>
                </ul>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">4. Data Storage and Security</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• <strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard protocols</p>
                <p>• <strong>Storage:</strong> Data is stored on secure cloud servers with regular backups</p>
                <p>• <strong>Access Control:</strong> Multi-factor authentication and role-based access for team members</p>
                <p>• <strong>Monitoring:</strong> Continuous security monitoring and threat detection</p>
                <p>• <strong>Retention:</strong> Data is retained only as long as necessary for service provision</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                5. Your Rights and Choices
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>You have the right to:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Access and review your personal data</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your account and associated data</li>
                  <li>Opt-out of non-essential communications</li>
                  <li>Download your data in a portable format</li>
                  <li>Withdraw consent for data processing (may limit service access)</li>
                </ul>
                
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
                  <p className="text-blue-800 dark:text-blue-200">
                    <strong>To exercise these rights:</strong> Contact us at official@kiitsaathi.in with your request. 
                    We will respond within 30 days and may require identity verification.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">6. Cookies and Tracking</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• <strong>Essential Cookies:</strong> Required for authentication and core functionality</p>
                <p>• <strong>Analytics Cookies:</strong> Help us understand usage patterns (anonymized)</p>
                <p>• <strong>Preference Cookies:</strong> Remember your settings and preferences</p>
                <p>• <strong>Third-party Services:</strong> Razorpay for payments, Google OAuth for authentication</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">7. Updates to This Policy</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• We may update this privacy policy to reflect changes in our practices or legal requirements</p>
                <p>• Significant changes will be communicated via email and platform notifications</p>
                <p>• Continued use of our services after updates constitutes acceptance of the revised policy</p>
                <p>• You will be prompted to review and accept major policy changes</p>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-lg font-semibold text-gradient mb-3">8. Contact Us</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>For privacy-related questions, concerns, or requests:</p>
                <p>• Email: official@kiitsaathi.in</p>
                <p>• Phone: +91 9717008778</p>
                <p>• Address: KIIT University, Bhubaneswar, Odisha</p>
              </div>
            </section>

            <div className="text-xs text-muted-foreground mt-6 p-4 bg-muted/50 rounded-lg">
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
              <p>By using KIIT Saathi, you acknowledge that you have read, understood, and agree to this Privacy Policy.</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4">
          {!isFirstTime && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
          <Button onClick={onAccept} className="gradient-primary text-white">
            {isFirstTime ? "I Accept Privacy Policy" : "Understood"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}