"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Phone, CheckCircle, Plus, Camera, Clock, X, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/Navbar"
import { useSecureLostAndFound } from "@/hooks/useSecureLostAndFound"
import { DatabaseErrorFallback } from "@/components/DatabaseErrorFallback"
import { supabase } from "@/integrations/supabase/client"
import { GuestBrowsingBanner } from "@/components/GuestBrowsingBanner"
import { useAuth } from "@/hooks/useAuth"
import LostFoundPaymentComponent from "@/components/LostFoundPaymentComponent"

interface LostFoundItem {
  id: string
  title: string
  description: string
  location: string
  date: string
  contact_name: string
  contact_email?: string
  contact_phone?: string
  category: string
  item_type: "lost" | "found"
  image_url?: string
  status: string
  created_at: string
  updated_at: string
  user_id?: string
  marked_complete_at?: string
}

interface FormData {
  title: string
  description: string
  location: string
  date: string
  contact_name: string
  contact_email: string
  contact_phone: string
  category: string
  item_type: "lost" | "found"
}

const testimonials = [
  { text: "Lost my AirPods near Food Court — got them back in 2 hours!", author: "Rahul, CSE 3rd Year", icon: "🎧" },
  { text: "Someone found my file near Block 5. Thank you so much 💗", author: "Sneha, IT 2nd Year", icon: "📁" },
  {
    text: "This platform is amazing! Got my wallet back with everything intact.",
    author: "Arjun, ETC 4th Year",
    icon: "👛",
  },
]

const categories = ["Electronics", "ID Card", "Books & Stationery", "Accessories", "Miscellaneous"]

