import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Heart, Box, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import kiitMascot from "@/assets/kiit-mascot.png";
import heroCampus from "@/assets/KIIT_img.webp";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import { useRef, useEffect, useState, useMemo } from "react";

export const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [ripples, setRipples] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [trails, setTrails] = useState<Array<{id: number, x: number, y: number}>>([]);
  const heroRef = useRef<HTMLElement>(null);

  // Fix for static grid generation
  const gridCells = useMemo(() => {
    if (typeof window === 'undefined') return [];
    const cols = Math.ceil(window.innerWidth / 40);
    const rows = Math.ceil(window.innerHeight / 40);
    return Array.from({ length: cols * rows }, (_, i) => i);
  }, []);

  // Interactive grid and cursor trail effects
  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return;

    let trailId = 0;
    let rippleId = 0;
    let lastCursorUpdate = 0;

    // Cursor tracking and trail creation
    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setCursorPos({ x, y });

      // Throttle trail creation for performance
      const now = Date.now();
      if (now - lastCursorUpdate > 16) { // ~60fps
        setTrails(prev => {
          const newTrail = { id: trailId++, x, y };
          const newTrails = [...prev, newTrail].slice(-20); // Limit to 20 trails
          
          // Auto-remove trail after animation
          setTimeout(() => {
            setTrails(current => current.filter(t => t.id !== newTrail.id));
          }, 800);
          
          return newTrails;
        });
        lastCursorUpdate = now;
      }
    };

    // Ripple effect on click
    const handleClick = (e: MouseEvent) => {
      const rect = heroElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = { id: rippleId++, x, y };
      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(current => current.filter(r => r.id !== newRipple.id));
      }, 1200);
    };

    heroElement.addEventListener('mousemove', handleMouseMove);
    heroElement.addEventListener('click', handleClick);

    return () => {
      heroElement.removeEventListener('mousemove', handleMouseMove);
      heroElement.removeEventListener('click', handleClick);
    };
  }, []);

   const scrollToSection = (href: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

    const sliderRef = useRef<HTMLDivElement>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const dots = document.querySelectorAll('#dot-indicators span');
    const totalSlides = dots.length;

    const goToSlide = (index: number) => {
  if (!sliderRef.current) return;
  const slideWidth = sliderRef.current.clientWidth;
  sliderRef.current.style.transform = `translateX(-${index * slideWidth}px)`;

  const dots = document.querySelectorAll('#dot-indicators span');
  dots.forEach(dot => dot.classList.remove('bg-black'));
  if (dots[index]) dots[index].classList.add('bg-black');
};

    useEffect(() => {
  goToSlide(currentSlide); // show initial slide
  const interval = setInterval(() => {
    setCurrentSlide(prev => {
      const next = (prev + 1) % 5; // number of slides
      goToSlide(next);
      return next;
    });
  }, 3000);

  return () => clearInterval(interval);
}, []);


  return (
    <section 
      ref={heroRef}
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 70%, #15803d 100%)',
        cursor: 'none'
      }}
    >
      {/* Interactive Grid Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 0'
        }}
      >
        {/* Grid cells for hover effects */}
        <div className="absolute inset-0 grid grid-cols-[repeat(auto-fit,40px)] grid-rows-[repeat(auto-fit,40px)]">
          {gridCells.map((_, i) => (
            <div
              key={i}
              className="hover:bg-white/5 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 ease-in-out will-change-transform"
            />
          ))}
        </div>
      </div>

      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none rounded-full border-2 border-white/20 animate-ping"
          style={{
            left: ripple.x - 100,
            top: ripple.y - 100,
            width: 200,
            height: 200,
            animation: 'ripple 1.2s ease-out forwards'
          }}
        />
      ))}

      {/* Cursor Trail */}
      {trails.map((trail, index) => (
        <div
          key={trail.id}
          className="absolute pointer-events-none w-1 h-5 bg-white/80 rounded-full"
          style={{
            left: trail.x,
            top: trail.y,
            transform: 'rotate(45deg)',
            animation: `fadeTrail 0.8s ease-out forwards`,
            animationDelay: `${index * 0.05}s`
          }}
        />
      ))}

      {/* Custom Cursor */}
      <div
        className="fixed pointer-events-none w-2 h-2 bg-white/60 rounded-full z-50 transition-transform duration-75 ease-out"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/60 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-white/40 rounded-full animate-float"></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-white">
              <Heart className="w-4 h-4 text-campus-orange" />
              Made with love for KIIT students
            </div>

            {/* Main Heading */}
            <div className="space-y-4 my-4">
              <h1 className="text-5xl lg:text-5xl font-poppins font-bold text-white leading-tight">
                One app that
                <span className="block text-white">solves all</span>
                your campus needs
              </h1>

              <p className="text-xl lg:text-2xl text-white/80 font-inter leading-relaxed">
                From assignments to mentorship, hostel moves to campus activities - everything you need, in one platform!
              </p>

              {/* CTA Buttons */}
              {!user ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="glass-button text-white font-semibold px-8 py-4 text-lg group"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={()=>scrollToSection("#services")}
                    size="lg"
                    className="glass-button text-white font-semibold px-8 py-4 text-lg group"
                  >
                    Go to Services
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">More than 7</div>
                <div className="text-white/70 font-medium">Campus Services</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-white/70 font-medium">AI Assistant</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-white/70 font-medium">KIIT Focused</div>
              </div>
            </div>
          </div>

          {/* Right Content - Mascot and Campus */}
          <div className="relative mt-8">
            {/* Campus Background */}
            <div className="relative">
              <div className="flex flex-col items-center">
    <div className="w-[690px] h-[390px] overflow-hidden relative rounded-3xl">
        <div className="flex transition-transform duration-500 ease-in-out" id="slider" ref={sliderRef}>
            <img src="src\assets\KIIT_img.webp" className="w-full flex-shrink-0" alt="Slide 1"/>
            <img src="src\assets\KIIT-University-Camus-3-Library.jpg" className="w-full flex-shrink-0" alt="Slide 2"/>
            <img src="src\assets\About-kiit.jpg" className="w-full flex-shrink-0" alt="Slide 3"/>
            <img src="src\assets\KIIT-School-of-Architecture-Planning-.jpg" className="w-full flex-shrink-0" alt="Slide 4"/>
            <img src="src\assets\cam17.jpg" className="w-full flex-shrink-0" alt="Slide 5"/>
        </div>
        <div className="flex items-center mt-5 space-x-2" id="dot-indicators">
        <span className="w-3 h-3 bg-black/20 rounded-full"></span>
        <span className="w-3 h-3 bg-black/20 rounded-full"></span>
        <span className="w-3 h-3 bg-black/20 rounded-full"></span>
        <span className="w-3 h-3 bg-black/20 rounded-full"></span>
        <span className="w-3 h-3 bg-black/20 rounded-full"></span>
    </div>
    </div>
    
</div>


              {/* Floating Elements */}
              <div className="absolute top-6 left-4 backdrop-blur-sm bg-white/20 rounded-lg p-3 shadow-lg animate-float hover:shadow-xl transition-all ">
                <div className="text-sm font-semibold text-kiit-green flex items-center gap-2">
                  <Box width={16} height={16} />
                  Carton Service
                </div>
              </div>

              <div className="absolute bottom-4 right-4 backdrop-blur-sm bg-white/20 rounded-lg p-3 shadow-lg animate-bounce-slow hover:shadow-xl transition-all ">
                <div className="text-sm font-semibold text-campus-blue flex items-center gap-2">
                  <Bot width={16} height={16} />
                  AI Assistant
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </section>
  );
};