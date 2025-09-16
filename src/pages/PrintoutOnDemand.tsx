import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Upload, Printer, TruckIcon, DollarSign, AlertTriangle, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HelperDashboard } from '@/components/HelperDashboard';
import { PrintJobCard } from '@/components/PrintJobCard';
import { PrintJobTester } from '@/components/PrintJobTester';
import { SystemStatus } from '@/components/SystemStatus';
import { usePrintJobManager } from '@/hooks/usePrintJobManager';
import { useAuth } from '@/hooks/useAuth';
import { GuestBrowsingBanner } from '@/components/GuestBrowsingBanner';

const PrintoutOnDemand = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createPrintJob, fetchJobs, isLoading } = usePrintJobManager();
  const [activeTab, setActiveTab] = useState('student');
  
  // Student form state
  const [formData, setFormData] = useState({
    studentName: '',
    studentContact: '',
    copies: 1,
    printType: 'black_white',
    paperSize: 'A4',
    bindingOption: '',
    deliveryLocation: '',
    deliveryTime: '',
    deliveryType: 'pickup',
    additionalNotes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [myJobs, setMyJobs] = useState<any[]>([]);

  // Load user's jobs
  const loadMyJobs = async () => {
    if (user) {
      const jobs = await fetchJobs({ helper_id: user.id });
      const userJobs = jobs.filter(job => job.user_id === user.id);
      setMyJobs(userJobs);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'orders') {
      loadMyJobs();
    }
  }, [user, activeTab]);

  const calculateCosts = () => {
    if (!pageCount || !formData.copies) return { printing: 0, service: 0, helper: 0, delivery: 0, total: 0 };
    
    const totalPages = pageCount * formData.copies;
    
    let printing, service, helper;
    if (formData.printType === 'black_white') {
      printing = totalPages * 5;
      service = totalPages * 5;
      helper = totalPages * 5;
    } else {
      printing = totalPages * 10;
      service = totalPages * 8;
      helper = totalPages * 7;
    }
    
    const delivery = formData.deliveryType === 'doorstep' ? 50 : 0;
    const total = printing + service + helper + delivery;
    
    return { printing, service, helper, delivery, total };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', { name: file.name, size: file.size, type: file.type });
      
      // File type validation
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // File size validation (20MB limit)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 20MB');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setSelectedFile(file);
      
      // Simulate page count calculation - in production, you'd use a PDF parsing library
      if (file.type === 'application/pdf') {
        // For now, estimate based on file size (rough approximation)
        const estimatedPages = Math.max(1, Math.floor(file.size / (100 * 1024))); // ~100KB per page
        setPageCount(Math.min(estimatedPages, 50)); // Cap at 50 pages for safety
        console.log('Estimated page count:', estimatedPages);
      } else {
        setPageCount(1);
      }
      
      toast.success('File uploaded successfully! 📄');
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', { formData, selectedFile, pageCount, privacyAccepted });
    
    if (!selectedFile) {
      toast.error('Please select a PDF file to print');
      return;
    }

    if (!privacyAccepted) {
      toast.error('Please acknowledge the privacy notice to continue');
      return;
    }

    if (!user) {
      toast.error('Please sign in to submit print jobs');
      return;
    }

    // Validate required fields
    if (!formData.studentName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!formData.studentContact.trim()) {
      toast.error('Please enter your contact number');
      return;
    }

    if (!formData.deliveryLocation.trim()) {
      toast.error('Please enter delivery/pickup location');
      return;
    }

    const costs = calculateCosts();
    
    const jobData = {
      file_name: selectedFile.name,
      file_size: selectedFile.size,
      page_count: pageCount,
      copies: formData.copies,
      print_type: formData.printType,
      paper_size: formData.paperSize,
      binding_option: formData.bindingOption || null,
      delivery_location: formData.deliveryLocation,
      delivery_time: formData.deliveryTime || null,
      delivery_type: formData.deliveryType,
      delivery_fee: costs.delivery,
      additional_notes: formData.additionalNotes || null,
      student_name: formData.studentName,
      student_contact: formData.studentContact,
      total_cost: costs.total,
      printing_cost: costs.printing,
      service_fee: costs.service,
      helper_fee: costs.helper,
      privacy_acknowledged: true
    };

    console.log('Submitting job with calculated costs:', costs);
    console.log('Final job data:', jobData);

    const success = await createPrintJob(jobData, selectedFile);
    
    if (success) {
      // Reset form on success
      setFormData({
        studentName: '',
        studentContact: '',
        copies: 1,
        printType: 'black_white',
        paperSize: 'A4',
        bindingOption: '',
        deliveryLocation: '',
        deliveryTime: '',
        deliveryType: 'pickup',
        additionalNotes: ''
      });
      setSelectedFile(null);
      setPageCount(0);
      setPrivacyAccepted(false);
      
      // Switch to orders tab to see the job
      setActiveTab('orders');
      // Reload user jobs
      if (user) {
        setTimeout(() => {
          loadMyJobs();
        }, 1000); // Give time for the job to be created
      }
    }
  };

  const costs = calculateCosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-campus-blue/20 via-background to-campus-purple/20">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-campus-blue mb-6 animate-fade-in">
            🖨️ Printouts on Demand
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            Too lazy to go out? Send a PDF, get it printed & delivered!
          </p>
        </div>
      </section>

      {/* Debug Tools - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <section className="container mx-auto px-4 mb-8">
          <div className="max-w-4xl mx-auto">
            <PrintJobTester />
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* System Status Check */}
          <div className="mb-8">
            <SystemStatus />
          </div>
          
          {/* Debug Tools - Visible for logged in users */}
          {user && (
            <div className="mb-8">
              <PrintJobTester />
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Request a Print
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                My Orders
              </TabsTrigger>
              <TabsTrigger value="helper" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Help & Earn
              </TabsTrigger>
            </TabsList>

            {/* Student Tab */}
            <TabsContent value="student" className="space-y-8">
              <GuestBrowsingBanner 
                message="Explore our printing service and calculate costs"
                action="sign in to upload files and place orders"
                className="mb-6"
              />
              
              {/* Privacy Notice */}
              <Card className="glassmorphism border-red-200 bg-red-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-2">⚠️ Privacy & Confidentiality Notice</h3>
                      <p className="text-red-700 mb-4">
                        <strong>Please do not share confidential or sensitive documents with anonymous helpers.</strong> 
                        The platform is not responsible for any data leaks. Files are securely stored and only accessible 
                        to the assigned helper after job acceptance. Access is automatically revoked after completion.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="privacy-terms" 
                          checked={privacyAccepted}
                          onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                        />
                        <Label htmlFor="privacy-terms" className="text-sm text-red-700">
                          I understand and acknowledge this privacy notice
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Order Form */}
                 <Card className="glassmorphism">
                   <CardHeader>
                     <CardTitle className="text-campus-blue">Order Details</CardTitle>
                     <CardDescription>
                       {user ? "Fill in your print requirements" : "Sign in to submit print orders"}
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                       <form onSubmit={handleStudentSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="studentName">Full Name</Label>
                            <Input
                              id="studentName"
                              required
                              value={formData.studentName}
                              onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="studentContact">Contact Number</Label>
                            <Input
                              id="studentContact"
                              type="tel"
                              required
                              value={formData.studentContact}
                              onChange={(e) => setFormData({...formData, studentContact: e.target.value})}
                              placeholder="+91 9876543210"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="file">Upload PDF File (Max 20MB)</Label>
                          <Input
                            id="file"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                            required
                          />
                          {selectedFile && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 text-green-800">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-sm font-medium">✅ {selectedFile.name}</p>
                              </div>
                              <p className="text-sm text-green-600 mt-1">
                                Pages: {pageCount} | Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              {selectedFile.type === 'application/pdf' && (
                                <p className="text-xs text-green-500 mt-1">
                                  PDF ready for printing
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="copies">Number of Copies</Label>
                            <Input
                              id="copies"
                              type="number"
                              min="1"
                              max="50"
                              value={formData.copies}
                              onChange={(e) => setFormData({...formData, copies: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label>Print Type</Label>
                            <Select value={formData.printType} onValueChange={(value) => setFormData({...formData, printType: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="black_white">Black & White (₹15/page)</SelectItem>
                                <SelectItem value="color">Color (₹25/page)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Paper Size</Label>
                            <Select value={formData.paperSize} onValueChange={(value) => setFormData({...formData, paperSize: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A4">A4</SelectItem>
                                <SelectItem value="A3">A3</SelectItem>
                                <SelectItem value="Letter">Letter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="bindingOption">Binding Option (Optional)</Label>
                            <Input
                              id="bindingOption"
                              value={formData.bindingOption}
                              onChange={(e) => setFormData({...formData, bindingOption: e.target.value})}
                              placeholder="e.g., Spiral binding"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Delivery Type</Label>
                          <Select value={formData.deliveryType} onValueChange={(value) => setFormData({...formData, deliveryType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pickup">Pickup from Helper's Location (Free)</SelectItem>
                              <SelectItem value="doorstep">Doorstep Delivery (+₹50)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="deliveryLocation">
                              {formData.deliveryType === 'pickup' ? 'Pickup Location' : 'Delivery Location'}
                            </Label>
                            <Input
                              id="deliveryLocation"
                              required
                              value={formData.deliveryLocation}
                              onChange={(e) => setFormData({...formData, deliveryLocation: e.target.value})}
                              placeholder={formData.deliveryType === 'pickup' ? "Preferred pickup area" : "e.g., Hostel 1, Room 205"}
                            />
                          </div>
                          <div>
                            <Label htmlFor="deliveryTime">Preferred Time</Label>
                            <Input
                              id="deliveryTime"
                              value={formData.deliveryTime}
                              onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                              placeholder="e.g., After 6 PM"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                          <Textarea
                            id="additionalNotes"
                            value={formData.additionalNotes}
                            onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                            placeholder="Any special instructions..."
                            rows={3}
                          />
                        </div>

                            <Button 
                              type="submit" 
                              className="w-full py-6 text-lg bg-gradient-to-r from-campus-blue to-campus-purple hover:from-campus-blue/90 hover:to-campus-purple/90"
                              disabled={isLoading || !selectedFile || !privacyAccepted || !user}
                            >
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Submitting Print Job...
                                </div>
                              ) : !user ? (
                                'Sign In to Submit Order'
                              ) : !selectedFile ? (
                                'Please Upload PDF File'
                              ) : !privacyAccepted ? (
                                'Accept Privacy Notice First'
                              ) : (
                                <>
                                  🖨️ Submit Print Job (₹{costs.total})
                                </>
                              )}
                            </Button>
                           
                           {/* Debug info - remove in production */}
                           {process.env.NODE_ENV === 'development' && (
                             <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                               Debug: User: {user ? '✓' : '✗'} | File: {selectedFile ? '✓' : '✗'} | Privacy: {privacyAccepted ? '✓' : '✗'} | Loading: {isLoading ? '✓' : '✗'}
                             </div>
                           )}
                       </form>
                   </CardContent>
                </Card>

                {/* Order Summary */}
                <div className="space-y-6">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="text-campus-blue">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedFile ? (
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>File:</span>
                            <span className="font-medium">{selectedFile.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pages:</span>
                            <span className="font-medium">{pageCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Copies:</span>
                            <span className="font-medium">{formData.copies}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Pages:</span>
                            <span className="font-medium">{pageCount * formData.copies}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Print Type:</span>
                            <span className="font-medium">
                              {formData.printType === 'black_white' ? 'Black & White' : 'Color'}
                            </span>
                          </div>
                          
                          <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Printing Cost:</span>
                              <span>₹{costs.printing}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Service Fee:</span>
                              <span>₹{costs.service}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Helper Fee:</span>
                              <span>₹{costs.helper}</span>
                            </div>
                            {costs.delivery > 0 && (
                              <div className="flex justify-between text-sm">
                                <span>Delivery Fee:</span>
                                <span>₹{costs.delivery}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                              <span>Total:</span>
                              <span className="text-campus-blue">₹{costs.total}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          Upload a file to see pricing
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glassmorphism">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 text-campus-blue">How It Works</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <Upload className="w-4 h-4 text-campus-blue" />
                          <span>Upload your file & fill details</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Printer className="w-4 h-4 text-campus-orange" />
                          <span>Helper prints your document</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <TruckIcon className="w-4 h-4 text-kiit-green" />
                          <span>Get it delivered to your location</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* My Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              {!user ? (
                <Card className="glassmorphism">
                  <CardContent className="p-8 text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                    <p className="text-muted-foreground mb-4">Please sign in to view your print orders</p>
                    <Button onClick={() => navigate('/auth')}>
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="text-campus-blue flex items-center gap-2">
                      <User className="w-5 h-5" />
                      My Print Orders
                    </CardTitle>
                    <CardDescription>
                      Track your print job orders and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myJobs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Printer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No orders yet</p>
                        <p className="text-sm">Submit your first print job to see it here!</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {myJobs.map((job) => (
                          <PrintJobCard
                            key={job.id}
                            job={job}
                            userType="customer"
                          />
                        ))}
                      </div>
                    )}
                   </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Helper Tab */}
            <TabsContent value="helper" className="space-y-8">
              {!user ? (
                <Card className="glassmorphism">
                  <CardContent className="p-8 text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                    <p className="text-muted-foreground mb-4">Please sign in to start helping and earning</p>
                    <Button onClick={() => navigate('/auth')}>
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <HelperDashboard />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PrintoutOnDemand;