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
  FileText,
  GraduationCap,
  Heart,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useServiceVisibility } from "@/hooks/useServiceVisibility";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  // {
  //   id: "timetable-saathi",
  //   icon: Calendar,
  //   title: "Timetable Saathi",
  //   description: "View your class schedule with real-time updates",
  //   price: "Free",
  //   gradient: "from-indigo-500 to-purple-500",
  // },
  {
    id: "kiit-societies-fests-sports",
    icon: Calendar,
    title: "KIIT Societies, Fests and Sports",
    description: "One calendar. All societies. Never miss an interview again.",
    price: "Free",
    gradient: "from-campus-purple to-usc-maroon",
  },
  {
    id: "course-faculty-details",
    icon: GraduationCap,
    title: "Course & Faculty Details",
    description: "Complete course structure and faculty information for all semesters.",
    price: "Free",
    gradient: "from-blue-500 to-cyan-500",
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
    id: "sgpa-cgpa-calculator",
    icon: Calculator,
    title: "SGPA & CGPA Calculator",
    description: "Calculate your semester and overall CGPA with accurate KIIT curriculum and grade-wise calculations.",
    price: "Free",
    gradient: "from-kiit-green to-campus-blue",
    action: () => window.location.href = "/sgpa-calculator",
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
    id: "donation-saathi",
    icon: Heart,
    title: "Donation Saathi",
    description: "Extend a helping hand — donate books, food, and essentials to those in need through the KIIT community.",
    price: "Coming Soon",
    gradient: "from-kiit-green to-campus-orange",
  },
  {
    id: "student-mental-wellness",
    icon: Brain,
    title: "Student Mental Wellness",
    description: "Because your mind matters — find support and guidance for emotional and mental well-being.",
    price: "Coming Soon",
    gradient: "from-campus-blue to-ecell-cyan",
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
    id: "resale-saathi",
    icon: ShoppingBag,
    title: "Resale Saathi",
    description: "Buy, sell, and exchange items within the KIIT campus. Verified students only, safe transactions.",
    price: "Free to List",
    gradient: "from-campus-blue to-kiit-green",
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
  const { visibilityMap, loading, hasFetchedData } = useServiceVisibility();
  const { user, loading: authLoading } = useAuth();
  
  // Admin emails - these are the ONLY emails that can see hidden services
  const ADMIN_EMAILS = ['adityash8997@gmail.com', '24155598@kiit.ac.in'];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');
  
  // Wait for both auth and visibility data to load
  const isDataReady = !authLoading && hasFetchedData;
  
  // Log admin status (only when data is ready)
  if (isDataReady) {
    if (isAdmin) {
      console.log('✅ Admin mode activated — all hidden services visible.');
    } else {
      console.log('🚫 Non-admin mode — hidden services completely hidden.');
    }
  }

  const handleServiceClick = (service: typeof services[0]) => {
    const routeMap: Record<string, string> = {
      "Carton Packing & Hostel Transfers": "/carton-transfer",
      "Printouts on Demand": "/printout-on-demand",
      "Resale Saathi": "/resale",
      "Senior Connect": "/senior-connect",
      "Handwritten Assignments": "/handwritten-assignments",
      "KIIT Societies, Fests and Sports": "/kiit-societies",
      "Lost & Found Portal": "/lost-and-found",
      "Timetable Saathi": "/timetable-saathi",
      "Campus Tour Booking": "/campus-tour-booking",
      "Resume Saathi": "/resume-saathi",
      "SplitSaathi – Group Expense Manager": "/split-saathi",
      "Book Buyback & Resale": "/book-buyback-sell",
      "KIIT Saathi Celebrations": "/celebrations",
      "KIIT Saathi Meetups": "/meetups",
      "KIIT Saathi (AI Assistant)": "/chatbot",
      "SGPA & CGPA Calculator": "/sgpa-calculator",
      "Course & Faculty Details": "/course-structure",
      "Food and micro-essentials delivery": "/food-order-customer",
      "Study Material (PYQs, Notes, YouTube Videos)": "/study-material",
      "Campus Map": "/campus-map"
    };

    const route = routeMap[service.title];
    if (route) {
      navigate(route);
    } else {
      // Show coming soon toast for services without pages
      toast({
        title: "Coming Soon!",
        description: "This service will be available in the next update.",
        duration: 3500,
        className: "bg-gradient-to-r from-kiit-green to-kiit-green-dark text-white border-none font-semibold",
      });
    }
  };

  return (
    <section className="py-4 sm:py-6 bg-gradient-to-br from-campus-blue/10 to-kiit-green/10">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 px-2 sm:px-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-kiit-green-dark mb-4 sm:mb-6">
            <Star className="w-3 h-3 sm:w-4 sm:h-4" />
            10+ Campus Services
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-4 sm:mb-6">
            Everything You Need
            <span className="block">In One Platform</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-black max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
            From academic support to daily essentials, we have built the complete ecosystem
            to enrich your KIIT experience. <span className="font-semibold text-kiit-green block">Because campus life is hectic enough already.</span>
          </p>
        </div>

        {/* Services Grid */}
        <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16 px-2 sm:px-4">
          {!isDataReady ? (
            <div className="col-span-full flex justify-center py-6 sm:py-8">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            services.map((service, index) => {
              const visibility = visibilityMap[service.id];
              const IconComponent = service.icon;
              
              // CRITICAL: For non-admins, services are hidden by default unless explicitly visible
              // For admins, all services are shown regardless of visibility
              let isVisible: boolean;
              let replacementText: string | null = null;
              
              if (isAdmin) {
                // Admins see everything, regardless of visibility settings
                isVisible = true;
              } else {
                // Non-admins (including unauthenticated users):
                // - If service has no visibility record, hide it (secure by default)
                // - If service has visibility record with visible=false, hide it
                // - Only show if visibility record exists AND visible=true
                if (!visibility) {
                  isVisible = false; // Hide services not in visibility table
                } else {
                  isVisible = visibility.visible;
                  replacementText = visibility.replaced_text;
                }
              }
              
              const isHidden = !isVisible;

              // For non-admins: completely skip hidden services (no DOM rendering at all)
              if (!isAdmin && isHidden && !replacementText) {
                return null;
              }

              // If service is hidden and has replacement text, show placeholder (non-admin only)
              if (!isAdmin && !isVisible && replacementText) {
                return (
                  <div
                    key={index}
                    className="service-card group opacity-85"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Service Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r ${service.gradient} opacity-50`}>
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>

                    {/* Placeholder Content */}
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg md:text-xl font-poppins font-semibold text-muted-foreground">
                        {replacementText}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm opacity-75">
                        Exciting new services are being developed and will be available soon.
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="font-semibold px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-muted text-muted-foreground">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // For admins: show all services (including hidden ones with badge)
              // For non-admins: show only visible services
              return (
                <div
                  key={index}
                  onClick={() => handleServiceClick(service)}
                  className="hover:shadow-md hover:shadow-green-600 service-card bg-white group text-kiit-green-dark cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Service Header */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r ${service.gradient}`}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2 px-2 sm:px-3 hover:bg-gray-200 hover:rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col items-start gap-1.5 sm:gap-2 mb-1">
                      <h3 className="text-base sm:text-lg md:text-xl hover:text-black font-poppins font-semibold text-foreground group-hover:text-kiit-green transition-colors">
                        {service.title}
                      </h3>
                      {isAdmin && isHidden && (
                        <Badge variant="secondary" className="bg-muted/80 text-muted-foreground text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                          🏷️ Hidden Service — Admin Only
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
                      {service.description}
                    </p>

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
