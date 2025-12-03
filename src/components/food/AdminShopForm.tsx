import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

interface ShopFormData {
  name: string;
  short_desc: string;
  full_desc: string;
  contact_number: string;
  address: string;
  lat: number;
  lng: number;
  tags: string;
  is_active: boolean;
  featured: boolean;
}

interface AdminShopFormProps {
  shop?: any;
  onSuccess?: () => void;
}

const HOSTED_URL = 'https://kiitsaathi-hosted.onrender.com';


const AdminShopForm = ({ shop, onSuccess }: AdminShopFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ShopFormData>({
    defaultValues: shop ? {
      name: shop.name,
      short_desc: shop.short_desc,
      full_desc: shop.full_desc,
      contact_number: shop.contact_number,
      address: shop.address,
      lat: shop.lat,
      lng: shop.lng,
      tags: shop.tags?.join(', ') || '',
      is_active: shop.is_active,
      featured: shop.featured,
    } : {}
  });
  const [loading, setLoading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const { toast } = useToast();

  const uploadPhotos = async (files: FileList): Promise<string[]> => {
    const urls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('shop-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('shop-photos')
        .getPublicUrl(fileName);
      
      urls.push(publicUrl);
    }
    
    return urls;
  };

  const onSubmit = async (data: ShopFormData) => {
    setLoading(true);
    try {
      let photoUrls = shop?.photos || [];
      
      if (photoFiles && photoFiles.length > 0) {
        photoUrls = await uploadPhotos(photoFiles);
      }

      const shopData = {
        name: data.name,
        short_desc: data.short_desc,
        contact_number: data.contact_number,
        address: data.address,
        tags: data.tags.split(',').map(t => t.trim()),
        photos: photoUrls,
        is_active: data.is_active,
        featured: data.featured
      };

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
      };

      if (shop) {
        const response = await fetch(`${HOSTED_URL}/api/food/admin/shops/${shop.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(shopData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update shop');
        }
        
        toast({ title: "Shop updated successfully!" });
      } else {
        const response = await fetch(`${HOSTED_URL}/api/food/admin/shops`, {
          method: 'POST',
          headers,
          body: JSON.stringify(shopData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create shop');
        }
        
        toast({ title: "Shop created successfully!" });
      }
      
      onSuccess?.();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{shop ? 'Edit Shop' : 'Add New Shop'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Shop Name *</Label>
            <Input 
              id="name" 
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="short_desc">Short Description *</Label>
            <Input 
              id="short_desc" 
              {...register("short_desc", { required: "Short description is required" })}
            />
            {errors.short_desc && <p className="text-sm text-destructive">{errors.short_desc.message}</p>}
          </div>

          <div>
            <Label htmlFor="full_desc">Full Description *</Label>
            <Textarea 
              id="full_desc" 
              {...register("full_desc", { required: "Full description is required" })}
              rows={4}
            />
            {errors.full_desc && <p className="text-sm text-destructive">{errors.full_desc.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_number">Contact Number *</Label>
              <Input 
                id="contact_number" 
                {...register("contact_number", { required: "Contact number is required" })}
              />
              {errors.contact_number && <p className="text-sm text-destructive">{errors.contact_number.message}</p>}
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input 
                id="address" 
                {...register("address", { required: "Address is required" })}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">Latitude *</Label>
              <Input 
                id="lat" 
                type="number" 
                step="any"
                {...register("lat", { required: "Latitude is required" })}
              />
              {errors.lat && <p className="text-sm text-destructive">{errors.lat.message}</p>}
            </div>

            <div>
              <Label htmlFor="lng">Longitude *</Label>
              <Input 
                id="lng" 
                type="number" 
                step="any"
                {...register("lng", { required: "Longitude is required" })}
              />
              {errors.lng && <p className="text-sm text-destructive">{errors.lng.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input 
              id="tags" 
              placeholder="e.g. cafe, beverages, snacks"
              {...register("tags")}
            />
          </div>

          <div>
            <Label htmlFor="photos">Shop Photos</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="photos" 
                type="file" 
                multiple 
                accept="image/*"
                onChange={(e) => setPhotoFiles(e.target.files)}
              />
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("is_active")} />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("featured")} />
              <span className="text-sm">Featured</span>
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {shop ? 'Update Shop' : 'Create Shop'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminShopForm;