import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
const upcomingEvents = [
  {
    id: 1,
    title: "Automatrix2.0 Agentic AI Workshop",
    date: "This Saturday, 16 Aug",
    time: "10:00 AM",
    section:"usc"
  },
  {
    id: 2,
    title: "Fed Hackathon",
    date: "Saturday",
    time: "10:00 AM",
    section:"fedkiit"
  },
  {
    id: 3,
    title: "Cultural Night - Music & Dance",
    date: "Sunday, 17 Aug",
    time: "6:00 PM",
    section:"korus"
  },
  {
    id: 4,
    title: "Career Fair 2024",
    date: "Monday, 18 Aug",
    time: "9:00 AM",
    section: "fedkiit"
  }
];

export function useUnlockAudio(audioRef: React.RefObject<HTMLAudioElement>) {
  useEffect(() => {
    const unlock = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current?.pause();
          audioRef.current.currentTime = 0; // reset
          console.log(" Audio unlocked!");
          document.removeEventListener("click", unlock);
        }).catch(() => {
          // Ignore if blocked
        });
      }
    };

    document.addEventListener("click", unlock, { once: true });
    return () => document.removeEventListener("click", unlock);
  }, [audioRef]);
}

export const NotificationBell = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [eventTextVisible, setEventTextVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);
  const [showEvents, setshowEvents] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {user} = useAuth();
  const navigate = useNavigate();
  useUnlockAudio(audioRef);



  // Create soft ding sound using Web Audio API
  const playDingSound = async () => {
    try {
      if (audioRef.current) {
        // Ensure playback is allowed
        await audioRef.current.play();
      }
    } catch (error) {
      console.log("Unable to play sound:", error);
    }
  };

  // Handle scroll to hide when past Services section
  useEffect(() => {
    const handleScroll = () => {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        const rect = servicesSection.getBoundingClientRect();
        const isPastServices = rect.bottom < window.innerHeight / 2;
        setShouldShow(!isPastServices);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show bell after page loads
  useEffect(() => {
    
    setIsVisible(true);
    playDingSound();
  }, []);

  // Handle landing animation 
  useEffect(() => {
    if (isVisible && !hasLanded) {
      const landTimer = setTimeout(() => {
        setHasLanded(true);
        // Start showing events after landing
        setTimeout(() => {
          setEventTextVisible(true);
        }, 100);
      }, 800); // Match animation duration

      return () => clearTimeout(landTimer);
    }
  }, [isVisible, hasLanded]);

  // Cycle through events with exact timing
  useEffect(() => {
    if (!showEvents || !hasLanded || !shouldShow) return;

    const cycleEvents = () => {
      // Fade out current event (0.5s)
      setEventTextVisible(false);
      
      setTimeout(() => {
        // Move to next event after fade out completes
        setCurrentEventIndex((prev) => (prev + 1) % upcomingEvents.length);
        // Fade in new event (0.5s)
        setEventTextVisible(true);
      }, 500); // Wait for fade out to complete
    };

    // Initial event shows for 4s, then cycles every 5s (4s visible + 0.5s fade out + 0.5s fade in)
    const timer = setTimeout(() => {
      const interval = setInterval(cycleEvents, 3000);
      return () => clearInterval(interval);
    }, 3000); // First event shows for 4 seconds

    return () => clearTimeout(timer);
  }, [showEvents, hasLanded, shouldShow, currentEventIndex]);

  if (!shouldShow) return null;

  const currentEvent = upcomingEvents[currentEventIndex];

  return (<>
  <audio ref={audioRef} src="src\assets\Ding.mp3" preload="auto" />
    <div onClick={()=>{setshowEvents(!showEvents); }} className=" fixed top-2 right-4 z-50 cursor-pointer">
      {/* Bell Icon */}
      <div className="relative flex items-start justify-end">
        <div
          className={`
            relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 
            text-white p-3 rounded-full shadow-lg
            transition-all duration-300 hover:scale-110
            ${isVisible ? 'animate-[dropDown_0.8s_ease-out]' : 'opacity-0 -translate-y-20'}
            ${hasLanded ? 'animate-[bellWiggle_0.5s_ease-in-out_0.8s]' : ''}
          `}
        >
          <Bell className="w-6 h-6" />
          
          {/* Golden glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300/30 to-amber-500/30 animate-pulse"></div>
          
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white">
            <div className="w-full h-full bg-red-500 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Event Text - Mobile responsive positioning */}
        {hasLanded && showEvents &&  (
          <div onClick={()=> navigate(`/kiit-societies#${currentEvent.section}`)}
            className={`
              absolute sm:top-0 sm:right-20 top-16 right-0 
              max-w-xs sm:max-w-sm md:max-w-md
              transition-all duration-500 pointer-events-auto
              ${eventTextVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
            `}
          >
            <div className="bg-gradient-to-br from-pink-100/90 via-purple-50/90 to-blue-100/90 
                          dark:from-pink-900/40 dark:via-purple-900/40 dark:to-blue-900/40 
                          rounded-2xl p-3 sm:p-4 shadow-2xl border border-pink-200/60 dark:border-purple-500/30
                          backdrop-blur-md relative overflow-hidden">
              
              {/* Soft glow background */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-300/20 via-purple-300/20 to-blue-300/20 rounded-2xl"></div>
              
              <div className="relative flex items-start gap-2 sm:gap-3">
                
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-lg text-purple-900 dark:text-purple-100 leading-tight">
                    {currentEvent.title}
                  </h3>
                  <p className="text-purple-700 dark:text-purple-200 text-xs sm:text-sm mt-1 opacity-90">
                    {currentEvent.date} • {currentEvent.time}
                  </p>
                </div>
              </div>
              
              {/* Floating sparkles */}
              <div className="absolute -top-1 -right-1 text-yellow-400 animate-pulse text-sm">
                
              </div>
              <div className="absolute -bottom-1 -left-1 text-pink-400 animate-pulse text-sm" style={{ animationDelay: '0.5s' }}>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </>);
};
