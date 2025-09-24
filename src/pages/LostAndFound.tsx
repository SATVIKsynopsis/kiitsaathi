import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, MapPin, Calendar, Upload, Phone, Mail, CheckCircle, Filter,
  Plus, Heart, Star, Camera, Clock, X, ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { useSecureLostAndFound } from "@/hooks/useSecureLostAndFound";
import { DatabaseErrorFallback } from "@/components/DatabaseErrorFallback";
import { supabase } from "@/integrations/supabase/client";
import { GuestBrowsingBanner } from "@/components/GuestBrowsingBanner";
import { useAuth } from "@/hooks/useAuth";
import  PaymentComponent  from "@/components/PaymentComponent";

interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  category: string;
  item_type: 'lost' | 'found';
  image_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  marked_complete_at?: string;
}

interface FormData {
  title: string;
  description: string;
  location: string;
  date: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  category: string;
  item_type: 'lost' | 'found';
}

const testimonials = [
  { text: "Lost my AirPods near Food Court — got them back in 2 hours!", author: "Rahul, CSE 3rd Year", icon: "🎧" },
  { text: "Someone found my file near Block 5. Thank you so much 💗", author: "Sneha, IT 2nd Year", icon: "📁" },
  { text: "This platform is amazing! Got my wallet back with everything intact.", author: "Arjun, ETC 4th Year", icon: "👛" }
];

const categories = ["Electronics", "ID Card", "Books & Stationery", "Accessories", "Miscellaneous"];

