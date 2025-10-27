import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Heart, Box, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import kiitMascot from "@/assets/kiit-mascot.png";
import KiitCampus3 from "@/assets/KIIT-University-Camus-3-Library.jpg";
import heroCampus from "@/assets/KIIT_img.webp";
import KiitCampus17 from "@/assets/cam17.jpg";
import KiiTSchoolofArch from "@/assets/KIIT-School-of-Architecture-Planning-.jpg";
import KiitAbout from "@/assets/About-kiit.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import { useRef, useEffect, useState, useMemo } from "react";
export const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user
  } = useAuth();
  const [ripples, setRipples] = useState<Array<{
    id: number;
    x: number;
    y: number;
  }>>([]);
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Grid layout config
  const [cellSize, setCellSize] = useState(40); // 40 desktop, 30 mobile
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const gridCells = useMemo(() => {
    return Array.from({
      length: cols * rows
    }, (_, i) => i);
  }, [cols, rows]);

  // Compute grid layout based on hero size
  useEffect(() => {
    const computeLayout = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const size = window.innerWidth < 768 ? 30 : 40;
      setCellSize(size);
      setCols(Math.ceil(rect.width / size));
      setRows(Math.ceil(rect.height / size));
    };
    computeLayout();
    let t: number | undefined;
    const onResize = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(computeLayout, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      if (t) window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Ripple effect and hover highlight
  useEffect(() => {
    const heroElement = heroRef.current;
    const gridElement = gridRef.current;
    if (!heroElement || !gridElement) return;
    let rippleId = 0;
    let rafPending = false;
    let lastX = 0;
    let lastY = 0;
    const highlightCell = () => {
      rafPending = false;
      const rect = heroElement.getBoundingClientRect();
      const x = lastX - rect.left;
      const y = lastY - rect.top;
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      if (col < 0 || row < 0 || col >= cols || row >= rows) return;
      const index = row * cols + col;
      const el = gridElement.children[index] as HTMLElement | undefined;
      if (!el) return;
      el.style.background = 'rgba(255,255,255,0.12)';
      el.style.boxShadow = '0 0 18px rgba(255,255,255,0.25)';
      el.style.borderColor = 'rgba(255,255,255,0.25)';
      el.style.transition = 'background 200ms ease, box-shadow 200ms ease, border-color 200ms ease';
      window.setTimeout(() => {
        el.style.background = 'transparent';
        el.style.boxShadow = 'none';
        el.style.borderColor = 'transparent';
      }, 220);
    };
    const handleMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(highlightCell);
      }
    };
    const handleClick = (e: MouseEvent) => {
      const rect = heroElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = {
        id: rippleId++,
        x,
        y
      };
      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(current => current.filter(r => r.id !== newRipple.id));
      }, 1200);
    };
    heroElement.addEventListener('mousemove', handleMove);
    heroElement.addEventListener('click', handleClick);
    return () => {
      heroElement.removeEventListener('mousemove', handleMove);
      heroElement.removeEventListener('click', handleClick);
    };
  }, [cellSize, cols, rows]);
  const scrollToSection = (href: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }
  };
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Replace direct DOM queries with reactive values
  const slides = useMemo(() => [heroCampus, KiiTSchoolofArch, KiitCampus3, KiitAbout, KiitCampus17], []);
  const slideCount = slides.length; // real slides (without cloned)
  
  // Move slider to a given index (0..slideCount) where slideCount is the cloned-first slide
  const goToSlide = (index: number, withTransition = true) => {
    if (!sliderRef.current) return;
    const slideWidth = sliderRef.current.clientWidth;
    if (!withTransition) sliderRef.current.style.transition = 'none';
    else sliderRef.current.style.transition = 'transform 500ms ease-in-out';
    sliderRef.current.style.transform = `translateX(-${index * slideWidth}px)`;

    // update dot highlight (map cloned index to 0)
    const dots = document.querySelectorAll('#dot-indicators span');
    const dotIndex = index === slideCount ? 0 : (index % slideCount);
    dots.forEach(d => d.classList.remove('bg-black'));
    if (dots[dotIndex]) dots[dotIndex].classList.add('bg-black');
  };

  // Auto-play with seamless loop using a cloned-first slide at the end
  useEffect(() => {
    // ensure initial layout correct
    goToSlide(currentSlide, false);

    let interval: NodeJS.Timeout | null = null;

    // Handle visibility change to pause/resume slider
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, clear interval
        if (interval) clearInterval(interval);
      } else {
        // Tab is visible, restart interval
        if (interval) clearInterval(interval);
        interval = setInterval(() => {
          setCurrentSlide(prev => {
            const next = prev + 1;
            goToSlide(next);
            return next;
          });
        }, 3000);
      }
    };

    // Start initial interval
    interval = setInterval(() => {
      setCurrentSlide(prev => {
        const next = prev + 1;
        goToSlide(next);
        return next;
      });
    }, 3000);

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [slideCount]);

  // After transition ends, if we are on the cloned slide (index === slideCount),
  // snap back to the real first slide without transition so the loop is seamless.
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    
    const onTransitionEnd = () => {
      if (currentSlide === slideCount) {
        // remove transition, snap to first real slide
        goToSlide(0, false);
        // force reflow so future transitions apply correctly
        void el.offsetWidth;
        // restore state to first slide
        setCurrentSlide(0);
      }
    };
    
    el.addEventListener('transitionend', onTransitionEnd);
    return () => el.removeEventListener('transitionend', onTransitionEnd);
  }, [currentSlide, slideCount]);

  // Ensure slider remains visible when tab regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (sliderRef.current) {
        // Force re-render of slider position when tab becomes visible
        const current = currentSlide === slideCount ? 0 : currentSlide;
        goToSlide(current, false);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentSlide, slideCount]);
  return <section ref={heroRef} id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 70%, #15803d 100%)'
  }}>
    {/* Animated Matrix Grid Background */}
    <div className="absolute inset-0">
      {/* Static grid lines */}
      <div className="absolute inset-0 opacity-100" style={{
        backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
        backgroundPosition: '0 0, 0 0'
      }} />

      {/* Interactive grid cells */}
      <div ref={gridRef} className="absolute inset-0 pointer-events-none" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`
      }}>
        {gridCells.map(i => <div key={i} className="transition-all duration-200 ease-out border border-transparent" style={{
          width: `${cellSize}px`,
          height: `${cellSize}px`
        }} />)}
      </div>
    </div>

    {/* Click Ripple Effects */}
    {ripples.map(ripple => <div key={ripple.id} className="absolute pointer-events-none" style={{
      left: ripple.x - 100,
      top: ripple.y - 100,
      width: 200,
      height: 200
    }}>
      <div className="w-full h-full rounded-full border-2 border-kiit-green/60 animate-ping" style={{
        animation: 'ripple 1.2s ease-out forwards'
      }} />
      <div className="absolute inset-4 rounded-full border border-white/40 animate-ping" style={{
        animation: 'ripple 1.2s ease-out 0.2s forwards'
      }} />
    </div>)}

    {/* Animated background elements */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-white/60 rounded-full animate-bounce-slow"></div>
      <div className="absolute bottom-32 left-20 w-12 h-12 bg-white/40 rounded-full animate-float"></div>
    </div>

    <div className="container mx-auto px-4 sm:px-6 z-10">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Content */}
        <div className="text-center lg:text-left space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-campus-orange" />
            Made with love for KIIT students
          </div>

          {/* Main Heading */}
          <div className="space-y-3 sm:space-y-4 my-2 sm:my-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-poppins font-bold text-white leading-tight">
              One platform that 
              <span className="block text-white">solves all your</span>
              campus needs
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 font-inter leading-relaxed px-2 sm:px-0">
              From assignments to mentorship, hostel moves to campus activities - everything you need, in one platform!
            </p>

            {/* CTA Buttons */}
            {!user ? <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0">
              <Button size="lg" className="px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-br from-green-300 via-blue-500 to-blue-400 text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:bg-foreground/80 hover:shadow-xl" onClick={() => navigate('/auth')}>
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div> : <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0">
              <Button onClick={() => scrollToSection("#services")} size="lg" className="bg-gradient-to-br from-green-300 via-blue-500 to-blue-400 px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base  text-white font-bold hover:bg-foreground/80 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Go to Services
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />

              </Button>
            </div>}
          </div>

        </div>

        {/* Right Content - Mascot and Campus */}
        <div className="relative mt-6 sm:mt-8 lg:mt-0">
          {/* Campus Background */}
          <div className="relative px-4 sm:px-0">
            <div className="flex flex-col items-center">
            <div className="w-full max-w-[570px] h-[200px] sm:h-[240px] md:h-[300px] lg:h-[330px] overflow-hidden relative rounded-2xl sm:rounded-3xl bg-white/5">
                <div 
                  className="flex transition-transform duration-500 ease-in-out" 
                  id="slider" 
                  ref={sliderRef}
                  style={{ willChange: 'transform' }}
                >
                  {/*
                    Render real slides then a cloned-first-slide at the end.
                    This allows smooth transition from last -> cloned-first, then we snap to real-first.
                  */}
                  {slides.map((src, idx) => (
                    <img 
                      key={idx} 
                      src={src} 
                      className="w-full flex-shrink-0 object-cover" 
                      alt={`KIIT Campus ${idx + 1}`}
                      loading={idx === 0 ? "eager" : "lazy"}
                      style={{ display: 'block' }}
                    />
                  ))}
                  {/* cloned first slide for seamless looping */}
                  <img 
                    key="clone-first" 
                    src={slides[0]} 
                    className="w-full flex-shrink-0 object-cover" 
                    alt="KIIT Campus"
                    style={{ display: 'block' }}
                  />
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

          </div>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="mt-5 flex flex-wrap gap-3 sm:gap-4 md:gap-8 justify-center lg:justify-between pt-8 sm:pt-12 px-4 sm:px-10">
        <div className="text-center flex-1 min-w-[80px]">
          <div className="  text-xl sm:text-2xl md:text-4xl font-bold text-white">10+</div>
          <div className="text-xs sm:text-sm md:text-base text-white/70 font-medium">Campus Services</div>
        </div>
        <div className=" text-shadow-lg text-center flex-1 min-w-[80px]">
          <div className=" text-shadow-lg text-xl sm:text-2xl md:text-4xl font-bold text-white">24/7</div>
          <div className=" text-shadow-lg text-xs sm:text-sm md:text-base text-white/70 font-medium">AI Assistant</div>
        </div>
        <div className=" text-shadow-lg text-center flex-1 min-w-[80px]">
          <div className="text-shadow-lg text-xl sm:text-2xl md:text-4xl font-bold text-white">100%</div>
          <div className=" text-shadow-lg text-xs sm:text-sm md:text-base text-white/70 font-medium">KIIT Focused</div>
        </div>
      </div>
    </div>

  </section>;
};