export default function LostAndFound() {
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
    item_type: "lost",
  })

  // Auto-fill contact email when user logs in
  useEffect(() => {
    if (user?.email && !formData.contact_email) {
      setFormData(prev => ({
        ...prev,
        contact_email: user.email
      }))
    }
  }, [user?.email])

  useEffect(() => {
    const filtered = items.filter((item) => {
      const searchTermMatch = searchTerm
        ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase())
        : true
      const categoryMatch = selectedCategory !== "all" ? item.category === selectedCategory : true
      const typeMatch = selectedType !== "all" ? item.item_type === selectedType : true
      const tabMatch = activeTab !== "all" ? item.item_type === activeTab : true
      return searchTermMatch && categoryMatch && typeMatch && tabMatch
    })
    setFilteredItems(filtered)
  }, [items, searchTerm, selectedCategory, selectedType, activeTab])

  useEffect(() => {
    const checkPaidItems = async () => {
      if (!user?.id) {
        setPaidItems({})
        return
      }
      if (items.length > 0) {
        const paidItemsCheck: { [id: string]: boolean } = {}
        for (const item of items) {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/has-paid-lost-found-contact?user_id=${user.id}&item_id=${item.id}`,
            )
            const result = await res.json()
            if (result.paid) {
              paidItemsCheck[item.id] = true
            }
          } catch (err) {
            console.error(`Error checking payment for item ${item.id}:`, err)
          }
        }
        setPaidItems(paidItemsCheck)
      }
    }
    checkPaidItems()
  }, [user?.id, items])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please select a JPG or PNG image.", variant: "destructive" })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from("lost-and-found-images").upload(fileName, file)
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from("lost-and-found-images").getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post an item.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
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
      ) {
        throw new Error("Please fill in all required fields")
      }
      
      const imageUrl = selectedImage ? await uploadImage(selectedImage) : undefined
      
      // Submit to pending requests table instead of direct publication
      const { error } = await supabase
        .from('lost_found_requests')
        .insert({
          ...formData,
          image_url: imageUrl,
          requester_email: user.email,
          user_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "✅ Submitted Successfully!",
        description: "Your submission is under review. You'll be notified once it's approved.",
      })
      setFormData({
        title: "",
        description: "",
        location: "",
        date: "",
        contact_name: "",
        contact_email: user?.email || "",
        contact_phone: "",
        category: "",
        item_type: "lost",
      })
      setSelectedImage(null)
      setImagePreview(null)
      setShowUploadForm(false)
    } catch (error: any) {
      console.error("Error submitting item:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleContactClick = async (item: LostFoundItem) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view contact details.",
        variant: "destructive",
      })
      return
    }

    // Prevent users from paying for their own uploaded items
    if (user.email === item.contact_email) {
      toast({
        title: "Cannot unlock own item",
        description: "You cannot pay for contact details of an item you posted yourself. Other users pay you to get your contact details.",
        variant: "destructive",
      })
      return
    }

    if (paidItems[item.id]) {
      toast({
        title: "Contact Details Available!",
        description: `Contact details are shown below the item description.`,
        duration: 3000,
      })
      const itemElement = document.getElementById(`item-${item.id}`)
      if (itemElement) {
        itemElement.scrollIntoView({ behavior: "smooth", block: "center" })
        itemElement.classList.add("ring-2", "ring-blue-500")
        setTimeout(() => {
          itemElement.classList.remove("ring-2", "ring-blue-500")
        }, 3000)
      }
      return
    }
    setShowPayment({ item, open: true })
  }

  const handlePaymentSuccess = async () => {
    if (showPayment.item && user?.id) {
      try {
        setPaidItems((prev) => ({ ...prev, [showPayment.item!.id]: true }))
        setShowPayment({ item: null, open: false })

        toast({
          title: "Payment Successful! 🎉",
          description: "Contact details are now visible below. Check your email for a copy.",
          duration: 6000,
        })

        try {
          await fetch(`${import.meta.env.VITE_API_URL}/send-contact-details`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itemId: showPayment.item.id,
              itemTitle: showPayment.item.title,
              payerUserId: user.id,
              posterContactDetails: {
                name: showPayment.item.contact_name,
                email: showPayment.item.contact_email,
                phone: showPayment.item.contact_phone,
              },
            }),
          })
        } catch (emailError) {
          console.warn("Failed to send email backup:", emailError)
        }
      } catch (err) {
        console.error("Error in payment success handler:", err)
        toast({
          title: "Error",
          description: "Payment successful but there was an issue. Please contact support.",
          variant: "destructive",
        })
      }
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleMarkComplete = async (itemId: string) => {
    if (!user) {
      toast({ 
        title: "Authentication required", 
        description: "Please sign in to mark items as complete.", 
        variant: "destructive" 
      })
      return
    }

    try {
      const { data, error } = await supabase.rpc('mark_lost_found_complete', { 
        item_id: itemId 
      })

      if (error) throw error
      
      if (data) {
        toast({ 
          title: "✅ Item Marked Complete!", 
          description: "Your contact information has been anonymized and the item is now marked as resolved." 
        })
        refreshItems()
      } else {
        toast({ 
          title: "Unable to complete", 
          description: "You can only mark your own items as complete.", 
          variant: "destructive" 
        })
      }
    } catch (error: any) {
      console.error('Error marking item complete:', error)
      toast({ 
        title: "Error", 
        description: "Failed to mark item as complete. Please try again.", 
        variant: "destructive" 
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:60px_60px]"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 tracking-tight">🎒 Lost & Found</h1>
            <p className="text-xl lg:text-2xl mb-12 opacity-95 leading-relaxed font-medium">
              One campus. Thousands of students. Things get lost.
              <br />
              <span className="font-bold text-secondary-foreground/90">Let's help them find their way back.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Sign in required",
                      description: "Please sign in to post a lost item.",
                      variant: "destructive",
                    })
                    return
                  }
                  setFormData((prev) => ({ ...prev, item_type: "lost" }))
                  setShowUploadForm(true)
                }}
              >
                <Plus className="mr-3 w-6 h-6" /> Post Lost Item
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground/80 text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-transparent"
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Sign in required",
                      description: "Please sign in to post a found item.",
                      variant: "destructive",
                    })
                    return
                  }
                  setFormData((prev) => ({ ...prev, item_type: "found" }))
                  setShowUploadForm(true)
                }}
              >
                <Camera className="mr-3 w-6 h-6" /> Post Found Item
              </Button>
            </div>
          </div>
        </div>
      </section>



      <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <GuestBrowsingBanner
            message="Browse all lost and found items freely"
            action="sign in to post items"
            className="mb-8"
          />
          <Card className="p-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-6 items-end">
              <div className="flex-1">
                <Label htmlFor="search" className="text-base font-semibold mb-3 block">
                  🔍 Search Items
                </Label>
                <Input
                  id="search"
                  placeholder="e.g., 'black wallet', 'spectacles', 'Block-3'"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 text-base shadow-sm border-2 focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="w-full lg:w-56">
                <Label className="text-base font-semibold mb-3 block">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 text-base shadow-sm border-2 focus:border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full lg:w-56">
                <Label className="text-base font-semibold mb-3 block">Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-12 text-base shadow-sm border-2 focus:border-primary/50">
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

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            
            <TabsContent value="all">
              {error ? (
                <DatabaseErrorFallback error={error} onRetry={refreshItems} />
              ) : loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-lg text-muted-foreground">Loading items...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">No items found</h3>
                  <p className="text-muted-foreground text-lg">Try adjusting your search filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.map((item) => (
                    <Card
                      key={item.id}
                      id={`item-${item.id}`}
                      className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-card/90 backdrop-blur-sm"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image_url || "/placeholder.svg?height=200&width=400&query=lost+and+found+item"}
                          alt={item.title}
                          className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Badge
                          className={`absolute top-3 left-3 px-3 py-1 text-sm font-semibold shadow-lg ${item.item_type === "lost" ? "bg-destructive hover:bg-destructive/90" : "bg-green-500 hover:bg-green-600"}`}
                        >
                          {item.item_type === "lost" ? "Lost" : "Found"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="absolute top-3 right-3 px-3 py-1 text-sm font-medium shadow-lg bg-background/90 text-foreground"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-xl mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-base mb-4 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="space-y-3 py-2 border-t border-border/50">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-3 text-primary/70" />
                            <span className="font-medium">{item.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-3 text-primary/70" />
                            <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-3 text-primary/70" />
                            <span className="font-medium">Posted {new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {paidItems[item.id] ? (
                          <div className="mt-4 p-4 border-2 border-green-200 rounded-xl bg-green-50 dark:bg-green-950/50 dark:border-green-800/50 shadow-inner">
                            <div className="flex items-center mb-3">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                              <span className="font-bold text-green-800 dark:text-green-200">Contact Details:</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <span className="font-semibold w-16">Name:</span>
                                <span className="text-green-800 dark:text-green-200">{item.contact_name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold w-16">Email:</span>
                                <span className="text-green-800 dark:text-green-200">{item.contact_email}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold w-16">Phone:</span>
                                <span className="text-green-800 dark:text-green-200">{item.contact_phone}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button
                            className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                            onClick={() => handleContactClick(item)}
                            disabled={user?.email === item.contact_email}
                          >
                            <Phone className="w-5 h-5 mr-3" />
                            {user?.email === item.contact_email
                              ? "Your Item"
                              : `Contact ${item.contact_name} (₹15)`}
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

            {/* Lost Items Tab */}
            <TabsContent value="lost">
              {error ? (
                <DatabaseErrorFallback error={error} onRetry={refreshItems} />
              ) : loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-lg text-muted-foreground">Loading items...</p>
                </div>
              ) : filteredItems.filter(item => item.item_type === "lost").length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">No lost items found</h3>
                  <p className="text-muted-foreground text-lg">Be the first to post a lost item</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.filter(item => item.item_type === "lost").map((item) => (
                    <Card
                      key={item.id}
                      id={`item-${item.id}`}
                      className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-card/90 backdrop-blur-sm"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image_url || "/placeholder.svg?height=200&width=400&query=lost+and+found+item"}
                          alt={item.title}
                          className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Badge
                          className="absolute top-3 left-3 px-3 py-1 text-sm font-semibold shadow-lg bg-destructive hover:bg-destructive/90"
                        >
                          Lost
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="absolute top-3 right-3 px-3 py-1 text-sm font-medium shadow-lg bg-background/90 text-foreground"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-xl mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-base mb-4 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="space-y-3 py-2 border-t border-border/50">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-3 text-primary/70" />
                            <span className="font-medium">{item.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-3 text-primary/70" />
                            <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-3 text-primary/70" />
                            <span className="font-medium">Posted {new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {paidItems[item.id] ? (
                          <div className="mt-4 p-4 border-2 border-green-200 rounded-xl bg-green-50 dark:bg-green-950/50 dark:border-green-800/50 shadow-inner">
                            <div className="flex items-center mb-3">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                              <span className="font-bold text-green-800 dark:text-green-200">Contact Details:</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <span className="font-semibold w-16">Name:</span>
                                <span className="text-green-800 dark:text-green-200">{item.contact_name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold w-16">Email:</span>
                                <span className="text-green-800 dark:text-green-200">{item.contact_email}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold w-16">Phone:</span>
                                <span className="text-green-800 dark:text-green-200">{item.contact_phone}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button
                            className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                            onClick={() => handleContactClick(item)}
                            disabled={user?.email === item.contact_email}
                          >
                            <Phone className="w-5 h-5 mr-3" />
                            {user?.email === item.contact_email
                              ? "Your Item"
                              : `Contact ${item.contact_name} (₹15)`}
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

            {/* Found Items Tab */}
            <TabsContent value="found">
              {error ? (
                <DatabaseErrorFallback error={error} onRetry={refreshItems} />
              ) : loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-lg text-muted-foreground">Loading items...</p>
                </div>
              ) : filteredItems.filter(item => item.item_type === "found").length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-6">🎉</div>
                  <h3 className="text-2xl font-bold mb-2">No found items yet</h3>
                  <p className="text-muted-foreground text-lg">Be the first to post a found item</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.filter(item => item.item_type === "found").map((item) => (
                    <Card
                      key={item.id}
                      id={`item-${item.id}`}
                      className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-card/90 backdrop-blur-sm"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image_url || "/placeholder.svg?height=200&width=400&query=lost+and+found+item"}
                          alt={item.title}
                          className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Badge
                          className="absolute top-3 left-3 px-3 py-1 text-sm font-semibold shadow-lg bg-green-500 hover:bg-green-600"
                        >
                          Found
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="absolute top-3 right-3 px-3 py-1 text-sm font-medium shadow-lg bg-background/90 text-foreground"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-xl mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-base mb-4 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="space-y-3 py-2 border-t border-border/50">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-3 text-primary/70" />
                            <span className="font-medium">{item.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-3 text-primary/70" />
                            <span className="font-medium">{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-3 text-primary/70" />
                            <span className="font-medium">Posted {new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {paidItems[item.id] ? (
                          <div className="mt-4 p-4 border-2 border-green-200 rounded-xl bg-green-50 dark:bg-green-950/50 dark:border-green-800/50 shadow-inner">
                            <div className="flex items-center mb-3">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                              <span className="font-bold text-green-800 dark:text-green-200">Contact Details:</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <span className="font-semibold w-16">Name:</span>
                                <span className="text-green-800 dark:text-green-200">{item.contact_name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold w-16">Email:</span>
                                <span className="text-green-800 dark:text-green-200">{item.contact_email}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold w-16">Phone:</span>
                                <span className="text-green-800 dark:text-green-200">{item.contact_phone}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button
                            className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                            onClick={() => handleContactClick(item)}
                            disabled={user?.email === item.contact_email}
                          >
                            <Phone className="w-5 h-5 mr-3" />
                            {user?.email === item.contact_email
                              ? "Your Item"
                              : `Contact ${item.contact_name} (₹15)`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-md">
            <LostFoundPaymentComponent
              itemId={showPayment.item.id}
              itemTitle={showPayment.item.title}
              itemPosterName={showPayment.item.contact_name}
              itemPosterEmail={showPayment.item.contact_email || ""}
              payerUserId={user?.id || ""}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentCancel={() => setShowPayment({ item: null, open: false })}
            />
          </div>
        </div>
      )}

      {/* Upload Form Dialog */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
          <DialogHeader className="pb-6 border-b border-border/50">
            <DialogTitle className="text-2xl font-bold">
              {formData.item_type === "lost" ? "📋 Post Lost Item" : "📷 Post Found Item"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Fill in the details to help reunite items with their owners.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="item_type" className="text-base font-semibold mb-3 block">
                  Type *
                </Label>
                <Select
                  value={formData.item_type}
                  onValueChange={(value: "lost" | "found") => setFormData((prev) => ({ ...prev, item_type: value }))}
                >
                  <SelectTrigger className="h-12 text-base border-2 focus:border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Lost Item</SelectItem>
                    <SelectItem value="found">Found Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category" className="text-base font-semibold mb-3 block">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="h-12 text-base border-2 focus:border-primary/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="title" className="text-base font-semibold mb-3 block">
                Item Name *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Black JBL Earbuds, Blue Water Bottle"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="h-12 text-base border-2 focus:border-primary/50"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-3 block">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the item in detail..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
                className="text-base border-2 focus:border-primary/50 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="location" className="text-base font-semibold mb-3 block">
                  Location *
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., Food Court, Library 2nd Floor"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  required
                  className="h-12 text-base border-2 focus:border-primary/50"
                />
              </div>
              
              <div>
                <Label htmlFor="date" className="text-base font-semibold mb-3 block">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                  className="h-12 text-base border-2 focus:border-primary/50"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-base font-semibold mb-3 block">Photo (Optional)</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-3 right-3 shadow-lg hover:scale-105 transition-transform"
                      onClick={removeImage}
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
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-base text-muted-foreground font-medium">Click to upload image</p>
                      <p className="text-sm text-muted-foreground mt-1">(JPG/PNG, max 5MB)</p>
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6 border-t border-border/50 pt-6">
              <h4 className="font-bold text-lg">Contact Information</h4>
              
              <div>
                <Label htmlFor="contact_name" className="text-base font-semibold mb-3 block">
                  Your Name *
                </Label>
                <Input
                  id="contact_name"
                  placeholder="Your full name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contact_name: e.target.value }))}
                  required
                  className="h-12 text-base border-2 focus:border-primary/50"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contact_email" className="text-base font-semibold mb-3 block">
                    Email *
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="your.email@kiit.ac.in"
                    value={formData.contact_email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_email: e.target.value }))}
                    required
                    className="h-12 text-base border-2 focus:border-primary/50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_phone" className="text-base font-semibold mb-3 block">
                    Phone *
                  </Label>
                  <Input
                    id="contact_phone"
                    placeholder="Your phone number"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))}
                    required
                    className="h-12 text-base border-2 focus:border-primary/50"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUploadForm(false)}
                className="h-12 px-8 text-base font-semibold border-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="flex-1 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                    Posting...
                  </>
                ) : (
                  `Post ${formData.item_type} Item`
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
