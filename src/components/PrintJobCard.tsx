import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, MapPin, Clock, FileText, User, Phone, Mail, MessageCircle } from 'lucide-react';

interface PrintJobCardProps {
  job: any;
  userType: 'customer' | 'helper';
  onAccept?: (jobId: string) => void;
  onUpdateStatus?: (jobId: string, status: string) => void;
  onDownload?: (filePath: string, fileName: string) => void;
  onSendToShopkeeper?: (jobId: string, method: 'email' | 'whatsapp') => void;
  onMarkCompleted?: (jobId: string, userType: 'customer' | 'helper') => void;
  isLoading?: boolean;
}

export function PrintJobCard({ 
  job, 
  userType, 
  onAccept, 
  onUpdateStatus, 
  onDownload,
  onSendToShopkeeper,
  onMarkCompleted,
  isLoading = false 
}: PrintJobCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      accepted: 'bg-blue-500',
      picked: 'bg-purple-500',
      printing: 'bg-orange-500',
      ready_for_pickup: 'bg-green-500',
      delivered: 'bg-green-600',
      completed: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pending',
      accepted: 'Accepted',
      picked: 'Picked Up',
      printing: 'Printing',
      ready_for_pickup: 'Ready for Pickup',
      delivered: 'Delivered',
      completed: 'Completed'
    };
    return texts[status] || status;
  };

  const canShowContact = userType === 'helper' && ['accepted', 'picked', 'printing', 'ready_for_pickup', 'delivered'].includes(job.status);

  return (
    <Card className="glassmorphism hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-campus-blue" />
              {job.file_name}
            </CardTitle>
            <CardDescription className="mt-1">
              {job.page_count} pages • {job.copies} copies • {job.print_type === 'black_white' ? 'B&W' : 'Color'}
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(job.status)} text-white`}>
            {getStatusText(job.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Paper Size:</span>
            <p>{job.paper_size}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Total Cost:</span>
            <p className="font-bold text-campus-blue">₹{job.total_cost}</p>
          </div>
        </div>

        {/* Location & Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Delivery:</span>
            <span>{job.delivery_location}</span>
          </div>
          {job.delivery_time && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Preferred Time:</span>
              <span>{job.delivery_time}</span>
            </div>
          )}
        </div>

        {/* Contact Info (for helpers only) */}
        {canShowContact && (
          <div className="p-3 bg-campus-blue/10 rounded-lg space-y-2">
            <h4 className="font-medium text-campus-blue">Contact Information</h4>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              <span>{job.student_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" />
              <span>{job.student_contact}</span>
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {job.additional_notes && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <span className="font-medium text-sm">Notes:</span>
            <p className="text-sm mt-1">{job.additional_notes}</p>
          </div>
        )}

        {/* Binding Option */}
        {job.binding_option && (
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Binding:</span>
            <span className="ml-2">{job.binding_option}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {/* Helper Actions */}
          {userType === 'helper' && (
            <>
              {job.status === 'pending' && onAccept && (
                <Button 
                  onClick={() => onAccept(job.id)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Accept Job
                </Button>
              )}
              
              {job.status === 'accepted' && (
                <div className="flex gap-2 w-full flex-wrap">
                  {onDownload && job.file_storage_path && (
                    <Button
                      variant="outline"
                      onClick={() => onDownload(job.file_storage_path!, job.file_name)}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  )}
                  
                  {/* Shopkeeper Integration Options */}
                  {onSendToShopkeeper && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => onSendToShopkeeper(job.id, 'email')}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                        title="Send file to shopkeeper via email"
                      >
                        <Mail className="w-4 h-4" />
                        Email Shop
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => onSendToShopkeeper(job.id, 'whatsapp')}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                        title="Send file to shopkeeper via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp Shop
                      </Button>
                    </>
                  )}
                  
                  {onUpdateStatus && (
                    <Button
                      onClick={() => onUpdateStatus(job.id, 'printing')}
                      disabled={isLoading}
                      className="flex-1 min-w-fit"
                    >
                      Start Printing
                    </Button>
                  )}
                </div>
              )}

              {job.status === 'printing' && onUpdateStatus && (
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => onUpdateStatus(job.id, 'ready_for_pickup')}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    Ready for Pickup
                  </Button>
                  <Button
                    onClick={() => onUpdateStatus(job.id, 'delivered')}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Mark Delivered
                  </Button>
                </div>
              )}

              {(job.status === 'ready_for_pickup' || job.status === 'delivered') && onMarkCompleted && (
                <Button
                  onClick={() => onMarkCompleted(job.id, 'helper')}
                  disabled={isLoading}
                  className="w-full"
                  variant={job.helper_completed ? "secondary" : "default"}
                >
                  {job.helper_completed ? '✓ You Confirmed' : 'Mark Completed'}
                </Button>
              )}
            </>
          )}

          {/* Customer Actions */}
          {userType === 'customer' && (
            <>
              {/* Customer can mark as completed when delivered */}
              {(job.status === 'ready_for_pickup' || job.status === 'delivered') && onMarkCompleted && (
                <Button
                  onClick={() => onMarkCompleted(job.id, 'customer')}
                  disabled={isLoading}
                  className="w-full"
                  variant={job.customer_completed ? "secondary" : "default"}
                >
                  {job.customer_completed ? '✓ You Confirmed' : 'Mark Completed'}
                </Button>
              )}
              
              {/* Show completion status */}
              {job.status === 'completed' && job.file_deleted_at && (
                <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-green-800 font-medium">✅ Job Completed!</p>
                  <p className="text-sm text-green-600">File has been permanently deleted for privacy</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Privacy Notice for pending jobs */}
        {job.status === 'pending' && userType === 'helper' && (
          <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
            📄 File access is granted only after accepting the job
          </div>
        )}

        {/* Delivery Fee Info */}
        {job.delivery_fee > 0 && (
          <div className="text-sm bg-green-50 p-2 rounded">
            <span className="font-medium text-green-700">Delivery Fee:</span>
            <span className="ml-2 font-bold">₹{job.delivery_fee}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}