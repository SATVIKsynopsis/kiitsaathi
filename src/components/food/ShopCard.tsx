import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, Ticket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ShopEditButton } from "@/components/ShopEditButton";

interface Shop {
  id: string;
  name: string;
  short_desc: string;
  tags: string[];
  photos: string[];
  contact_number: string | null;
  featured: boolean;
}

const HOSTED_URL = 'https://kiitsaathi-hosted.onrender.com';

const ShopCard = ({ shop }: { shop: Shop }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGenerateCoupon = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/food/generate-coupon/${shop.id}`);
  };

  const handleViewShop = async () => {
    // Track card click analytics
    try {
      await fetch(`${HOSTED_URL}/api/food/shop/${shop.id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          viewType: 'card_click',
          userId: user?.id || null
        })
      });
    } catch (error) {
      console.error('Error tracking shop view:', error);
    }
  };

  const photoUrl = shop.photos && shop.photos.length > 0
    ? shop.photos[0]
    : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400';

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={photoUrl}
          alt={shop.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        {shop.featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-900">
            <Star className="h-3 w-3 mr-1 fill-yellow-900" />
            Featured
          </Badge>
        )}
        <div className="absolute top-2 left-2">
          <ShopEditButton shopId={shop.id} shopName={shop.name} />
        </div>
      </div>

      <CardHeader className="pb-3">
        <h3 className="text-xl font-bold text-foreground line-clamp-1">{shop.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{shop.short_desc}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {shop.tags && shop.tags.slice(0, 3).map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link to={`/food/shop/${shop.id}`} onClick={handleViewShop}>
            <Button variant="outline" className="w-full" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <Button 
            variant="default" 
            className="w-full" 
            size="sm"
            onClick={handleGenerateCoupon}
          >
            <Ticket className="h-4 w-4 mr-2" />
            Coupon
          </Button>
        </div>

        {shop.contact_number && (
          <a href={`tel:${shop.contact_number}`} className="block">
            <Button variant="ghost" className="w-full" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              {shop.contact_number}
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopCard;