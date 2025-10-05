import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "./components/ScrollToTop";
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
import ChatBotPage from "./pages/ChatBotPage";
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

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/chatbot" element={<ChatBotPage />} />
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);


