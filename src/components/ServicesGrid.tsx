import { 
  Package, 
  Printer, 
  Users, 
  PenTool, 
  Calendar, 
  ShoppingBag, 
  PartyPopper, 
  Bot, 
  BookOpen, 
  MessageCircle,
  Shield,
  Timer,
  Trophy,
  MapPin,
  Search,
  Car,
  Lightbulb,
  Star,
  ArrowRight,
  Calculator,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useServiceVisibility } from "@/hooks/useServiceVisibility";
import { Loader2 } from "lucide-react";

const services = [
  {
    id: "kiit-saathi-ai-assistant",
    icon: Bot,
    title: "KIIT Saathi (AI Assistant)",
    description: "Lost? Hungry? Confused? Ask our chatbot — 24x7 KIIT help.",
    price: "Free",
    gradient: "from-ecell-cyan to-campus-blue",
  },
  {
    id: "study-material",
    icon: BookOpen,
    title: "Study Material (PYQs, Notes, YouTube Videos)",
    description: "Seniors' notes, solved papers, lab manuals, and curated YouTube playlists — all in one place.",
    price: "Free",
    gradient: "from-kiit-green to-fedkiit-green",
  },
  {
    id: "lost-and-found-portal",
    icon: Search,
    title: "Lost & Found Portal",
    description: "Lost your ID card? Found someone's AirPods? Report it here.",
    price: "Free",
    gradient: "from-campus-orange to-usc-orange",
  },
  {
    id: "campus-map",
    icon: Shield,
    title: "Campus Map",
    description: "Explore the vibrant campus of KIIT and everything it has to offer.",
    price: "Free",
    gradient: "from-campus-blue to-kiit-green",
  },
  {
    id: "kiit-societies-fests-sports",
    icon: Calendar,
    title: "KIIT Societies, Fests and Sports",
    description: "One calendar. All societies. Never miss an interview again.",
    price: "Free",
    gradient: "from-campus-purple to-usc-maroon",
  },
  {
    id: "resume-saathi",
    icon: FileText,
    title: "Resume Saathi",
    description: "AI-powered ATS-optimized resume builder with multiple templates and instant PDF download.",
    price: "Free",
    gradient: "from-campus-blue to-ecell-cyan"
  },
  {
    id: "split-saathi",
    icon: Calculator,
    title: "SplitSaathi – Group Expense Manager",
    description: "Simplify how you and your friends split bills during trips, café visits, or fests.",
    price: "Free",
    gradient: "from-fedkiit-green to-usc-green",
  },
  {
    id: "sgpa-cgpa-calculator",
    icon: Calculator,
    title: "SGPA & CGPA Calculator",
    description: "Calculate your semester and overall CGPA with accurate KIIT curriculum and grade-wise calculations.",
    price: "Free",
    gradient: "from-kiit-green to-campus-blue",
    action: () => window.location.href = "/sgpa-calculator",
  },
  {
    id: "printout-on-demand",
    icon: Printer,
    title: "Printouts on Demand",
    description: "Too lazy to go out? Just send a PDF and get it printed and delivered.",
    price: "₹2/page",
    gradient: "from-usc-maroon to-campus-purple",
  },
  {
    id: "senior-connect",
    icon: Users,
    title: "Senior Connect",
    description: "Connect with experienced Seniors with genuine insights & book mentorship sessions with ease.",
    price: "₹99/session",
    gradient: "from-campus-purple to-ecell-cyan",
  },
  {
    id: "handwritten-assignments",
    icon: PenTool,
    title: "Handwritten Assignments",
    description: "Don't have time to write? We've got real students who'll do it for you - neat, accurate, and on time.",
    price: "₹5/page",
    gradient: "from-campus-orange to-campus-purple",
  },
  {
    id: "tutoring-counselling",
    icon: MessageCircle,
    title: "Tutoring & Counselling",
    description: "Struggling in class or life? Book a session with a real senior mentor.",
    price: "₹199/hour",
    gradient: "from-kiit-green to-campus-blue",
  },
  {
    id: "campus-tour-booking",
    icon: Car,
    title: "Campus Tour Booking",
    description: "Auto tours for parents across KIIT, KIMS, and KISS campuses.",
    price: "₹500/tour",
    gradient: "from-campus-blue to-fedkiit-green",
  },
  {
    id: "carton-packing-hostel-transfers",
    icon: Package,
    title: "Carton Packing & Hostel Transfers",
    description: "Making moving day hassle free with cartons, packing and hostel to hostel delivery – All in one tap.",
    price: "₹50/carton",
    gradient: "from-usc-orange to-campus-orange",
  },
  {
    id: "book-buyback-resale",
    icon: BookOpen,
    title: "Book Buyback & Resale",
    description: "Sell your old semester books for a better price and help juniors save money — by students, for students.",
    price: "Fair Price",
    gradient: "from-usc-green to-kiit-green",
  },
  {
    id: "kiit-saathi-celebrations",
    icon: PartyPopper,
    title: "KIIT Saathi Celebrations",
    description: "From surprise birthday parties to last-minute cake deliveries, decorations, and fun party combos — all planned & delivered for you.",
    price: "₹299+",
    gradient: "from-campus-purple to-campus-orange",
  },
  {
    id: "kiit-saathi-meetups",
    icon: Users,
    title: "KIIT Saathi Meetups",
    description: "Find your people, create your moments - campus meetups made easy",
    price: "Free",
    gradient: "from-ecell-cyan to-campus-purple",
  },
  {
    id: "food-micro-essentials-delivery",
    icon: ShoppingBag,
    title: "Food and micro-essentials delivery",
    description: "From wholesome mini meals to everyday essentials - delivered from trusted campus and nearby stores.",
    price: "₹20 delivery",
    gradient: "from-usc-orange to-fedkiit-green",
  }
];

