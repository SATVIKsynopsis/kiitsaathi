import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Package, Smartphone, Lamp, Shirt, Book, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const categories = [
  { id: 'books', name: 'Books', icon: Book, gradient: 'from-kiit-green to-fedkiit-green' },
  { id: 'electronics', name: 'Electronics', icon: Smartphone, gradient: 'from-campus-blue to-ecell-cyan' },
  { id: 'furniture', name: 'Furniture', icon: Lamp, gradient: 'from-usc-orange to-campus-orange' },
  { id: 'fashion', name: 'Fashion', icon: Shirt, gradient: 'from-campus-purple to-usc-maroon' },
  { id: 'other', name: 'Other', icon: Package, gradient: 'from-fedkiit-green to-usc-green' },
];

export default function Resale() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSellClick = () => {
    if (!user) {
      navigate('/auth', { state: { from: '/resale/new' } });
      return;
    }
    navigate('/resale/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-campus-blue/10 to-kiit-green/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-kiit-green to-campus-blue py-20 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              Resale Saathi
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Buy, sell, and exchange items within the KIIT campus community. Safe, verified, and student-first.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for books, electronics, furniture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-2xl bg-white/95 backdrop-blur border-0 shadow-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery) {
                      navigate(`/resale/search?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button
                size="lg"
                onClick={handleSellClick}
                className="bg-white text-kiit-green hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-6 text-lg rounded-2xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Sell an Item
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/resale/browse')}
                className="bg-white/20 backdrop-blur text-white border-white/30 hover:bg-white/30 shadow-xl px-8 py-6 text-lg rounded-2xl"
              >
                Browse Listings
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => navigate(`/resale/categories/${category.id}`)}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${category.gradient}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">{category.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Resale Saathi?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-kiit-green to-fedkiit-green">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Verified Students Only</h3>
              <p className="text-muted-foreground">Only @kiit.ac.in email holders can list and transact</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-campus-blue to-ecell-cyan">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">In-App Chat</h3>
              <p className="text-muted-foreground">Secure messaging without sharing personal contact details</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-usc-orange to-campus-orange">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Secure Payments</h3>
              <p className="text-muted-foreground">Optional escrow through Razorpay for safe transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-kiit-green to-campus-blue rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of KIIT students buying, selling, and exchanging items safely on campus
            </p>
            <Button
              size="lg"
              onClick={handleSellClick}
              className="bg-white text-kiit-green hover:bg-white/90 shadow-xl px-8 py-6 text-lg rounded-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              List Your First Item
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}