import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, Save, Store, X, Upload, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  photos?: string[];
  image_url?: string;
}

interface ShopEditFormProps {
  shopId: string;
  onClose: () => void;
}

export const ShopEditForm = ({ shopId, onClose }: ShopEditFormProps) => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Prevent body scroll when modal is open and handle escape key
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contact_number: "",
    opening_hours: "",
    closing_hours: "",
    category: "",
    is_active: true,
    featured: false
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newMenuItem, setNewMenuItem] = useState<MenuItem>({
    name: "",
    description: "",
    price: 0,
    category: "",
    is_available: true,
    photos: []
  });

  // Photo upload states
  const [shopPhotos, setShopPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = accessToken || localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Fetch shop details
  const { data: shopData, isLoading } = useQuery({
    queryKey: ['admin-shop', shopId],
    queryFn: async () => {
      const response = await fetch(`https://kiitsaathi-hosted.onrender.com/api/food/admin/shops/${shopId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch shop details');
      const data = await response.json();
      return data.shop;
    },
    enabled: !!shopId
  });

  // Update form when shop data loads
  useEffect(() => {
    if (shopData) {
      setFormData({
        name: shopData.name || "",
        description: shopData.description || "",
        location: shopData.location || "",
        contact_number: shopData.contact_number || "",
        opening_hours: shopData.opening_hours || "",
        closing_hours: shopData.closing_hours || "",
        category: shopData.category || "",
        is_active: shopData.is_active ?? true,
        featured: shopData.featured ?? false
      });
      setMenuItems(shopData.menu_items || []);
      setShopPhotos(shopData.photos || []);
    }
  }, [shopData]);

  // Update shop mutation
  const updateShopMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Mutation sending data:', data);
      const response = await fetch(`https://kiitsaathi-hosted.onrender.com/api/food/admin/shops/${shopId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update shop');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] });
      queryClient.invalidateQueries({ queryKey: ['admin-shop', shopId] });
      toast({ 
        title: "Shop updated successfully",
        description: "All changes have been saved."
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update shop",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMenuItem = () => {
    if (!newMenuItem.name.trim() || !newMenuItem.price) {
      toast({ 
        title: "Please fill in menu item details", 
        variant: "destructive" 
      });
      return;
    }

    setMenuItems(prev => [...prev, { 
      ...newMenuItem, 
      id: `temp-${Date.now()}` 
    }]);
    setNewMenuItem({
      name: "",
      description: "",
      price: 0,
      category: "",
      is_available: true,
      photos: []
    });
  };

  const handleRemoveMenuItem = (index: number) => {
    setMenuItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMenuItem = (index: number, field: string, value: any) => {
    setMenuItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      // Convert to base64 for simple storage (in production, use proper file upload service)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setShopPhotos(prev => [...prev, base64String]);
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ title: "Failed to upload photo", variant: "destructive" });
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setShopPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleMenuItemPhotoUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setMenuItems(prev => prev.map((item, i) => 
          i === index 
            ? { ...item, photos: [...(item.photos || []), base64String] }
            : item
        ));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ title: "Failed to upload menu item photo", variant: "destructive" });
    }
  };

  const handleNewMenuItemPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewMenuItem(prev => ({
          ...prev,
          photos: [...(prev.photos || []), base64String]
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ title: "Failed to upload new menu item photo", variant: "destructive" });
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ 
        title: "Shop name is required", 
        variant: "destructive" 
      });
      return;
    }

    const submitData = {
      ...formData,
      photos: shopPhotos,
      menu_items: menuItems
    };

    console.log('Submitting shop data with menu items:', { menuItemsCount: menuItems.length });
    updateShopMutation.mutate(submitData);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-6">
            <div className="text-center">Loading shop details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Edit Shop: {formData.name || 'Loading...'}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 rounded-full p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Shop Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Shop Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter shop name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="fast-food">Fast Food</SelectItem>
                  <SelectItem value="juice-bar">Juice Bar</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                  <SelectItem value="ice-cream">Ice Cream</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the shop..."
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Shop location on campus"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                value={formData.contact_number}
                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                placeholder="Phone number"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="opening">Opening Hours</Label>
              <Input
                id="opening"
                type="time"
                value={formData.opening_hours}
                onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="closing">Closing Hours</Label>
              <Input
                id="closing"
                type="time"
                value={formData.closing_hours}
                onChange={(e) => handleInputChange('closing_hours', e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          {/* Shop Status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="active">Shop Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
              />
              <Label htmlFor="featured">Featured Shop</Label>
            </div>
          </div>

          <Separator />

          {/* Shop Photos Management */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop Photos</h3>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {shopPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Shop photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
          </div>

          <Separator />

          {/* Menu Items Management */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Menu Items</h3>
            
            {/* Add New Menu Item */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-base">Add New Menu Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <Input
                    placeholder="Item name"
                    value={newMenuItem.name}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Description"
                    value={newMenuItem.description}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Price (₹)"
                    value={newMenuItem.price || ""}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                  />
                  <Input
                    placeholder="Category"
                    value={newMenuItem.category}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                
                {/* Photo Upload for New Menu Item */}
                <div className="mb-4">
                  <Label>Menu Item Photos</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleNewMenuItemPhotoUpload}
                    className="mb-2"
                  />
                  {newMenuItem.photos && newMenuItem.photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {newMenuItem.photos.map((photo, photoIdx) => (
                        <div key={photoIdx} className="relative">
                          <img
                            src={photo}
                            alt={`New menu item photo ${photoIdx + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => setNewMenuItem(prev => ({
                              ...prev,
                              photos: prev.photos?.filter((_, i) => i !== photoIdx) || []
                            }))}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button onClick={handleAddMenuItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Existing Menu Items */}
            {menuItems.length > 0 ? (
              <div className="space-y-3">
                {menuItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-5 gap-3 items-start mb-3">
                        <Input
                          value={item.name}
                          onChange={(e) => handleUpdateMenuItem(index, 'name', e.target.value)}
                          placeholder="Item name"
                        />
                        <Input
                          value={item.description}
                          onChange={(e) => handleUpdateMenuItem(index, 'description', e.target.value)}
                          placeholder="Description"
                        />
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleUpdateMenuItem(index, 'price', Number(e.target.value))}
                          placeholder="Price"
                        />
                        <Input
                          value={item.category}
                          onChange={(e) => handleUpdateMenuItem(index, 'category', e.target.value)}
                          placeholder="Category"
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.is_available}
                            onCheckedChange={(checked) => handleUpdateMenuItem(index, 'is_available', checked)}
                          />
                          <span className="text-xs">Available</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMenuItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Menu Item Photos */}
                      <div className="space-y-2">
                        <Label className="text-sm">Photos</Label>
                        <div className="flex items-start gap-4">
                          {/* Display existing photos */}
                          {item.photos && item.photos.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {item.photos.map((photo, photoIdx) => (
                                <div key={photoIdx} className="relative">
                                  <img
                                    src={photo}
                                    alt={`${item.name} photo ${photoIdx + 1}`}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                    onClick={() => setMenuItems(prev => prev.map((menuItem, i) => 
                                      i === index 
                                        ? { ...menuItem, photos: menuItem.photos?.filter((_, pi) => pi !== photoIdx) || [] }
                                        : menuItem
                                    ))}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Fallback to image_url if no photos array */}
                          {(!item.photos || item.photos.length === 0) && item.image_url && (
                            <div className="relative">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded border"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={() => handleUpdateMenuItem(index, 'image_url', '')}
                              >
                                ×
                              </Button>
                            </div>
                          )}
                          
                          {/* Add photo button */}
                          <label className="cursor-pointer">
                            <Button variant="outline" size="sm" asChild>
                              <span>
                                <Image className="h-4 w-4 mr-2" />
                                Add Photo
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleMenuItemPhotoUpload(index, e)}
                            />
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No menu items added yet. Add your first menu item above.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={updateShopMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateShopMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};