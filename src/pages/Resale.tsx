import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, Plus, Book, Smartphone, Lamp, Shirt, Wrench, Box,
  Shield, MessageCircle, Lock, CheckCircle, TrendingUp, Star,
  Clock, Users, ArrowRight, Sparkles, Award, HelpCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const categories = [
  { id: 'books', name: 'Books', icon: Book, gradient: 'from-kiit-green to-fedkiit-green', count: '500+' },
  { id: 'electronics', name: 'Electronics', icon: Smartphone, gradient: 'from-campus-blue to-ecell-cyan', count: '320+' },
  { id: 'furniture', name: 'Furniture', icon: Lamp, gradient: 'from-usc-orange to-campus-orange', count: '150+' },
  { id: 'fashion', name: 'Fashion', icon: Shirt, gradient: 'from-campus-purple to-usc-maroon', count: '280+' },
  { id: 'essentials', name: 'Essentials', icon: Wrench, gradient: 'from-fedkiit-green to-kiit-green', count: '200+' },
  { id: 'other', name: 'Miscellaneous', icon: Box, gradient: 'from-usc-green to-campus-blue', count: '180+' },
];

const featuredListings = [
  { id: 1, title: 'Physics Textbook Set', price: 799, image: '📚', seller: 'Priya S.', rating: 4.8, promoted: true },
  { id: 2, title: 'Study Lamp (LED)', price: 450, image: '💡', seller: 'Rahul K.', rating: 4.9, promoted: false },
  { id: 3, title: 'Laptop Stand', price: 599, image: '💻', seller: 'Ananya M.', rating: 5.0, promoted: true },
  { id: 4, title: 'Winter Jacket', price: 1200, image: '🧥', seller: 'Aditya P.', rating: 4.7, promoted: false },
];

const testimonials = [
  { name: 'Sneha R.', text: 'Sold my old books in 2 days! Super easy and safe.', rating: 5 },
  { name: 'Rohan M.', text: 'Found a great laptop deal. Highly recommend!', rating: 5 },
  { name: 'Kavya S.', text: 'Love the in-app chat feature. Makes everything secure.', rating: 5 },
];

const faqs = [
  { q: 'How do I verify a seller?', a: 'All sellers are verified KIIT students with @kiit.ac.in emails.' },
  { q: 'Is payment secure?', a: 'We offer optional Razorpay escrow for safe transactions.' },
  { q: 'Can I exchange items?', a: 'Yes! Use our exchange flow to swap items with other students.' },
];

