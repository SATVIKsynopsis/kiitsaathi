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
  const [ripples, setRipples] = useState<Array<{ id: number, x: number, y: number }>>([]);
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Grid layout config
  const [cellSize, setCellSize] = useState(40); // 40 desktop, 30 mobile
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);

  const gridCells = useMemo(() => {
    return Array.from({ length: cols * rows }, (_, i) => i);
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

      const newRipple = { id: rippleId++, x, y };
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
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 70%, #15803d 100%)'
      }}
    >
      {/* Animated Matrix Grid Background */}
      <div className="absolute inset-0">
        {/* Static grid lines */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${cellSize}px ${cellSize}px`,
            backgroundPosition: '0 0, 0 0'
          }}
        />

        {/* Interactive grid cells */}
        <div
          ref={gridRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`
          }}
        >
          {gridCells.map((i) => (
            <div
              key={i}
              className="transition-all duration-200 ease-out border border-transparent"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Click Ripple Effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x - 100,
            top: ripple.y - 100,
            width: 200,
            height: 200,
          }}
        >
          <div
            className="w-full h-full rounded-full border-2 border-kiit-green/60 animate-ping"
            style={{
              animation: 'ripple 1.2s ease-out forwards'
            }}
          />
          <div
            className="absolute inset-4 rounded-full border border-white/40 animate-ping"
            style={{
              animation: 'ripple 1.2s ease-out 0.2s forwards'
            }}
          />
        </div>
      ))}

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
                <div className="flex  flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="gradient-primary text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={() => scrollToSection("#services")}
                    size="lg"
                    className="gradient-primary text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
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
                <div className="w-[600px] h-[360px] overflow-hidden relative rounded-3xl">
                  <div className="flex transition-transform duration-500 ease-in-out" id="slider" ref={sliderRef}>
                    <img src="src/assets/KIIT_img.webp" className="w-full flex-shrink-0" alt="Slide 1" />
                    <img src="src/assets/KIIT-University-Camus-3-Library.jpg" className="w-full flex-shrink-0" alt="Slide 2" />
                    <img src={heroCampus} className="w-full flex-shrink-0" alt="Slide 3" />
                    <img src="@/assets\KIIT-School-of-Architecture-Planning-.jpg" className="w-full flex-shrink-0" alt="Slide 4" />
                    <img src="@/assets/cam17.jpg" className="w-full flex-shrink-0" alt="Slide 5" />
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
      </div>

    </section>
  );
};