import { Toaster } from "@/components/ui/toaster";

import { Toaster as Sonner } from "@/components/ui/sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { AuthProvider } from "@/hooks/useAuth";

import { PolicyWrapper } from "@/components/PolicyWrapper";

import ScrollToTop from "./components/ScrollToTop";

import RouteLogger from "./components/RouteLogger";

import { Toaster as HotToaster } from "react-hot-toast";

import Index from "./pages/Index";

import NotFound from "./pages/NotFound";

import CartonTransfer from "./pages/CartonTransfer";

import SeniorConnect from "./pages/SeniorConnect";

import HandwrittenAssignments from "./pages/HandwrittenAssignments";

import LostAndFound from "./pages/LostAndFound";

import SplitSaathi from "./pages/SplitSaathi";

import GroupDashboard from "./pages/GroupDashboard";

import StudyMaterial from "./pages/StudyMaterial";

import BookBuyback from "./pages/BookBuyback";

import BuyPrelovedBooks from "./pages/BuyPrelovedBooks";

import BookBuybackSell from "./pages/BookBuybackSell";

import Celebrations from "./pages/Celebrations";

import PrintoutOnDemand from "./pages/PrintoutOnDemand";

import Meetups from "./pages/Meetups";

import CampusTourBooking from "./pages/CampusTourBooking";

import Auth from "./pages/Auth";

import AuthCallback from "./pages/AuthCallback";

import ResetPassword from "./pages/ResetPassword";

import ChatBotPage from "./pages/ChatBotPage";

import OrderHistory from "./pages/OrderHistory";

import KiitSocieties from "./pages/KiitSocieties";

import SkillEnhancingSessions from "./pages/SkillEnhancingSessions";

import InterviewDeadlinesTracker from "./pages/InterviewDeadlinesTracker";

import CourseStructure from "./pages/CourseStructure";

import TimetableSaathi from "./pages/TimetableSaathi";

import FestAnnouncements from "./pages/FestAnnouncements";

import SportsEventsHub from "./pages/SportsEventsHub";

import FoodOrderCustomer from "./pages/FoodOrderCustomer";

import FoodOrderHelper from "./pages/FoodOrderHelper";

import CampusMap from "./pages/CampusMap";

import CampusMapView from "./pages/CampusMapView";

import Campus25 from "./pages/Campus25";

import SGPACalculator from "./pages/SGPACalculator";

import AdminDashboard from "./pages/AdminDashboard";

import { AdminGuard } from "@/components/AdminGuard";

import ResumeSaathi from "./pages/ResumeSaathi/ResumeSaathi";


import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

import BakeryDashboard from "./pages/BakeryDashboard";

import Feedback from "./pages/Feedback";

import Resale from "./pages/Resale";

import ResaleBrowse from "./pages/ResaleBrowse";

import ResaleNewListing from "./pages/ResaleNewListing";

import ResaleListingDetail from "./pages/ResaleListingDetail";

import ResaleChat from "./pages/ResaleChat";

import ResaleCheckout from "./pages/ResaleCheckout";

import ResaleTransactions from "./pages/ResaleTransactions";

import ResaleFavourites from "./pages/ResaleFavourites";

import ResaleMyListings from "./pages/ResaleMyListings";

import Loader from "./components/Loader";

import { Analytics } from "@vercel/analytics/react";

import { SpeedInsights } from "@vercel/speed-insights/react";

import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// ✅ Routes component (contains useLocation safely inside BrowserRouter)