export default function Resale() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSellClick = () => {
    if (!user) {
      navigate('/auth', { state: { from: '/resale/new' } });
      return;
    }
    navigate('/resale/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-kiit-green-soft to-background">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-kiit-green via-campus-blue to-campus-purple py-24 px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              India's First Campus Marketplace
            </Badge>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl leading-tight">
              Buy. Sell. Resell.<br />
              <span className="text-6xl md:text-8xl">The Smarter Way 🚀</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto font-medium">
              Join 5,000+ KIIT students trading safely on campus. Books, electronics, furniture & more!
            </p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mt-12">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for books, electronics, furniture, fashion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-16 pr-6 py-8 text-lg rounded-3xl bg-white shadow-2xl border-0 focus:ring-4 focus:ring-white/50 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery) {
                      navigate(`/resale/browse?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              <Button
                size="lg"
                onClick={handleSellClick}
                className="bg-white text-kiit-green hover:bg-white/90 shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300 px-10 py-7 text-xl rounded-2xl font-bold group"
              >
                <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
                Start Selling Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/resale/browse')}
                className="bg-white/10 backdrop-blur-md text-white border-2 border-white/40 hover:bg-white/20 shadow-2xl px-10 py-7 text-xl rounded-2xl font-bold"
              >
                Browse Products
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 pt-12 border-t border-white/30">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white">5K+</div>
                <div className="text-white/80 mt-2 text-sm md:text-base">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white">12K+</div>
                <div className="text-white/80 mt-2 text-sm md:text-base">Products Listed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white">98%</div>
                <div className="text-white/80 mt-2 text-sm md:text-base">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="bg-kiit-green/10 text-kiit-green border-kiit-green/20 mb-4">
              Shop Smart
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find exactly what you need from verified KIIT students
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  onClick={() => navigate(`/resale/browse?category=${category.id}`)}
                  className="group relative overflow-hidden rounded-3xl p-8 bg-card hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-kiit-green hover:-translate-y-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                    <div className={`p-5 rounded-2xl bg-gradient-to-br ${category.gradient} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-kiit-green transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.count} items</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 px-4 bg-kiit-green-soft/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <Badge className="bg-usc-orange/10 text-usc-orange border-usc-orange/20 mb-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending Now
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Featured Listings
              </h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/resale/browse')} className="hidden md:flex">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((item) => (
              <Card
                key={item.id}
                onClick={() => navigate(`/resale/${item.id}`)}
                className="group relative overflow-hidden rounded-3xl cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-kiit-green"
              >
                {item.promoted && (
                  <Badge className="absolute top-4 right-4 z-10 bg-gradient-to-r from-usc-orange to-campus-orange text-white border-0">
                    <Award className="w-3 h-3 mr-1" />
                    Promoted
                  </Badge>
                )}
                <div className="aspect-square bg-gradient-to-br from-kiit-green-soft to-campus-blue/10 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
                  {item.image}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-kiit-green transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-kiit-green">₹{item.price}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-usc-orange text-usc-orange" />
                      {item.rating}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-muted-foreground">Sold by {item.seller}</span>
                    <Button size="sm" variant="ghost" className="text-kiit-green hover:text-kiit-green">
                      View <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="bg-campus-blue/10 text-campus-blue border-campus-blue/20 mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Safe & Secure
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose Resale Saathi?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by students, for students. Your safety is our priority.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center space-y-6 rounded-3xl border-2 hover:border-kiit-green hover:shadow-xl transition-all duration-300">
              <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-kiit-green to-fedkiit-green shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Verified Students Only ✅</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Only @kiit.ac.in email holders can list and transact. No outsiders, 100% KIIT community.
                </p>
              </div>
            </Card>

            <Card className="p-8 text-center space-y-6 rounded-3xl border-2 hover:border-campus-blue hover:shadow-xl transition-all duration-300">
              <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-campus-blue to-ecell-cyan shadow-lg">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Easy Communication 💬</h3>
                <p className="text-muted-foreground leading-relaxed">
                  In-app real-time chat. No need to share personal contact details until you're ready.
                </p>
              </div>
            </Card>

            <Card className="p-8 text-center space-y-6 rounded-3xl border-2 hover:border-usc-orange hover:shadow-xl transition-all duration-300">
              <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-usc-orange to-campus-orange shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Secure Transactions 🔒</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Optional Razorpay escrow. Money held safely until delivery confirmed. Zero fraud.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-kiit-green-soft to-campus-blue/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="bg-campus-purple/10 text-campus-purple border-campus-purple/20 mb-4">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start buying or selling
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-1 bg-gradient-to-r from-kiit-green via-campus-blue to-usc-orange -z-10"></div>

            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-kiit-green to-fedkiit-green flex items-center justify-center text-4xl font-bold text-white shadow-2xl mx-auto">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-campus-orange rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold">Post Your Item</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload photos, set your price, and describe your item. Takes less than 2 minutes!
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-campus-blue to-ecell-cyan flex items-center justify-center text-4xl font-bold text-white shadow-2xl mx-auto">
                  2
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-campus-orange rounded-full animate-pulse delay-500"></div>
              </div>
              <h3 className="text-2xl font-bold">Connect with Buyers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive offers and chat securely in-app. Negotiate price and meet on campus.
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-usc-orange to-campus-orange flex items-center justify-center text-4xl font-bold text-white shadow-2xl mx-auto">
                  3
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-campus-orange rounded-full animate-pulse delay-1000"></div>
              </div>
              <h3 className="text-2xl font-bold">Exchange & Review</h3>
              <p className="text-muted-foreground leading-relaxed">
                Complete the deal safely on campus. Leave a review to build trust in the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="bg-usc-green/10 text-usc-green border-usc-green/20 mb-4">
              <Users className="w-4 h-4 mr-2" />
              Student Voices
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              What Students Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real reviews from real KIIT students
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-8 rounded-3xl border-2 hover:border-kiit-green hover:shadow-xl transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-usc-orange text-usc-orange" />
                  ))}
                </div>
                <p className="text-lg text-foreground mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kiit-green to-campus-blue flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">KIIT Student</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-kiit-green-soft/20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <Badge className="bg-campus-blue/10 text-campus-blue border-campus-blue/20 mb-4">
              <HelpCircle className="w-4 h-4 mr-2" />
              Got Questions?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 mb-12">
            {faqs.map((faq, idx) => (
              <Card
                key={idx}
                className="p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-300 border-2"
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{faq.q}</h3>
                  <div className={`transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {expandedFaq === idx && (
                  <p className="mt-4 text-muted-foreground leading-relaxed">{faq.a}</p>
                )}
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-6">Still need help? Submit a request!</p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open('https://forms.gle/your-form-link', '_blank')}
              className="rounded-2xl px-8 py-6"
            >
              Request Resource <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-kiit-green via-campus-blue to-usc-orange">
        <div className="container mx-auto max-w-5xl">
          <Card className="relative overflow-hidden rounded-3xl p-16 text-center bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-kiit-green/20 to-campus-blue/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-usc-orange/20 to-campus-purple/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <Badge className="bg-gradient-to-r from-kiit-green to-campus-blue text-white border-0 mb-6 px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Join 5,000+ Students Today
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                List your first item in under 2 minutes. Sell faster, earn more, and connect with your campus community.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  onClick={handleSellClick}
                  className="bg-gradient-to-r from-kiit-green to-campus-blue text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 px-10 py-7 text-xl rounded-2xl font-bold"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  List Your First Item
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/resale/browse')}
                  className="border-2 px-10 py-7 text-xl rounded-2xl font-bold hover:bg-muted"
                >
                  Browse Listings
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}