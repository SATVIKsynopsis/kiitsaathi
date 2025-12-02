import { useState } from 'react';
import InputCard from '../components/services/TimeTable/InputCard.js';
import TimetableCard from '../components/services/TimeTable/TimetableCard.js';
import { getFullWeekTimetable, getTodayTimetable } from '../utils/parseExcel.js';
import { toast } from 'sonner';
import { Footer } from '@/components/Footer.js';
import { Navbar } from '@/components/Navbar.js';


const TimetableSaathi = () => {
  const [loading, setLoading] = useState(false);
  const [timetableData, setTimetableData] = useState<any | null>(null);
  const [view, setView] = useState<'today' | 'week'>('today');

  const handleRollNumberSubmit = async (rollNumber: string, viewType: 'today' | 'week') => {
    setView(viewType);

    setLoading(true);

    try {
      const fullData = await getFullWeekTimetable(rollNumber);
      const todayData = await getTodayTimetable(rollNumber); // For initial view
      setTimetableData({ ...fullData, today: todayData });

      if (todayData.timetable.length === 0) {
        toast.success("No classes today! 🎉");
      } else {
        toast.success(`Timetable loaded for ${fullData.section}!`);
      }
    } catch (error: any) {
      console.error("Error fetching timetable:", error);
      toast.error(error?.message || "Roll number not found. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setTimetableData(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <Navbar />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {loading ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-foreground text-lg">Loading your timetable...</p>
          </div>
        ) : timetableData ? (
          <TimetableCard
            data={timetableData}
            view={view}
            onViewChange={setView}
            onBack={handleBack}
          />
        ) : (
          <InputCard onSubmit={handleRollNumberSubmit} />
        )}
      </div>
      <Footer />

    </div>
  );
};

export default TimetableSaathi;
