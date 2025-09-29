import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PolicyWrapper } from "@/components/PolicyWrapper";
import ScrollToTop from "./components/ScrollToTop";
import RouteLogger from "./components/RouteLogger";
import { Toaster as HotToaster } from 'react-hot-toast';
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
import ChatBotPage from "./pages/ChatBotPage";
import OrderHistory from "./pages/OrderHistory";
import KiitSocieties from "./pages/KiitSocieties";
import SkillEnhancingSessions from "./pages/SkillEnhancingSessions";
import InterviewDeadlinesTracker from "./pages/InterviewDeadlinesTracker";
import FestAnnouncements from "./pages/FestAnnouncements";
import SportsEventsHub from "./pages/SportsEventsHub";
import FoodOrderCustomer from "./pages/FoodOrderCustomer";
import FoodOrderHelper from "./pages/FoodOrderHelper";
import CampusMap from "./pages/CampusMap";
import CampusDetailPage from "./components/campus-map/CampusDetailPage";
import Campus25 from "./pages/Campus25";
import SGPACalculator from "./pages/SGPACalculator";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminGuard } from "@/components/AdminGuard";
import ResumeSaathi from "./pages/ResumeSaathi/ResumeSaathi";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import { useEffect } from "react";
import { lazy } from "react";

console.log('App.tsx: PrintoutOnDemand imported:', PrintoutOnDemand);

import BakeryDashboard from "./pages/BakeryDashboard";
import Resale from "./pages/Resale";
import ResaleBrowse from "./pages/ResaleBrowse";
import ResaleNewListing from "./pages/ResaleNewListing";
import ResaleListingDetail from "./pages/ResaleListingDetail";
import ResaleChat from "./pages/ResaleChat";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PolicyWrapper>
          <TooltipProvider>
            <HotToaster position="top-center" />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <RouteLogger />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/carton-transfer" element={<CartonTransfer />} />
                <Route path="/senior-connect" element={<SeniorConnect />} />
                <Route path="/handwritten-assignments" element={<HandwrittenAssignments />} />
                <Route path="/lost-and-found" element={<LostAndFound />} />
                <Route path="/split-saathi" element={<SplitSaathi />} />
                <Route path="/split-saathi/group/:groupId" element={<GroupDashboard />} />
                <Route path="/study-material" element={<StudyMaterial />} />
                <Route path="/book-buyback" element={<BookBuyback />} />
                <Route path="/book-buyback-sell" element={<BookBuybackSell />} />
                <Route path="/buy-preloved-books" element={<BuyPrelovedBooks />} />
                <Route path="/celebrations" element={<Celebrations />} />
                <Route path="/printout-on-demand" element={<PrintoutOnDemand />} />
                <Route path="/meetups" element={<Meetups />} />
                <Route path="/campus-tour-booking" element={<CampusTourBooking />} />
                <Route path="/kiit-societies" element={<KiitSocieties />} />
                <Route path="/skill-enhancing-sessions" element={<SkillEnhancingSessions />} />
                <Route path="/interview-deadlines-tracker" element={<InterviewDeadlinesTracker />} />
                <Route path="/fest-announcements" element={<FestAnnouncements />} />
                <Route path="/sports-events-hub" element={<SportsEventsHub />} />
                <Route path="/food-order-customer" element={<FoodOrderCustomer />} />
                <Route path="/food-order-helper" element={<FoodOrderHelper />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/chatbot" element={<ChatBotPage />} />
                <Route path="/campus-map" element={<CampusMap />} />
                <Route path="/campus-map/:campusId" element={<CampusDetailPage />} />
                <Route path="/campus-map/campus-25" element={<Campus25 />} />
                <Route path="/sgpa-calculator" element={<SGPACalculator />} />
                <Route path="/admin-dashboard" element={
                  <AdminGuard>
                    <AdminDashboard />
                  </AdminGuard>
                } />
                <Route path="/resume-saathi" element={<ResumeSaathi />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/bakery-dashboard" element={<BakeryDashboard />} />
                
                {/* Resale Saathi Routes */}
                <Route path="/resale" element={<Resale />} />
                <Route path="/resale/browse" element={<ResaleBrowse />} />
                <Route path="/resale/new" element={<ResaleNewListing />} />
                <Route path="/resale/:id" element={<ResaleListingDetail />} />
                <Route path="/resale/categories/:category" element={<ResaleBrowse />} />
                <Route path="/resale/chat/:conversationId" element={<ResaleChat />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PolicyWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
