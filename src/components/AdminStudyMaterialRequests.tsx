import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle, FileText, Clock, User, Calendar } from "lucide-react";

interface StudyMaterialRequest {
  id: string;
  title: string;
  subject: string;
  semester: string;
  branch: string | null;
  year: string | null;
  folder_type: string;
  uploader_name: string;
  filename: string;
  storage_path: string;
  filesize: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  admin_comment: string | null;
}

interface AdminStudyMaterialRequestsProps {
  adminUserId: string;
}

export function AdminStudyMaterialRequests({ adminUserId }: AdminStudyMaterialRequestsProps) {
  const [requests, setRequests] = useState<StudyMaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<StudyMaterialRequest | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
    // Optionally, you can implement polling or SSE for real-time updates
    // For now, just fetch on mount and when statusFilter changes
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all'
        ? '/api/admin/study-material-requests'
        : `/api/admin/study-material-requests?status=${statusFilter}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const result = await response.json();
      setRequests(result.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (request: StudyMaterialRequest) => {
    try {
      const response = await fetch(`/api/admin/study-material-preview-url?path=${encodeURIComponent(request.storage_path)}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to get preview URL');
      const result = await response.json();
      setPreviewUrl(result.signedUrl);
      setSelectedRequest(request);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to load preview');
    }
  };
  const handleApprove = async (requestId: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/study-material-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ request_id: requestId, adminUserId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to approve material');
      }
      toast.success('✅ Material approved and added to public site!');
      setSelectedRequest(null);
      setPreviewUrl(null);
      fetchRequests();
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error(error.message || 'Failed to approve material');
    } finally {
      setProcessing(false);
    }
  };


  const handleReject = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/study-material-reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ request_id: selectedRequest.id, admin_comment: rejectReason }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to reject material');
      }
      toast.success('Material request rejected');
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setPreviewUrl(null);
      setRejectReason("");
      fetchRequests();
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error(error.message || 'Failed to reject material');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      approved: "bg-green-500/10 text-green-600 border-green-500/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20"
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getFolderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      notes: "Notes",
      pyqs: "PYQs",
      ppts: "PPTs",
      ebooks: "E-Books"
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Study Material Requests</h2>
          <p className="text-muted-foreground">Review and approve submitted materials</p>
        </div>

        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{request.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className={getStatusBadge(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge variant="secondary">
                            {getFolderTypeLabel(request.folder_type)}
                          </Badge>
                          <Badge variant="outline">{request.semester} Sem</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mt-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>By: {request.uploader_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Subject: {request.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{request.filename}</span>
                      </div>
                    </div>

                    {request.admin_comment && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Admin Comment:</p>
                        <p className="text-sm text-muted-foreground">{request.admin_comment}</p>
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <Button
                        onClick={() => handlePreview(request)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        onClick={() => handleApprove(request.id)}
                        size="sm"
                        disabled={processing}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectDialog(true);
                        }}
                        variant="destructive"
                        size="sm"
                        disabled={processing}
                        className="w-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => {
        setPreviewUrl(null);
        setSelectedRequest(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview: {selectedRequest?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] border rounded-lg"
                title="Material Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Material Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for rejection</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this material is being rejected..."
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing || !rejectReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}