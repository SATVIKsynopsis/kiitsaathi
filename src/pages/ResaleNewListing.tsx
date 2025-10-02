import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function ResaleNewListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'books',
    condition: 'good',
    price: '',
    campus: '1',
    pickup_option: 'both',
    delivery_fee: '0',
    is_exchange: false,
    exchange_with: '',
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create a listing');
      return;
    }

    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    try {
      setLoading(true);

      // Create listing first
      const { data: listing, error: listingError } = await supabase
        .from('resale_listings')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          price: parseFloat(formData.price),
          campus: parseInt(formData.campus),
          seller_id: user.id,
          pickup_option: formData.pickup_option,
          delivery_fee: parseFloat(formData.delivery_fee),
          is_exchange: formData.is_exchange,
          exchange_with: formData.is_exchange ? { items: formData.exchange_with } : null,
          status: 'pending', // Goes to admin moderation
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Upload images to private bucket (for moderation)
      setUploadingImages(true);
      const imageUploads = images.map(async (img, index) => {
        const fileName = `${listing.id}/${Date.now()}-${index}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('resale-private')
          .upload(fileName, img.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Save image reference
        const { error: imageError } = await supabase
          .from('resale_listing_images')
          .insert({
            listing_id: listing.id,
            storage_path: fileName,
            display_order: index,
          });

        if (imageError) throw imageError;
      });

      await Promise.all(imageUploads);

      toast.success('Listing submitted for review!');
      navigate('/resale/my-listings');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast.error(error.message || 'Failed to create listing');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-campus-blue/10 to-kiit-green/10 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create New Listing</h1>
          <p className="text-muted-foreground">List your item for sale or exchange with verified KIIT students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">Photos (Max 6)</Label>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={img.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-kiit-green hover:bg-kiit-green/5 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </Card>

          {/* Basic Details */}
          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Engineering Mathematics Textbook"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your item, its condition, and any other relevant details..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Pricing & Location */}
          <Card className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="campus">Campus *</Label>
                <Select value={formData.campus} onValueChange={(value) => setFormData({ ...formData, campus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Campus {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="pickup_option">Delivery Option *</Label>
              <Select value={formData.pickup_option} onValueChange={(value) => setFormData({ ...formData, pickup_option: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup Only</SelectItem>
                  <SelectItem value="delivery">Delivery Only</SelectItem>
                  <SelectItem value="both">Both Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.pickup_option === 'delivery' || formData.pickup_option === 'both') && (
              <div>
                <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
                <Input
                  id="delivery_fee"
                  type="number"
                  value={formData.delivery_fee}
                  onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
            )}
          </Card>

          {/* Exchange Option */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base">Available for Exchange</Label>
                <p className="text-sm text-muted-foreground">Allow students to propose item exchanges</p>
              </div>
              <Switch
                checked={formData.is_exchange}
                onCheckedChange={(checked) => setFormData({ ...formData, is_exchange: checked })}
              />
            </div>

            {formData.is_exchange && (
              <div>
                <Label htmlFor="exchange_with">What would you exchange for?</Label>
                <Input
                  id="exchange_with"
                  value={formData.exchange_with}
                  onChange={(e) => setFormData({ ...formData, exchange_with: e.target.value })}
                  placeholder="e.g., Physics textbook, Scientific calculator..."
                />
              </div>
            )}
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/resale')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingImages}
              className="flex-1 bg-gradient-to-r from-kiit-green to-campus-blue"
            >
              {loading || uploadingImages ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadingImages ? 'Uploading Images...' : 'Creating...'}
                </>
              ) : (
                'Submit for Review'
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Your listing will be reviewed by our team before being published
          </p>
        </form>
      </div>
    </div>
  );
}