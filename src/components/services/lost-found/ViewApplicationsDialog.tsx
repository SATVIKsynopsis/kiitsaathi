import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Calendar, Phone, Mail, User, CheckCircle, X, Clock, CreditCard } from "lucide-react";
import ApplicationPaymentComponent from "@/components/ApplicationPaymentComponent";

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  found_photo_url: string;
  found_description: string;
  found_location: string;
  found_date: string;
  status: string;
  created_at: string;
  paid_at?: string;
  payment_id?: string;
}

interface ViewApplicationsDialogProps {
  lostItemId: string;
  lostItemTitle: string;
  ownerUserId: string;
  open: boolean;
  onClose: () => void;
}

export const ViewApplicationsDialog: React.FC<ViewApplicationsDialogProps> = ({
  lostItemId,
  lostItemTitle,
  ownerUserId,
  open,
  onClose
}) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState<{ application: Application | null; open: boolean }>({
    application: null,
    open: false,
  });

  useEffect(() => {
    if (open) {
      fetchApplications();
    }
  }, [open, lostItemId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lost_found_applications')
        .select('*')
        .eq('lost_item_id', lostItemId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error loading applications",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockContact = (application: Application) => {
    if (application.status === 'paid') {
      toast({
        title: "Already Unlocked",
        description: "You have already unlocked this applicant's contact details.",
      });
      return;
    }

    setShowPayment({ application, open: true });
  };

  const handlePaymentSuccess = async () => {
    if (showPayment.application) {
      // Refresh applications to show updated payment status
      await fetchApplications();
      setShowPayment({ application: null, open: false });
      
      toast({
        title: "Contact Details Unlocked! 🎉",
        description: "You can now see the applicant's contact information below.",
        duration: 5000,
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              📋 Applications for: {lostItemTitle}
            </DialogTitle>
            <DialogDescription>
              {applications.length} {applications.length === 1 ? 'person has' : 'people have'} applied for this item
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground">
                When someone finds your item and applies, you'll see their submission here.
              </p>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {applications.map((application) => (
                <Card key={application.id} className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          📸 Application from{' '}
                          {application.status === 'paid' ? (
                            <span className="text-blue-600">{application.applicant_name}</span>
                          ) : (
                            <span className="text-muted-foreground">Hidden (Pay to reveal)</span>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Applied {new Date(application.created_at).toLocaleDateString()} at{' '}
                          {new Date(application.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge
                        variant={application.status === 'paid' ? 'default' : 'secondary'}
                        className={application.status === 'paid' ? 'bg-green-500' : ''}
                      >
                        {application.status === 'paid' ? '✅ Unlocked' : '🔒 Locked'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Photo of Found Item */}
                    <div>
                      <h4 className="font-semibold mb-3 text-base">Photo of Found Item:</h4>
                      <div className="rounded-lg overflow-hidden shadow-md">
                        <img
                          src={application.found_photo_url}
                          alt="Found item"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-semibold mb-2 text-base">Description:</h4>
                      <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">
                        {application.found_description}
                      </p>
                    </div>

                    {/* Location and Date Found */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-md">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Location Found</p>
                          <p className="text-muted-foreground">{application.found_location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-md">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Date Found</p>
                          <p className="text-muted-foreground">
                            {new Date(application.found_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details - Only shown after payment */}
                    {application.status === 'paid' ? (
                      <div className="border-2 border-green-200 rounded-xl bg-green-50 dark:bg-green-950/50 dark:border-green-800/50 p-4 shadow-inner">
                        <div className="flex items-center mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="font-bold text-green-800 dark:text-green-200">
                            Applicant Contact Details:
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">Name:</span>
                            <span className="text-green-800 dark:text-green-200">
                              {application.applicant_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">Email:</span>
                            <span className="text-green-800 dark:text-green-200">
                              {application.applicant_email}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">Phone:</span>
                            <span className="text-green-800 dark:text-green-200">
                              {application.applicant_phone}
                            </span>
                          </div>
                        </div>
                        {application.paid_at && (
                          <p className="text-xs text-muted-foreground mt-3">
                            Unlocked on {new Date(application.paid_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                          🔒 <span className="font-semibold">Contact details are hidden</span>
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                          If this looks like your item, pay ₹5 to unlock the applicant's contact information
                          and arrange collection.
                        </p>
                        <Button
                          onClick={() => handleUnlockContact(application)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 font-semibold"
                        >
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pay ₹5 & Unlock Contact Details
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog for unlocking specific applicant's contact */}
      {showPayment.open && showPayment.application && (
        <ApplicationPaymentComponent
          applicationId={showPayment.application.id}
          lostItemTitle={lostItemTitle}
          applicantName={showPayment.application.applicant_name}
          ownerUserId={ownerUserId}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={() => setShowPayment({ application: null, open: false })}
        />
      )}
    </>
  );
};
