import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Upload, 
  Phone, 
  Mail, 
  CheckCircle, 
  Filter,
  Plus,
  Heart,
  Star,
  Camera,
  Clock,
  AlertCircle,
  ArrowRight,
  Users,
  Shield,
  X,
  ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { useSecureLostAndFound } from "@/hooks/useSecureLostAndFound";
import { DatabaseErrorFallback } from "@/components/DatabaseErrorFallback";
import { supabase } from "@/integrations/supabase/client";
import { GuestBrowsingBanner } from "@/components/GuestBrowsingBanner";
import { useAuth } from "@/hooks/useAuth";

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
  {
    text: "Lost my AirPods near Food Court — got them back in 2 hours!",
    author: "Rahul, CSE 3rd Year",
    icon: "🎧"
  },
  {
    text: "Someone found my file near Block 5. Thank you so much 💗",
    author: "Sneha, IT 2nd Year", 
    icon: "📁"
  },
  {
    text: "This platform is amazing! Got my wallet back with everything intact.",
    author: "Arjun, ETC 4th Year",
    icon: "👛"
  }
];

const categories = [
  "Electronics",
  "ID Card",
  "Books & Stationery",
  "Accessories",
  "Miscellaneous"
];

export default function LostAndFound() {

  const { user } = useAuth();
  const { 
    items, 
    loading, 
    error, 
    addItem, 
    updateItem, 
    refreshItems, 
    clearError 
  } = useSecureLostAndFound();
  
  const [filteredItems, setFilteredItems] = useState<LostFoundItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  

  const { user } = useAuth()
  const { items, loading, error, addItem, refreshItems } = useSecureLostAndFound()
  const { toast } = useToast()

  const [filteredItems, setFilteredItems] = useState<LostFoundItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState<{ item: LostFoundItem | null; open: boolean }>({
    item: null,
    open: false,
  })
  const [paidItems, setPaidItems] = useState<{ [id: string]: boolean }>({})


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

  const { toast } = useToast();

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (selectedType !== "all") {
      filtered = filtered.filter(item => item.item_type === selectedType);
    }

    if (activeTab !== "all") {
      filtered = filtered.filter(item => item.item_type === activeTab);
    }
    
    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, selectedType, activeTab]);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG or PNG image.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('lost-and-found-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('lost-and-found-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated before allowing submission
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post an item.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.location || 
          !formData.date || !formData.contact_name || !formData.contact_email || 
          !formData.contact_phone || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      await addItem({
        ...formData,
        image_url: imageUrl || undefined
      });

      toast({
        title: "✅ Posted Successfully!",
        description: "Your item has been posted and is now visible to everyone.",
      });

      // Reset form
      setFormData({
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
      setSelectedImage(null);
      setImagePreview(null);
      setShowUploadForm(false);
    } catch (error: any) {
      console.error('Error submitting item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleContactClick = (item: LostFoundItem) => {
    toast({
      title: "Contact Information",
      description: `Name: ${item.contact_name}\nEmail: ${item.contact_email}\nPhone: ${item.contact_phone}`,
    });
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              🎒 Lost & Found
            </h1>
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
                    toast({
                      title: "Sign in required",
                      description: "Please sign in to post a lost item.",
                      variant: "destructive"
                    });
                    return;
                  }
                  setFormData(prev => ({ ...prev, item_type: "lost" }));
                  setShowUploadForm(true);
                }}
              >
                <Plus className="mr-2 w-5 h-5" />
                Post Lost Item
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold px-8 py-4"
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Sign in required",
                      description: "Please sign in to post a found item.",
                      variant: "destructive"
                    });
                    return;
                  }
                  setFormData(prev => ({ ...prev, item_type: "found" }));
                  setShowUploadForm(true);
                }}
              >
                <Camera className="mr-2 w-5 h-5" />
                Post Found Item
              </Button>
            </div>
            
            {/* Floating Items Illustration */}
            <div className="relative opacity-20">
              <div className="flex justify-center items-center space-x-8 text-6xl animate-fade-in">
                🎧 💻 📱 🔑 📚 ☂️ 👓 💳
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              🧭 How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to reunite you with your belongings
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: <Upload className="w-8 h-8" />,
                title: "Post Item",
                description: "Upload lost or found item details with photo"
              },
              {
                step: "2", 
                icon: <CheckCircle className="w-8 h-8" />,
                title: "Instant Posting",
                description: "Your item appears immediately for everyone to see"
              },
              {
                step: "3",
                icon: <Search className="w-8 h-8" />,
                title: "Browse & Search",
                description: "Everyone can view and search all items for free"
              },
              {
                step: "4",
                icon: <Phone className="w-8 h-8" />,
                title: "Connect Directly",
                description: "Contact details visible to help reunite items"
              }
            ].map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>




      {/* Search and Filter Section */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <GuestBrowsingBanner 
            message="Browse all lost and found items freely"
            action="sign in to post items"
            className="mb-6"
          />
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">🔍 Search Items</Label>
                <Input
                  id="search"
                  placeholder="e.g., 'black wallet', 'spectacles', 'Block-3'"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="w-full lg:w-48">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full lg:w-48">
                <Label>Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
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
              <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
              <TabsTrigger value="lost">Lost ({items.filter(i => i.item_type === 'lost').length})</TabsTrigger>
              <TabsTrigger value="found">Found ({items.filter(i => i.item_type === 'found').length})</TabsTrigger>

            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-12 h-14 p-1 bg-muted/50 shadow-lg">
              <TabsTrigger value="all" className="text-base font-semibold data-[state=active]:shadow-md">
                All ({items.length})
              </TabsTrigger>
              <TabsTrigger value="lost" className="text-base font-semibold data-[state=active]:shadow-md">
                Lost ({items.filter((i) => i.item_type === "lost").length})
              </TabsTrigger>
              <TabsTrigger value="found" className="text-base font-semibold data-[state=active]:shadow-md">
                Found ({items.filter((i) => i.item_type === "found").length})
              </TabsTrigger>

            </TabsList>

            <TabsContent value={activeTab}>
              {error ? (
                <DatabaseErrorFallback 
                  error={error} 
                  onRetry={refreshItems}
                />
              ) : loading ? (
                <div className="text-center py-12">
                  <div className="text-2xl mb-4">⏳</div>
                  <p>Loading items...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or be the first to post!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={item.image_url || "/placeholder.svg"} 
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        <Badge 
                          className={`absolute top-2 left-2 ${
                            item.item_type === "lost" 
                              ? "bg-destructive hover:bg-destructive/90" 
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {item.item_type === "lost" ? "Lost" : "Found"}
                        </Badge>
                        <Badge variant="secondary" className="absolute top-2 right-2">
                          {item.category}
                        </Badge>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            {item.location}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            Posted {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full"
                          onClick={() => handleContactClick(item)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Contact {item.contact_name}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              🌟 Success Stories
            </h2>
            <p className="text-muted-foreground">
              Happy reunions from our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{testimonial.icon}</div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm font-medium">{testimonial.author}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>


          </Tabs>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              ❓ Frequently Asked Questions
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it really free to post items?</AccordionTrigger>
              <AccordionContent>
                Yes! Posting lost or found items is completely free. We believe in helping the KIIT community reunite with their belongings without any barriers.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>How quickly do posts appear?</AccordionTrigger>
              <AccordionContent>
                Posts appear instantly! As soon as you submit an item, it's visible to everyone on the platform in real-time.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>What if I find my lost item?</AccordionTrigger>
              <AccordionContent>
                Great! Contact us and we'll help mark your item as resolved so others know it's been found.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I edit my post after submitting?</AccordionTrigger>
              <AccordionContent>
                Currently, you'll need to contact us to make changes to your post. We're working on adding edit functionality soon!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Upload Form Dialog */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formData.item_type === "lost" ? "📋 Post Lost Item" : "📷 Post Found Item"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details to help reunite items with their owners.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_type">Type *</Label>
                <Select 
                  value={formData.item_type} 
                  onValueChange={(value: 'lost' | 'found') => setFormData(prev => ({ ...prev, item_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Lost Item</SelectItem>
                    <SelectItem value="found">Found Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Item Name *</Label>
              <Input
                id="title"
                placeholder="e.g., Black JBL Earbuds, Blue Water Bottle"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the item in detail (color, brand, distinguishing features, etc.)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Food Court, Library 2nd Floor"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Photo (Optional)</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload image (JPG/PNG, max 5MB)
                      </p>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold">Contact Information</h4>
              
              <div>
                <Label htmlFor="contact_name">Your Name *</Label>
                <Input
                  id="contact_name"
                  placeholder="Your full name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="your.email@kiit.ac.in"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_phone">Phone *</Label>
                  <Input
                    id="contact_phone"
                    placeholder="Your phone number"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading} className="flex-1">
                {uploading ? "Posting..." : `Post ${formData.item_type === "lost" ? "Lost" : "Found"} Item`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sticky CTA */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => {
            setFormData(prev => ({ ...prev, item_type: "lost" }));
            setShowUploadForm(true);
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Report Lost
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="rounded-full shadow-lg"
          onClick={() => {
            setFormData(prev => ({ ...prev, item_type: "found" }));
            setShowUploadForm(true);
          }}
        >
          <Camera className="w-5 h-5 mr-2" />
          Report Found
        </Button>
      </div>
    </div>

  );
}

  )
}

