import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, ShoppingCart, Trash2, Coffee, Cookie, Utensils, Home, User, BookOpen, Users, MessageCircle } from 'lucide-react';
import { useFoodOrders, type OrderItem } from '@/hooks/useFoodOrders';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import foodDoodles from '@/assets/food-doodles.png';
import foodDeliveryHero from '@/assets/food-delivery-hero.png';

export default function FoodOrderCustomer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit Indian mobile number",
        variant: "destructive",
      });
      return;
    }

    const validItems = items.filter(item => item.itemName.trim() && item.mrp > 0);
    if (validItems.length === 0) {
      toast({
        title: "No Valid Items",
        description: "Please add at least one valid item with a name and price",
        variant: "destructive",
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryLocation.trim()) {
      toast({
        title: "Missing Information", 
        description: "Please enter your delivery location",
        variant: "destructive",
      });
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
      <div className="min-h-screen relative">
        <div 
          className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: `url(${foodDoodles})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '400px'
          }}
        ></div>
        <Navbar />
        <div className="relative z-10 flex items-center justify-center pt-24 p-4">
          <Card className="w-full max-w-md glass-card border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-gradient">🔐 Sign In Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-6">
                Please sign in to create food orders and start getting your favorite snacks delivered!
              </p>
              <Button onClick={() => navigate('/auth')} className="w-full gradient-primary text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg">
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: `url(${foodDoodles})`,
          backgroundRepeat: 'repeat', 
          backgroundSize: '400px'
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-yellow-50/60 to-teal-50/80"></div>
      
      <Navbar />
      
      <div className="relative z-10 pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-block p-6 glass-card border-0 shadow-2xl mb-6">
              <h1 className="text-4xl font-bold text-gradient mb-3">🛒 Request Your Essentials</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Craving Maggi at midnight? Need chips for your study session? We've got you covered! 
                Order your favorite snacks and micro-essentials delivered right to your hostel room.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/food-order-helper')}
                className="glass-button border-primary/20 text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-300"
              >
                💡 Switch to Helper Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="glass-button border-accent/20 text-accent hover:text-accent-foreground hover:bg-accent transition-all duration-300"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>

          <div className="grid xl:grid-cols-5 gap-8">
            {/* Main Form - Takes 3 columns */}
            <div className="xl:col-span-3">
              <Card className="glass-card border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="customerName" className="text-base font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          Customer Name
                        </Label>
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                          placeholder="Enter your full name"
                          className="h-12 text-base border-2 border-primary/20 focus:border-primary rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-base font-medium flex items-center gap-2">
                          📱 Phone Number
                        </Label>
                        <Input
                          id="phoneNumber"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          placeholder="98XXXXXXXX"
                          pattern="[6-9][0-9]{9}"
                          title="Please enter a valid Indian mobile number"
                          className="h-12 text-base border-2 border-primary/20 focus:border-primary rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryLocation" className="text-base font-medium flex items-center gap-2">
                        📍 Delivery Location
                      </Label>
                      <Input
                        id="deliveryLocation"
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        required
                        placeholder="e.g., Campus Hostel B-12, Room 205"
                        className="h-12 text-base border-2 border-primary/20 focus:border-primary rounded-xl"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-primary" />
                        Items to Order
                      </Label>
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {items.map((item, index) => (
                          <div key={index} className="p-4 border-2 border-primary/10 rounded-xl bg-primary/5 space-y-3">
                            <div className="grid md:grid-cols-12 gap-3 items-end">
                              <div className="md:col-span-5">
                                <Label className="text-sm text-muted-foreground">Item Name</Label>
                                <Input
                                  placeholder="🍜 Enter item name (e.g., Maggi Noodles)"
                                  value={item.itemName}
                                  onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                                  required
                                  className="h-11 border-2 border-primary/20 focus:border-primary rounded-lg"
                                />
                              </div>
                              
                              <div className="md:col-span-3">
                                <Label className="text-sm text-muted-foreground">Quantity</Label>
                                <div className="flex">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-10 rounded-r-none border-primary/20 hover:bg-primary/10"
                                    onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-16 rounded-none text-center h-11 border-primary/20"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-10 rounded-l-none border-primary/20 hover:bg-primary/10"
                                    onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="md:col-span-3">
                                <Label className="text-sm text-muted-foreground">MRP (₹)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={item.mrp}
                                  onChange={(e) => updateItem(index, 'mrp', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  required
                                  className="h-11 border-2 border-primary/20 focus:border-primary rounded-lg"
                                />
                              </div>
                              
                              <div className="md:col-span-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                  disabled={items.length === 1}
                                  className="h-11 w-11 border-destructive/20 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {item.itemName.trim() && item.mrp > 0 && (
                              <div className="text-right text-sm font-medium text-primary">
                                Subtotal: ₹{(item.mrp * item.quantity).toFixed(2)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addItem}
                        className="w-full h-12 border-2 border-dashed border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Another Item
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialNotes" className="text-base font-medium flex items-center gap-2">
                        💬 Special Notes (Optional)
                      </Label>
                      <Textarea
                        id="specialNotes"
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        placeholder="e.g., Only orange flavor, No spicy items, Call before delivery, etc."
                        rows={4}
                        className="border-2 border-primary/20 focus:border-primary rounded-xl resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full h-14 text-lg font-semibold gradient-primary text-white hover:scale-105 transition-all duration-300 shadow-lg rounded-xl"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating Order...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Place Order (₹{totalPayable.toFixed(2)})
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary & Illustration - Takes 2 columns */}
            <div className="xl:col-span-2 space-y-6">
              {/* Hero Illustration */}
              <Card className="glass-card border-0 shadow-2xl">
                <CardContent className="p-6 text-center">
                  <img 
                    src={foodDeliveryHero} 
                    alt="Food Delivery" 
                    className="w-full max-w-sm mx-auto mb-4 animate-float"
                  />
                  <h3 className="text-lg font-semibold text-gradient mb-2">Quick & Reliable Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Your favorite snacks delivered fresh to your doorstep by trusted helpers from your campus community.
                  </p>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="glass-card border-0 shadow-2xl sticky top-24">
                <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-accent/20 rounded-full">
                      📊 
                    </div>
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-muted-foreground">Items:</h4>
                      {items.filter(item => item.itemName.trim()).length > 0 ? (
                        items.filter(item => item.itemName.trim()).map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                            <div>
                              <span className="font-medium">{item.itemName}</span>
                              <span className="text-sm text-muted-foreground ml-2">× {item.quantity}</span>
                            </div>
                            <span className="font-semibold text-primary">₹{(item.mrp * item.quantity).toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No items added yet</p>
                          <p className="text-sm">Add some delicious items to your cart!</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between text-lg">
                        <span>Items Total:</span>
                        <span className="font-semibold">₹{totalMRP.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Delivery Charge ({deliveryChargePercent}%):</span>
                        <span>₹{deliveryCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-xl border-t pt-3 text-gradient">
                        <span>Total Payable:</span>
                        <span>₹{totalPayable.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-accent/10 p-4 rounded-lg">
                      <h4 className="font-medium text-accent mb-2 flex items-center gap-2">
                        💡 Quick Tips
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Keep your phone ready for delivery updates</li>
                        <li>• Accurate location helps faster delivery</li>
                        <li>• Payment on delivery only</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}