export default function LostAndFound() {
  const { user } = useAuth();
  const { items, loading, error, addItem, refreshItems } = useSecureLostAndFound();
  const { toast } = useToast();

  // FIX 1: Moved all state declarations to the top level of the component
  const [filteredItems, setFilteredItems] = useState<LostFoundItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState<{item: LostFoundItem | null, open: boolean}>({item: null, open: false});
  const [paidItems, setPaidItems] = useState<{[id: string]: boolean}>({});
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    location: "",
    date: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    category: "",
    item_type: "lost"
  });

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = items.filter(item => {
      const searchTermMatch = searchTerm 
        ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const categoryMatch = selectedCategory !== "all" ? item.category === selectedCategory : true;
      const typeMatch = selectedType !== "all" ? item.item_type === selectedType : true;
      const tabMatch = activeTab !== "all" ? item.item_type === activeTab : true;
      return searchTermMatch && categoryMatch && typeMatch && tabMatch;
    });
    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, selectedType, activeTab]);

  // Check payment status for all items when user logs in or items change
  useEffect(() => {
    const checkPaidItems = async () => {
      if (!user?.id) {
        setPaidItems({});
        return;
      }
      if (items.length > 0) {
        const paidItemsCheck: {[id: string]: boolean} = {};
        for (const item of items) {
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/has-paid-contact?user_id=${user.id}&item_id=${item.id}&item_title=${encodeURIComponent(item.title)}`);
            const result = await res.json();
            if (result.paid) {
              paidItemsCheck[item.id] = true;
            }
          } catch (err) {
            console.error(`Error checking payment for item ${item.id}:`, err);
          }
        }
        setPaidItems(paidItemsCheck);
      }
    };
    checkPaidItems();
  }, [user?.id, items]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file type", description: "Please select a JPG or PNG image.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('lost-and-found-images').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('lost-and-found-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in to post an item.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      if (!formData.title || !formData.description || !formData.location || !formData.date || !formData.contact_name || !formData.contact_email || !formData.contact_phone || !formData.category) {
        throw new Error('Please fill in all required fields');
      }
      let imageUrl = selectedImage ? await uploadImage(selectedImage) : undefined;
      await addItem({ ...formData, image_url: imageUrl });

      toast({ title: "✅ Posted Successfully!", description: "Your item has been posted and is now visible to everyone." });
      setFormData({ title: "", description: "", location: "", date: "", contact_name: "", contact_email: "", contact_phone: "", category: "", item_type: "lost" });
      setSelectedImage(null);
      setImagePreview(null);
      setShowUploadForm(false);
    } catch (error: any) {
      console.error('Error submitting item:', error);
      toast({ title: "Error", description: error.message || "Failed to post item. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };
  
  // FIX 2: Removed duplicated functions and created single, correct versions.
  const handleContactClick = async (item: LostFoundItem) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to view contact details.", variant: "destructive" });
      return;
    }
    // If user has already paid (checked on component load), show details directly
    if (paidItems[item.id]) {
      toast({ title: "Contact Details Sent!", description: "Details have been sent to your registered email. Check your inbox." });
      // Here you could also trigger an email again or show a modal
      return;
    }
    // Otherwise, open the payment dialog
    setShowPayment({item, open: true});
  };

  const handlePaymentSuccess = async () => {
    if (showPayment.item && user?.id) {
      try {
        // Simulate checking the backend again after payment
        const res = await fetch(`${import.meta.env.VITE_API_URL}/has-paid-contact?user_id=${user.id}&item_id=${showPayment.item.id}&item_title=${encodeURIComponent(showPayment.item.title)}`);
        const result = await res.json();
        if (result.paid) {
          setPaidItems(prev => ({...prev, [showPayment.item!.id]: true}));
          setShowPayment({item: null, open: false});
          toast({ title: "Contact Details Sent!", description: "Contact details have been sent to your registered email address." });
        } else {
          toast({ title: "Payment not verified", description: "Please contact support if you have paid.", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "Could not verify payment.", variant: "destructive" });
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleMarkComplete = async (itemId: string) => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please sign in to mark items as complete.", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('mark_lost_found_complete', { 
        item_id: itemId 
      });

      if (error) throw error;
      
      if (data) {
        toast({ 
          title: "✅ Item Marked Complete!", 
          description: "Your contact information has been anonymized and the item is now marked as resolved." 
        });
        refreshItems(); // Refresh the items list
      } else {
        toast({ 
          title: "Unable to complete", 
          description: "You can only mark your own items as complete.", 
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      console.error('Error marking item complete:', error);
      toast({ 
        title: "Error", 
        description: "Failed to mark item as complete. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">🎒 Lost & Found</h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
              One campus. Thousands of students. Things get lost.<br />
              <span className="font-semibold">Let's help them find their way back.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                    size="lg" 
                    variant="secondary"
                    className="font-semibold px-8 py-4"
                    onClick={() => {
                        if (!user) {
                            toast({ title: "Sign in required", description: "Please sign in to post a lost item.", variant: "destructive" });
                            return;
                        }
                        setFormData(prev => ({ ...prev, item_type: "lost" }));
                        setShowUploadForm(true);
                    }}
                >
                    <Plus className="mr-2 w-5 h-5" /> Post Lost Item
                </Button>
                <Button 
                    size="lg" 
                    variant="outline"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold px-8 py-4"
                    onClick={() => {
                        if (!user) {
                            toast({ title: "Sign in required", description: "Please sign in to post a found item.", variant: "destructive" });
                            return;
                        }
                        setFormData(prev => ({ ...prev, item_type: "found" }));
                        setShowUploadForm(true);
                    }}
                >
                    <Camera className="mr-2 w-5 h-5" /> Post Found Item
                </Button>
            </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <GuestBrowsingBanner message="Browse all lost and found items freely" action="sign in to post items" className="mb-6" />
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">🔍 Search Items</Label>
                <Input id="search" placeholder="e.g., 'black wallet', 'spectacles', 'Block-3'" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mt-1" />
              </div>
              <div className="w-full lg:w-48">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (<SelectItem key={category} value={category}>{category}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full lg:w-48">
                <Label>Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="lost">Lost Items</SelectItem>
                    <SelectItem value="found">Found Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Tabs for Lost/Found */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="all">All ({items.length})</TabsTrigger>
              <TabsTrigger value="lost">Lost ({items.filter(i => i.item_type === 'lost').length})</TabsTrigger>
              <TabsTrigger value="found">Found ({items.filter(i => i.item_type === 'found').length})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {error ? <DatabaseErrorFallback error={error} onRetry={refreshItems} />
              : loading ? <div className="text-center py-12"><p>Loading items...</p></div>
              : filteredItems.length === 0 ? <div className="text-center py-12"><h3 className="text-xl font-semibold">No items found</h3></div>
              : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img src={item.image_url || "/placeholder.svg"} alt={item.title} className="w-full h-48 object-cover" />
                        <Badge className={`absolute top-2 left-2 ${item.item_type === "lost" ? "bg-destructive hover:bg-destructive/90" : "bg-green-500 hover:bg-green-600"}`}>
                          {item.item_type === "lost" ? "Lost" : "Found"}
                        </Badge>
                        <Badge variant="secondary" className="absolute top-2 right-2">{item.category}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{item.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground"><MapPin className="w-4 h-4 mr-2" />{item.location}</div>
                          <div className="flex items-center text-sm text-muted-foreground"><Calendar className="w-4 h-4 mr-2" />{new Date(item.date).toLocaleDateString()}</div>
                          <div className="flex items-center text-sm text-muted-foreground"><Clock className="w-4 h-4 mr-2" />Posted {new Date(item.created_at).toLocaleDateString()}</div>
                        </div>
                        {/* FIX 4: Removed redundant paidItemId check */ }
                        {paidItems[item.id] ? (
                          <div className="mt-2 p-2 border rounded bg-muted">
                            <div className="font-semibold">Contact Details:</div>
                            <div>Name: {item.contact_name}</div>
                            <div>Email: {item.contact_email}</div>
                            <div>Phone: {item.contact_phone}</div>
                          </div>
                        ) : (
                          <Button className="w-full" onClick={() => handleContactClick(item)}>
                            <Phone className="w-4 h-4 mr-2" /> Contact {item.contact_name}
                          </Button>
                        )}
                        
                        {/* Mark as Complete Button - Only show for item owner */}
                        {user?.id === item.user_id && !item.marked_complete_at && (
                          <Button 
                            variant="outline" 
                            className="w-full mt-2 border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => handleMarkComplete(item.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Complete
                          </Button>
                        )}
                        
                        {/* Completed Status */}
                        {item.marked_complete_at && (
                          <Badge variant="secondary" className="w-full mt-2 bg-green-100 text-green-700">
                            ✅ Completed on {new Date(item.marked_complete_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Payment Dialog */}
      {showPayment.open && showPayment.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Unlock Contact Details</h3>
            <p className="mb-4">Pay ₹50 to view contact details for <span className="font-semibold">{showPayment.item.title}</span>.</p>
            <PaymentComponent
              amount={50}
              user_id={user?.id || ""}
              service_name="LostAndFoundContact"
              subservice_name={showPayment.item.title}
              payment_method="card"
              autoOpen={true}
            />
            <Button className="mt-4 w-full" variant="outline" onClick={() => setShowPayment({item: null, open: false})}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Upload Form Dialog */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.item_type === "lost" ? "📋 Post Lost Item" : "📷 Post Found Item"}</DialogTitle>
            <DialogDescription>Fill in the details to help reunite items with their owners.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Form content remains the same */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_type">Type *</Label>
                <Select value={formData.item_type} onValueChange={(value: 'lost' | 'found') => setFormData(prev => ({ ...prev, item_type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Lost Item</SelectItem>
                    <SelectItem value="found">Found Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (<SelectItem key={category} value={category}>{category}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Item Name *</Label>
              <Input id="title" placeholder="e.g., Black JBL Earbuds, Blue Water Bottle" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" placeholder="Describe the item in detail..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} required rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input id="location" placeholder="e.g., Food Court, Library 2nd Floor" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} required />
              </div>
            </div>
            <div>
              <Label>Photo (Optional)</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={removeImage}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Click to upload image (JPG/PNG, max 5MB)</p>
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold">Contact Information</h4>
              <div>
                <Label htmlFor="contact_name">Your Name *</Label>
                <Input id="contact_name" placeholder="Your full name" value={formData.contact_name} onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email *</Label>
                  <Input id="contact_email" type="email" placeholder="your.email@kiit.ac.in" value={formData.contact_email} onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))} required />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone *</Label>
                  <Input id="contact_phone" placeholder="Your phone number" value={formData.contact_phone} onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))} required />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>Cancel</Button>
              <Button type="submit" disabled={uploading} className="flex-1">{uploading ? "Posting..." : `Post ${formData.item_type} Item`}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}