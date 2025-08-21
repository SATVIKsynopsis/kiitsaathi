import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Automatrix2.0 Agentic AI Workshop",
    date: "This Saturday, 16 Aug",
    time: "10:00 AM",
  },
  {
    id: 2,
    title: "Fed Hackathon",
    date: "Saturday",
    time: "10:00 AM",
  },
  {
    id: 3,
    title: "Cultural Night - Music & Dance",
    date: "Sunday, 17 Aug",
    time: "6:00 PM",
  },
  {
    id: 4,
    title: "Career Fair 2024",
    date: "Monday, 18 Aug",
    time: "9:00 AM",
  }
];

export const NotificationBell = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [eventTextVisible, setEventTextVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create soft ding sound using Web Audio API
  const playDingSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported');
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
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500); // Delay before showing the bell

    return () => clearTimeout(showTimer);
  }, []);

  // Handle landing animation and sound
  useEffect(() => {
    if (isVisible && !hasLanded) {
      const landTimer = setTimeout(() => {
        setHasLanded(true);
        playDingSound();
        // Start showing events after landing
        setTimeout(() => {
          setEventTextVisible(true);
        }, 5000); // Delay before showing event text
      }, 8000); // Match animation duration

      return () => clearTimeout(landTimer);
    }
  }, [isVisible, hasLanded]);

  // Cycle through events with exact timing
  useEffect(() => {
    if (!hasLanded || !shouldShow) return;

    const cycleEvents = () => {
      // Fade out current event (0.5s)
      setEventTextVisible(false);

      setTimeout(() => {
        // Move to next event after fade out completes
        setCurrentEventIndex((prev) => (prev + 1) % upcomingEvents.length);
        // Fade in new event (0.5s)
        setEventTextVisible(true);
      }, 500); // Adjusted to 0.5s for fade out completion
    };

    // Initial event shows for 4s, then cycles every 5s (4s visible + 0.5s fade out + 0.5s fade in)
    const timer = setTimeout(() => {
      const interval = setInterval(cycleEvents, 5000); // Cycle every 5 seconds
      return () => clearInterval(interval);
    }, 4000); // First event shows for 4 seconds

    return () => clearTimeout(timer);
  }, [hasLanded, shouldShow, currentEventIndex]);

  if (!shouldShow) return null;

  const currentEvent = upcomingEvents[currentEventIndex];

  return (
    <div className="fixed top-14 right-6 z-50 pointer-events-none mt-6">
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

        {hasLanded && (
  <div
    className={`
      absolute sm:top-0 sm:right-20 top-16 right-0 
      max-w-xl sm:max-w-xl md:max-w-xl  // Increased width here
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

      <div className="relative flex items-start gap-2 sm:gap-3"> {/* Changed to flex for proper alignment */}

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
  );
}
