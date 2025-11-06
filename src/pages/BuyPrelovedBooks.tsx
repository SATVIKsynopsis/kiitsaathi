import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Search,
  Filter,
  ShoppingCart,
  Star,
  Users,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Package,
  DollarSign,
  Plus,
  Minus,
  X,
  Sparkles,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { GuestBrowsingBanner } from "@/components/GuestBrowsingBanner";
import { BuyBooksSection } from "@/components/services/book-buy-sell/BuyBooksSection";

interface AvailableBook {
  id: string;
  condition: string;
  selling_price: number;
  semester_book: {
    book_name: string;
    author: string;
    edition: string;
    publisher: string;
    semester: number;
  };
}

interface CartItem extends AvailableBook {
  quantity: number;
}

const BuyPrelovedBooks = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
      {!user && <GuestBrowsingBanner />}
      
      <BuyBooksSection />
      
      {/* Benefits Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Why Buy Pre-Loved Books?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold mb-2">Save Money</h3>
              <p className="text-muted-foreground">Get quality books at 30-70% lower prices than new ones</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-muted-foreground">Reduce waste by giving books a second life</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-semibold mb-2">Help Seniors</h3>
              <p className="text-muted-foreground">Support your seniors by buying their books</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BuyPrelovedBooks;