export const ServicesGrid = () => {
  const navigate = useNavigate();
  const { visibilityMap, loading } = useServiceVisibility();

  const handleServiceClick = (service: typeof services[0]) => {
    const routeMap: Record<string, string> = {
      "Carton Packing & Hostel Transfers": "/carton-transfer",
      "Printouts on Demand": "/printout-on-demand", 
      "Senior Connect": "/senior-connect",
      "Handwritten Assignments": "/handwritten-assignments",
      "KIIT Societies, Fests and Sports": "/kiit-societies",
      "Lost & Found Portal": "/lost-and-found",
      "Campus Tour Booking": "/campus-tour-booking",
      "Resume Saathi": "/resume-saathi",
      "SplitSaathi – Group Expense Manager": "/split-saathi",
      "Book Buyback & Resale": "/book-buyback-sell",
      "KIIT Saathi Celebrations": "/celebrations",
      "KIIT Saathi Meetups": "/meetups",
      "KIIT Saathi (AI Assistant)": "/chatbot",
      "SGPA & CGPA Calculator": "/sgpa-calculator",
      "Food and micro-essentials delivery": "/food-order-customer",
      "Study Material (PYQs, Notes, YouTube Videos)": "/study-material",
      "Campus Map": "/campus-map"
    };

    const route = routeMap[service.title];
    if (route) {
      navigate(route);
    } else {
      // Show coming soon for services without pages
      alert("Coming Soon! This service is under development and will be available soon.");
    }
  };

  return (
    // <section className=" min-h-screen items-center justify-center overflow-hidden"
    //   >
    <section className="py-4 bg-gradient-to-br from-campus-blue/10 to-kiit-green/10"
         > 
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2  px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
            <Star className="w-4 h-4" />
            7+ Campus Services
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-6">
            Everything You Need
            <span className="block">In One App</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From academic support to daily essentials, we have built the complete ecosystem 
            to enrich your KIIT experience. <span className="font-semibold text-kiit-green">Because campus life is hectic enough already.</span>
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            services.map((service, index) => {
              const visibility = visibilityMap[service.id];
              const IconComponent = service.icon;

              // Check if service should be hidden
              if (visibility && !visibility.visible) {
                // If there's replacement text, show placeholder
                if (visibility.replaced_text) {
                  return (
                    <div 
                      key={index}
                      className="service-card group opacity-85"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Service Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl bg-gradient-to-r ${service.gradient} opacity-50`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Placeholder Content */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-poppins font-semibold text-muted-foreground">
                          {visibility.replaced_text}
                        </h3>
                        
                        <p className="text-muted-foreground leading-relaxed text-sm opacity-75">
                          Exciting new services are being developed and will be available soon.
                        </p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-semibold px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                // If no replacement text, skip rendering entirely
                return null;
              }

              // Render normal service card
              return (
                <div 
                  key={index}
                  className="service-card  group text-kiit-green-dark"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Service Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${service.gradient}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl hover:text-black font-poppins font-semibold text-foreground group-hover:text-kiit-green transition-colors">
                      {service.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className={`font-semibold px-3 py-1 rounded-full text-sm bg-gradient-to-r ${service.gradient} text-white`}>
                        {service.price}
                      </span>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                        onClick={() => handleServiceClick(service)}
                      >
                        Try Now
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};