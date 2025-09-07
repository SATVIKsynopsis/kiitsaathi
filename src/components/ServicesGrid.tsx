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
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: Package,
    title: "Carton Packing & Hostel Transfers",
    description: "Making moving day hassle free with cartons, packing and hostel to hostel delivery – All in one tap.",
    price: "₹50/carton",
    gradient: "from-kiit-green to-campus-blue",
  },
  {
    icon: Printer,
    title: "Printouts on Demand",
    description: "Too lazy to go out? Just send a PDF and get it printed and delivered.",
    price: "₹2/page",
    gradient: "from-campus-blue to-campus-purple",
  },
  {
    icon: Users,
    title: "Senior Connect",
    description: "Connect with experienced Seniors with genuine insights & book mentorship sessions with ease.",
    price: "₹99/session",
    gradient: "from-campus-purple to-campus-orange",
  },
  {
    icon: PenTool,
    title: "Handwritten Assignments",
    description: "Don't have time to write? We've got real students who'll do it for you - neat, accurate, and on time.",
    price: "₹5/page",
    gradient: "from-campus-orange to-kiit-green",
  },
  {
    icon: Calendar,
    title: "KIIT Societies, Fests and Sports",
    description: "One calendar. All societies. Never miss an interview again.",
    price: "Free",
    gradient: "from-kiit-green to-campus-blue",
  },
  {
    icon: Bot,
    title: "KIIT Saathi (AI Assistant)",
    description: "Lost? Hungry? Confused? Ask our chatbot — 24x7 KIIT help.",
    price: "Free",
    gradient: "from-campus-orange to-kiit-green",
  },
  {
    icon: MessageCircle,
    title: "Tutoring & Counselling",
    description: "Struggling in class or life? Book a session with a real senior mentor.",
    price: "₹199/hour",
    gradient: "from-campus-blue to-campus-purple",
  },
  {
    icon: BookOpen,
    title: "Study Material (PYQs, Notes, YouTube Videos)",
    description: "Seniors' notes, solved papers, lab manuals, and curated YouTube playlists — all in one place.",
    price: "₹49/subject",
    gradient: "from-kiit-green to-campus-blue",
  },
  {
    icon: Shield,
    title: "Campus Map",
    description: "Explore the vibrant campus of KIIT and everything it has to offer.",
    price: "Free",
    gradient: "from-campus-purple to-campus-orange",
  },
  {
    icon: Search,
    title: "Lost & Found Portal",
    description: "Lost your ID card? Found someone's AirPods? Report it here.",
    price: "Free",
    gradient: "from-campus-orange to-kiit-green",
  },
  {
    icon: Car,
    title: "Campus Tour Booking",
    description: "Auto tours for parents across KIIT, KIMS, and KISS campuses.",
    price: "₹500/tour",
    gradient: "from-kiit-green to-campus-blue",
  },
  {
    icon: Calculator,
    title: "SplitSaathi – Group Expense Manager",
    description: "Simplify how you and your friends split bills during trips, café visits, or fests.",
    price: "Free",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: BookOpen,
    title: "Book Buyback & Resale",
    description: "Sell your old semester books for a better price and help juniors save money — by students, for students.",
    price: "Fair Price",
    gradient: "from-campus-orange to-kiit-green",
  },
  {
    icon: PartyPopper,
    title: "KIIT Saathi Celebrations",
    description: "From surprise birthday parties to last-minute cake deliveries, decorations, and fun party combos — all planned & delivered for you.",
    price: "₹299+",
    gradient: "from-pink-500 to-purple-600",
  },
  {
    icon: Users,
    title: "KIIT Saathi Meetups",
    description: "Find your people, create your moments - campus meetups made easy",
    price: "Free",
    gradient: "from-pink-500 to-purple-600",
  },
  {
    icon: ShoppingBag,
    title: "Food and micro-essentials delivery",
    description: "From wholesome mini meals to everyday essentials - delivered from trusted campus and nearby stores.",
    price: "₹20 delivery",
    gradient: "from-campus-blue to-campus-purple",
  }
];

export const ServicesGrid = () => {
  const navigate = useNavigate();

  const handleServiceClick = (service: typeof services[0]) => {
    const routeMap: Record<string, string> = {
      "Carton Packing & Hostel Transfers": "/carton-transfer",
      "Printouts on Demand": "/printout-on-demand", 
      "Senior Connect": "/senior-connect",
      "Handwritten Assignments": "/handwritten-assignments",
      "KIIT Societies, Fests and Sports": "/interview-deadlines-tracker",
      "Lost & Found Portal": "/lost-and-found",
      "Campus Tour Booking": "/campus-tour-booking",
      "SplitSaathi – Group Expense Manager": "/split-saathi",
      "Book Buyback & Resale": "/book-buyback-sell",
      "KIIT Saathi Celebrations": "/celebrations",
      "KIIT Saathi Meetups": "/meetups",
      "KIIT Saathi (AI Assistant)": "/chatbot",
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
    <section className="py-20 bg-gradient-to-br from-kiit-green-soft to-white/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-6">
            <Star className="w-4 h-4" />
            18+ Campus Services
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
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={index}
                className="service-card group"
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
                  <h3 className="text-xl font-poppins font-semibold text-foreground group-hover:text-kiit-green transition-colors">
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
          })}
        </div>

        {/* Call to Action */}
        {/* <div className="text-center">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-poppins font-bold text-gradient mb-4">
              Ready to simplify your campus life?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of KIIT students who've already made their lives easier.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-kiit-green to-campus-blue text-white font-semibold px-8 py-4">
              Download Now - It's Free!
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div> */}
      </div>
    </section>
  );
};