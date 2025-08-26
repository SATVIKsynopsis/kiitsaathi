import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Phone, ShoppingBag, User, CheckCircle, Package } from 'lucide-react';
import { useFoodOrders, type FoodOrder } from '@/hooks/useFoodOrders';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function FoodOrderHelper() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, loading, acceptOrder, deliverOrder } = useFoodOrders();

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const acceptedOrders = orders.filter(order => order.status === 'accepted' && order.helper_id === user?.id);
  const deliveredOrders = orders.filter(order => order.status === 'delivered' && order.helper_id === user?.id);

  const formatPhoneNumber = (phone: string, isAccepted: boolean = false) => {
    if (!isAccepted) {
      return phone.slice(0, 2) + 'xxxx' + phone.slice(-4);
    }
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              Please sign in to access the helper dashboard
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const OrderCard = ({ order, showAcceptButton = false, showDeliverButton = false }: { 
    order: FoodOrder; 
    showAcceptButton?: boolean; 
    showDeliverButton?: boolean; 
  }) => (
    <Card key={order.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-4 w-4" />
              {order.customer_name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              {formatDate(order.created_at!)}
            </div>
          </div>
          <Badge variant={
            order.status === 'pending' ? 'secondary' : 
            order.status === 'accepted' ? 'default' : 'outline'
          }>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatPhoneNumber(order.phone_number, order.status !== 'pending')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{order.delivery_location}</span>
            </div>
          </div>

          <div>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4" />
              Items:
            </h4>
            <div className="space-y-1">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                  <span>{item.itemName} × {item.quantity}</span>
                  <span>₹{(item.mrp * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {order.special_notes && (
            <div>
              <h4 className="font-medium mb-1">Special Notes:</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                {order.special_notes}
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Items Total:</span>
              <span>₹{order.total_mrp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Delivery Charge ({order.delivery_charge_percent}%):</span>
              <span>₹{(order.total_payable - order.total_mrp).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Payable:</span>
              <span>₹{order.total_payable.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {showAcceptButton && (
              <Button 
                onClick={() => acceptOrder(order.id!)} 
                disabled={loading}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Order
              </Button>
            )}
            {showDeliverButton && (
              <Button 
                onClick={() => deliverOrder(order.id!)} 
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <Package className="h-4 w-4 mr-2" />
                Mark Delivered
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Helper Dashboard</h1>
          <p className="text-muted-foreground">Manage food delivery orders</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate('/food-order-customer')}>
              Create New Order
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Accepted ({acceptedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="delivered" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Delivered ({deliveredOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-muted/50 rounded-lg p-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Orders</h3>
                  <p className="text-muted-foreground">Check back later for new orders to accept</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  {pendingOrders.length} order{pendingOrders.length !== 1 ? 's' : ''} waiting for acceptance
                </p>
                {pendingOrders.map(order => (
                  <OrderCard key={order.id} order={order} showAcceptButton />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-muted/50 rounded-lg p-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Accepted Orders</h3>
                  <p className="text-muted-foreground">Orders you accept will appear here</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  {acceptedOrders.length} order{acceptedOrders.length !== 1 ? 's' : ''} in progress
                </p>
                {acceptedOrders.map(order => (
                  <OrderCard key={order.id} order={order} showDeliverButton />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            {deliveredOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-muted/50 rounded-lg p-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Delivered Orders</h3>
                  <p className="text-muted-foreground">Completed orders will appear here</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  {deliveredOrders.length} order{deliveredOrders.length !== 1 ? 's' : ''} completed
                </p>
                {deliveredOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}