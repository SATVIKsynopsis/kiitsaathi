import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

interface BatchFormData {
  shop_id: string;
  batch_name: string;
  amount_per_coupon: number;
  daily_limit: number;
  per_user_limit: number;
  total_limit: number;
  expires_in_days: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface AdminBatchFormProps {
  batch?: any;
  onSuccess?: () => void;
}

const AdminBatchForm = ({ batch, onSuccess }: AdminBatchFormProps) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BatchFormData>({
    defaultValues: batch || {
      daily_limit: 100,
      per_user_limit: 1,
      total_limit: 1000,
      expires_in_days: 7,
      start_time: "08:00",
      end_time: "22:00",
      is_active: true
    }
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: shops } = useQuery({
    queryKey: ['shops-admin'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${HOSTED_URL}/api/food/admin/shops`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        }
      });
      if (!response.ok) throw new Error('Failed to fetch shops');
      const result = await response.json();
      return result.shops;
    }
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const onSubmit = async (data: BatchFormData) => {
    setLoading(true);
    try {
      const batchData = {
        shop_id: data.shop_id,
        batch_name: data.batch_name,
        amount_per_coupon: Number(data.amount_per_coupon),
        daily_limit: Number(data.daily_limit),
        per_user_limit: Number(data.per_user_limit),
        start_time: data.start_time,
        end_time: data.end_time,
        expires_in_days: Number(data.expires_in_days),
        is_active: data.is_active
      };

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
      };

      if (batch) {
        const response = await fetch(`${HOSTED_URL}/api/food/admin/batches/${batch.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(batchData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update batch');
        }
        
        toast({ title: "Batch updated successfully!" });
      } else {
        const response = await fetch(`${HOSTED_URL}/api/food/admin/batches`, {
          method: 'POST',
          headers,
          body: JSON.stringify(batchData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create batch');
        }
        
        toast({ title: "Batch created successfully!" });
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
        <CardTitle>{batch ? 'Edit Coupon Batch' : 'Create New Coupon Batch'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="shop_id">Shop *</Label>
            <Select 
              onValueChange={(value) => setValue("shop_id", value)}
              defaultValue={batch?.shop_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a shop" />
              </SelectTrigger>
              <SelectContent>
                {shops?.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="batch_name">Batch Name *</Label>
            <Input 
              id="batch_name" 
              placeholder="e.g. Coffee Lovers Special"
              {...register("batch_name", { required: "Batch name is required" })}
            />
            {errors.batch_name && <p className="text-sm text-destructive">{errors.batch_name.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount_per_coupon">Discount Amount (₹) *</Label>
              <Input 
                id="amount_per_coupon" 
                type="number"
                {...register("amount_per_coupon", { required: "Amount is required", min: 1 })}
              />
              {errors.amount_per_coupon && <p className="text-sm text-destructive">{errors.amount_per_coupon.message}</p>}
            </div>

            <div>
              <Label htmlFor="expires_in_days">Expires In (days) *</Label>
              <Input 
                id="expires_in_days" 
                type="number"
                {...register("expires_in_days", { required: "Expiry days required", min: 1 })}
              />
              {errors.expires_in_days && <p className="text-sm text-destructive">{errors.expires_in_days.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="daily_limit">Daily Limit *</Label>
              <Input 
                id="daily_limit" 
                type="number"
                {...register("daily_limit", { required: "Daily limit required", min: 1 })}
              />
            </div>

            <div>
              <Label htmlFor="per_user_limit">Per User Limit *</Label>
              <Input 
                id="per_user_limit" 
                type="number"
                {...register("per_user_limit", { required: "Per user limit required", min: 1 })}
              />
            </div>

            <div>
              <Label htmlFor="total_limit">Total Limit *</Label>
              <Input 
                id="total_limit" 
                type="number"
                {...register("total_limit", { required: "Total limit required", min: 1 })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Start Time *</Label>
              <Input 
                id="start_time" 
                type="time"
                {...register("start_time", { required: "Start time required" })}
              />
            </div>

            <div>
              <Label htmlFor="end_time">End Time *</Label>
              <Input 
                id="end_time" 
                type="time"
                {...register("end_time", { required: "End time required" })}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("is_active")} />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {batch ? 'Update Batch' : 'Create Batch'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminBatchForm;