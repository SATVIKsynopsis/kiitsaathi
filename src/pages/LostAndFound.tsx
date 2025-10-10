import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Search,
  MapPin,
  Calendar,
  Upload,
  Phone,
  CheckCircle,
  Plus,
  Star,
  Camera,
  Clock,
  X,
  ImageIcon,
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
  item_type: "lost" | "found";
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
  item_type: "lost" | "found";
}

const testimonials = [
  { text: "Lost my AirPods near Food Court — got them back in 2 hours!", author: "Rahul, CSE 3rd Year", icon: "🎧" },
  { text: "Someone found my file near Block 5. Thank you so much 💗", author: "Sneha, IT 2nd Year", icon: "📁" },
  { text: "This platform is amazing! Got my wallet back with everything intact.", author: "Arjun, ETC 4th Year", icon: "👛" },
];

const categories = ["Electronics", "ID Card", "Books & Stationery", "Accessories", "Miscellaneous"];

export default function LostAndFound() {
  const { user } = useAuth();
  const { items, loading, error, addItem, refreshItems } = useSecureLostAndFound();
  const { toast } = useToast();

  const [filteredItems, setFilteredItems] = useState<LostFoundItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    location: "",
    date: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    category: "",
    item_type: "lost",
  });

  // 🔍 Filter items dynamically
  useEffect(() => {
    let filtered = items;
    if (searchTerm)
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (selectedCategory !== "all") filtered = filtered.filter((item) => item.category === selectedCategory);
    if (selectedType !== "all") filtered = filtered.filter((item) => item.item_type === selectedType);
    if (activeTab !== "all") filtered = filtered.filter((item) => item.item_type === activeTab);
    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, selectedType, activeTab]);

  // 📸 Handle image
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
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

  // ☁️ Upload image
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("lost-and-found-images").upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("lost-and-found-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  // 📝 Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in to post an item.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      if (
        !formData.title ||
        !formData.description ||
        !formData.location ||
        !formData.date ||
        !formData.contact_name ||
        !formData.contact_email ||
        !formData.contact_phone ||
        !formData.category
      )
        throw new Error("Please fill in all required fields");

      let imageUrl = null;
      if (selectedImage) imageUrl = await uploadImage(selectedImage);

      await addItem({ ...formData, image_url: imageUrl || undefined });
      toast({ title: "✅ Posted Successfully!", description: "Your item has been posted for everyone to see." });
      setFormData({
        title: "",
        description: "",
        location: "",
        date: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        category: "",
        item_type: "lost",
      });
      setSelectedImage(null);
      setImagePreview(null);
      setShowUploadForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post item. Please try again.",
        variant: "destructive",
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

  // 🧩 JSX
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Navbar />

      {/* HERO SECTION */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">🎒 Lost & Found</h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
              One campus. Thousands of students. Things get lost.
              <br />
              <span className="font-semibold">Let's help them find their way back.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold px-8 py-4"
                onClick={() => {
                  if (!user)
                    return toast({
                      title: "Sign in required",
                      description: "Please sign in to post a lost item.",
                      variant: "destructive",
                    });
                  setFormData((prev) => ({ ...prev, item_type: "lost" }));
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
                  if (!user)
                    return toast({
                      title: "Sign in required",
                      description: "Please sign in to post a found item.",
                      variant: "destructive",
                    });
                  setFormData((prev) => ({ ...prev, item_type: "found" }));
                  setShowUploadForm(true);
                }}
              >
                <Camera className="mr-2 w-5 h-5" />
                Post Found Item
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH & FILTER */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <GuestBrowsingBanner message="Browse all lost and found items freely" action="sign in to post items" className="mb-6" />
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">🔍 Search Items</Label>
                <Input id="search" placeholder="e.g., wallet, ID card" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mt-1" />
              </div>
              <div className="w-full lg:w-48">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
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
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ITEMS LIST */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="all">All ({items.length})</TabsTrigger>
              <TabsTrigger value="lost">Lost ({items.filter((i) => i.item_type === "lost").length})</TabsTrigger>
              <TabsTrigger value="found">Found ({items.filter((i) => i.item_type === "found").length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {error ? (
                <DatabaseErrorFallback error={error} onRetry={refreshItems} />
              ) : loading ? (
                <div className="text-center py-12">⏳ Loading items...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground">Try adjusting filters or post your first item!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img src={item.image_url || "/placeholder.svg"} alt={item.title} className="w-full h-48 object-cover" />
                        <Badge className={`absolute top-2 left-2 ${item.item_type === "lost" ? "bg-destructive" : "bg-green-500"}`}>
                          {item.item_type === "lost" ? "Lost" : "Found"}
                        </Badge>
                        <Badge variant="secondary" className="absolute top-2 right-2">
                          {item.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{item.description}</p>
                        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {item.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                        </div>
                        <Button className="w-full" onClick={() => handleContactClick(item)}>
                          <Phone className="w-4 h-4 mr-2" /> Contact {item.contact_name}
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

      {/* STICKY CTA */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => {
            setFormData((prev) => ({ ...prev, item_type: "lost" }));
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
            setFormData((prev) => ({ ...prev, item_type: "found" }));
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