const AppRoutes = () => {
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => setLoading(false), 1000);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <ScrollToTop />

      <RouteLogger />

      <Loader loading={loading} />

      <Routes>
        <Route path="/" element={<Index />} />

        <Route path="/carton-transfer" element={<CartonTransfer />} />

        <Route path="/senior-connect" element={<SeniorConnect />} />

        <Route
          path="/handwritten-assignments"
          element={<HandwrittenAssignments />}
        />

        <Route path="/lost-and-found" element={<LostAndFound />} />

        <Route path="/timetable-saathi" element={<TimetableSaathi />} />

        <Route path="/split-saathi" element={<SplitSaathi />} />

        <Route
          path="/split-saathi/group/:groupId"
          element={<GroupDashboard />}
        />

        <Route path="/study-material" element={<StudyMaterial />} />

        <Route path="/book-buyback" element={<BookBuyback />} />

        <Route path="/book-buyback-sell" element={<BookBuybackSell />} />

        <Route path="/buy-preloved-books" element={<BuyPrelovedBooks />} />

        <Route path="/celebrations" element={<Celebrations />} />

        <Route path="/printout-on-demand" element={<PrintoutOnDemand />} />

        <Route path="/meetups" element={<Meetups />} />

        <Route path="/campus-tour-booking" element={<CampusTourBooking />} />

        <Route path="/kiit-societies" element={<KiitSocieties />} />

        <Route
          path="/skill-enhancing-sessions"
          element={<SkillEnhancingSessions />}
        />

        <Route
          path="/interview-deadlines-tracker"
          element={<InterviewDeadlinesTracker />}
        />

        <Route path="/course-structure" element={<CourseStructure />} />

        <Route path="/fest-announcements" element={<FestAnnouncements />} />

        <Route path="/sports-events-hub" element={<SportsEventsHub />} />

        <Route path="/food-order-customer" element={<FoodOrderCustomer />} />

        <Route path="/food-order-helper" element={<FoodOrderHelper />} />

        <Route path="/order-history" element={<OrderHistory />} />

        <Route path="/auth" element={<Auth />} />

        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/chatbot" element={<ChatBotPage />} />

        {/* Campus Map Routes */}

        <Route path="/campus-map" element={<CampusMap />} />

        <Route path="/campus-map/:campusId" element={<CampusMapView />} />

        <Route path="/campus-map/campus-25" element={<Campus25 />} />

        <Route path="/sgpa-calculator" element={<SGPACalculator />} />

        <Route
          path="/admin-dashboard"
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          }
        />

        <Route path="/resume-saathi" element={<ResumeSaathi />} />

        

        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        <Route path="/bakery-dashboard" element={<BakeryDashboard />} />

        <Route path="/feedback" element={<Feedback />} />

        {/* Resale Routes */}

        <Route path="/resale" element={<Resale />} />

        <Route path="/resale/browse" element={<ResaleBrowse />} />

        <Route path="/resale/new" element={<ResaleNewListing />} />

        <Route path="/resale/:id" element={<ResaleListingDetail />} />

        <Route path="/resale/categories/:category" element={<ResaleBrowse />} />

        <Route path="/resale/chat/:conversationId" element={<ResaleChat />} />

        <Route path="/resale/checkout/:id" element={<ResaleCheckout />} />

        <Route path="/resale/transactions" element={<ResaleTransactions />} />

        <Route path="/resale/favourites" element={<ResaleFavourites />} />

        <Route path="/resale/my-listings" element={<ResaleMyListings />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

// ✅ The main App (with a single BrowserRouter)

const App = () => {
  // ✅ Google Analytics setup

  useEffect(() => {
    const script1 = document.createElement("script");

    script1.async = true;

    script1.src = "https://www.googletagmanager.com/gtag/js?id=G-VYT7GP1CJE";

    const script2 = document.createElement("script");

    script2.innerHTML = `

      window.dataLayer = window.dataLayer || [];

      function gtag(){dataLayer.push(arguments);}

      gtag('js', new Date());

      gtag('config', 'G-VYT7GP1CJE');

    `;

    document.head.appendChild(script1);

    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);

      document.head.removeChild(script2);
    };
  }, []);

  // ✅ Existing security + UI logic

  // useEffect(() => {
  //   document.body.style.margin = "0";

  //   document.body.style.padding = "0";

  //   document.documentElement.style.margin = "0";

  //   document.documentElement.style.padding = "0";

  //   const disableRightClick = (e) => e.preventDefault();

  //   document.addEventListener("contextmenu", disableRightClick);

  //   const disableShortcuts = (e) => {
  //     if (
  //       e.ctrlKey &&
  //       (e.key === "u" ||
  //         e.key === "U" ||
  //         e.key === "s" ||
  //         e.key === "S" ||
  //         e.key === "p" ||
  //         e.key === "P" ||
  //         e.key === "x" ||
  //         e.key === "X" ||
  //         e.key === "a" ||
  //         e.key === "A" ||
  //         e.key === "F12")
  //     ) {
  //       e.preventDefault();

  //       alert("This action is disabled to protect content.");
  //     }
  //   };

  //   document.addEventListener("keydown", disableShortcuts);

  //   const checkDevTools = () => {
  //     const start = performance.now();

  //     debugger;

  //     const end = performance.now();

  //     if (end - start > 100) {
  //       alert("Developer Tools detected! Please close it to continue.");

  //       window.location.reload();
  //     }
  //   };

  //   const interval = setInterval(checkDevTools, 2000);

  //   return () => {
  //     document.removeEventListener("contextmenu", disableRightClick);

  //     document.removeEventListener("keydown", disableShortcuts);

  //     clearInterval(interval);
  //   };
  // }, []);

  // ✅ Main return (unchanged)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PolicyWrapper>
          <TooltipProvider>
            <HotToaster position="top-center" />

            <Toaster />

            <Sonner />

            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>

            <Analytics />

            <SpeedInsights />
          </TooltipProvider>
        </PolicyWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
