import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useFoodOrders, type OrderItem } from '@/hooks/useFoodOrders';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function FoodOrderCustomer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createOrder, loading } = useFoodOrders();
  
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { itemName: '', quantity: 1, mrp: 0 }
  ]);

  const deliveryChargePercent = 10;

  const addItem = () => {
    setItems([...items, { itemName: '', quantity: 1, mrp: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const totalMRP = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  const deliveryCharge = (totalMRP * deliveryChargePercent) / 100;
  const totalPayable = totalMRP + deliveryCharge;

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      alert('Please enter a valid Indian mobile number');
      return;
    }

    const validItems = items.filter(item => item.itemName.trim() && item.mrp > 0);
    if (validItems.length === 0) {
      alert('Please add at least one valid item');
      return;
    }

    const success = await createOrder({
      customer_name: customerName,
      phone_number: phoneNumber,
      delivery_location: deliveryLocation,
      special_notes: specialNotes,
      items: validItems,
      total_mrp: totalMRP,
      delivery_charge_percent: deliveryChargePercent,
      total_payable: totalPayable,
    });

    if (success) {
      // Reset form
      setCustomerName('');
      setPhoneNumber('');
      setDeliveryLocation('');
      setSpecialNotes('');
      setItems([{ itemName: '', quantity: 1, mrp: 0 }]);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Please sign in to create food orders
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Food & Essentials Order</h1>
          <p className="text-muted-foreground">Create your order for delivery to your location</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        placeholder="98XXXXXXXX"
                        pattern="[6-9][0-9]{9}"
                        title="Please enter a valid Indian mobile number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deliveryLocation">Delivery Location</Label>
                    <Input
                      id="deliveryLocation"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      required
                      placeholder="e.g., Campus Hostel B-12, Room 205"
                    />
                  </div>

                  <div>
                    <Label>Items</Label>
                    <div className="space-y-3 mt-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Input
                              placeholder="Item name (e.g., Lays Chips)"
                              value={item.itemName}
                              onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                              required
                            />
                          </div>
                          <div className="w-20">
                            <Label htmlFor={`quantity-${index}`} className="text-xs">Qty</Label>
                            <div className="flex">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-8 rounded-r-none"
                                onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                id={`quantity-${index}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-16 rounded-none text-center"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-8 rounded-l-none"
                                onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="w-24">
                            <Label htmlFor={`mrp-${index}`} className="text-xs">MRP (₹)</Label>
                            <Input
                              id={`mrp-${index}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.mrp}
                              onChange={(e) => updateItem(index, 'mrp', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="h-10 w-10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItem}
                      className="mt-3 w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="specialNotes">Special Notes (Optional)</Label>
                    <Textarea
                      id="specialNotes"
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="e.g., Only orange flavor, No spicy items, etc."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Creating Order...' : 'Place Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Items:</h4>
                    {items.filter(item => item.itemName.trim()).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.itemName} × {item.quantity}</span>
                        <span>₹{(item.mrp * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Items Total:</span>
                      <span>₹{totalMRP.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Delivery Charge ({deliveryChargePercent}%):</span>
                      <span>₹{deliveryCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total Payable:</span>
                      <span>₹{totalPayable.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}