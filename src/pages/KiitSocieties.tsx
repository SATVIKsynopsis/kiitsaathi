import React from "react";
import { Societies } from "@/assets/Societies/societiesLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  PartyPopper,
  Trophy,
  Search,
  Users,
  MessageSquare,
  Instagram,
  ExternalLink,
  Sparkles,
  Rocket,
  Calendar1,
  TrophyIcon
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const KiitSocieties = () => {
  const navigate = useNavigate();

  const societyServices = [
    {
      icon: Search,
      title: "Interview Deadlines Tracker",
      description: "Track every interview and onboarding deadline.",
      price: "Free",
      gradient: "from-campus-purple to-campus-orange",
      emoji: <Calendar className="w-6 h-6 text-white" />,
      route: "/interview-deadlines-tracker"
    },
    {
      icon: PartyPopper,
      title: "Fest Announcements",
      description: "All fest updates, registrations, and event highlights — in one place.",
      price: "Free",
      gradient: "from-campus-purple to-campus-orange",
      emoji: <PartyPopper className="w-6 h-6 text-white" />,
      route: "/fest-announcements"
    },
    {
      icon: Trophy,
      title: "Sports Events Hub",
      description: "See tryout dates, match schedules, and urgent team alerts.",
      price: "Free",
      gradient: "from-campus-purple to-campus-orange",
      emoji: <TrophyIcon className="w-6 h-6 text-white" />,
      route: "/sports-events"
    }
  ];

  const kiitSocieties = [
    {
      name: "Fed KIIT",
      section: "fedkiit",
      brief: "Fostering innovation and development through hackathons, workshops, and tech-driven projects.",
      category: "Innovation",
      members: "1,200+",
      gradient: "from-black via-zinc-900 to-orange-700",
      website: "https://www.fedkiit.com/",
      instagram: "https://www.instagram.com/fedkiit/?hl=en",
      upcomingEvent: { title: "TechFest Hackathon 2024", date: "March 15-17" },
      logoPlaceholder: "fedkiit"
    },
    {
      name: "KIIT E-Cell",
      section: "ecell",
      brief: "Promoting entrepreneurship through mentorship, startup incubations, and networking.",
      category: "Entrepreneurship",
      members: "800+",
      gradient: "from-black via-neutral-900 to-sky-600",
      website: "https://www.kiitecell.org/",
      instagram: "https://www.instagram.com/ecell_kiit/?hl=en",
      upcomingEvent: { title: "Startup Pitch Competition", date: "April 5-7" },
      logoPlaceholder: "ecell"
    },
    {
      name: "USC KIIT",
      section: "usc",
      brief: "Uniting students across cultures with leadership programs, global events, and community initiatives.",
      category: "RPA",
      members: "1,500+",
      gradient: "from-orange-500 via-orange-400 to-yellow-300",
      website: "#",
      instagram: "https://www.instagram.com/usc.kiit/?hl=en",
      upcomingEvent: { title: "International Cultural Night", date: "March 22" },
      logoPlaceholder: "usc"
    },
    {
      name: "IEEE CTSoC KIIT",
      section: "ctsoc",
      brief: "The IEEE Consumer Technology Society KIIT chapter promotes innovation in consumer electronics, IoT, AR/VR, and smart devices through research and student projects.",
      category: "Research & Technology",
      members: "120+",
      gradient: "from-black via-slate-900 to-cyan-700",
      website: "#",
      instagram: "https://www.instagram.com/ieee_ctsoc_kiit",
      upcomingEvent: { title: "Consumer Tech Innovation Summit", date: "Coming Soon" },
      logoPlaceholder: "ctsoc"
    },
    {
      name: "IoT Lab KIIT",
      section: "iotlab",
      brief: "A student-driven research and development lab focused on Internet of Things, Embedded Systems, AI, and Robotics.",
      category: "Technical",
      members: "200+",
      gradient: "from-blue-500 via-cyan-500 to-white-100",
      website: "https://iotkiit.in/",
      instagram: "https://www.instagram.com/iot.lab.kiit",
      upcomingEvent: { title: "IoT Hackathon", date: "Coming Soon" },
      logoPlaceholder: "iot"
    },
    {
      name: "CyberVault KIIT",
      section: "cybervault",
      brief: "The official Cybersecurity & Ethical Hacking Society of KIIT, working on CTFs, penetration testing, and security research.",
      category: "Cybersecurity",
      members: "150+",
      gradient: "from-black via-neutral-900 to-green-900",
      website: "#",
      instagram: "https://www.instagram.com/cybervault_kiit",
      upcomingEvent: { title: "CTF Competition", date: "Coming Soon" },
      logoPlaceholder: "cybervault"
    },
    {
      name: "KITPD2S",
      section: "kitpd2s",
      brief: "KIIT’s Power Distribution & Smart Systems research group focusing on smart grids, energy systems, and sustainable power solutions.",
      category: "Research",
      members: "100+",
      gradient: "from-yellow-400 via-gray-800 to-black",
      website: "#",
      instagram: "https://www.instagram.com/kitpd2s_society",
      upcomingEvent: { title: "Smart Grid Workshop", date: "Coming Soon" },
      logoPlaceholder: "kitpd2s"
    },
    {
      name: "AISoC KIIT",
      section: "aisoc",
      brief: "Artificial Intelligence Society of KIIT, fostering learning in Machine Learning, Deep Learning, and AI research.",
      category: "AI/ML",
      members: "180+",
      gradient: "from-black via-gray-700 to-gray-900",
      website: "http://aisoc.in/",
      instagram: "https://www.instagram.com/aisoc__",
      upcomingEvent: { title: "AI Summit", date: "Coming Soon" },
      logoPlaceholder: "aisoc"
    },
    {
      name: "MLSA KIIT",
      section: "mlsa",
      brief: "MLSA KIIT Chapter empowering students with workshops, hackathons, and resources on Microsoft technologies and beyond.",
      category: "Developer Community",
      members: "250+",
      gradient: "from-indigo-700 via-indigo-900 to-black",
      website: "https://mlsakiit.com/",
      instagram: "https://www.instagram.com/mlsakiit",
      upcomingEvent: { title: "MS Tech Week", date: "Coming Soon" },
      logoPlaceholder: "mlsa"
    },
    {
      name: "Google Developer Group (GDG) KIIT",
      section: "gdg",
      brief: "A Google-backed developer community in KIIT, exploring technologies like Android, Firebase, Flutter, and Web Dev.",
      category: "Developer Community",
      members: "300+",
      gradient: "from-yellow-500 via-yellow-400 to-gray-300",
      website: "https://gdg.community.dev/gdg-on-campus-kalinga-institute-of-industrial-technology-bhubaneswar-india/",
      instagram: "https://www.instagram.com/_gdgkiit_",
      upcomingEvent: { title: "DevFest KIIT", date: "Coming Soon" },
      logoPlaceholder: "gdg"
    },
    {
      name: "Coding Ninjas KIIT Chapter",
      section: "codingninjas",
      brief: "A coding club supported by Coding Ninjas, conducting coding contests, DSA sessions, and interview prep workshops.",
      category: "Programming",
      members: "220+",
      gradient: "from-orange-600 via-grey-800 to-black",
      website: "https://www.cnkiit.in/",
      instagram: "https://www.instagram.com/cnkiit",
      upcomingEvent: { title: "Ninja Coding Contest", date: "Coming Soon" },
      logoPlaceholder: "cn"
    },
    {
      name: "GeeksforGeeks KIIT Chapter",
      section: "gfg",
      brief: "The official GeeksforGeeks student chapter, focusing on coding, problem-solving, and tech interview readiness.",
      category: "Programming",
      members: "200+",
      gradient: "from-black via-emerald-900 to-emerald-700",
      website: "https://gfgkiit.in/",
      instagram: "https://www.instagram.com/gfg_kiit",
      upcomingEvent: { title: "Coding Bootcamp", date: "Coming Soon" },
      logoPlaceholder: "gfg"
    },
    {
      name: "KIIT Model UN Society",
      section: "mun",
      brief: "The debating and diplomacy society of KIIT, simulating UN committees to hone public speaking and leadership.",
      category: "Debate",
      members: "300+",
      gradient: "from-black via-amber-900 to-amber-600",
      website: "https://kiitmun.org/",
      instagram: "https://www.instagram.com/instakiitmun",
      upcomingEvent: { title: "KIIT MUN", date: "Coming Soon" },
      logoPlaceholder: "mun"
    },
    {
      name: "Qutopia",
      section: "qutopia",
      brief: "The official Quizzing Society of KIIT, fostering curiosity and knowledge through quizzes.",
      category: "Quiz",
      members: "250+",
      gradient: "from-black to-yellow-900",
      website: "https://ksac.kiit.ac.in/societies/qutopia/",
      instagram: "https://www.instagram.com/_qutopia_",
      upcomingEvent: { title: "Qutopia Quiz League", date: "Coming Soon" },
      logoPlaceholder: "qu"
    },
    {
      name: "Korus",
      section: "korus",
      brief: "The Music & Dance Society of KIIT, nurturing talent through rhythm and performance.",
      category: "Cultural",
      members: "500+",
      gradient: "from-indigo-900 via-purple-600 to-pink-500",
      website: "https://ksac.kiit.ac.in/societies/korus/",
      instagram: "https://www.instagram.com/korus.kiit",
      upcomingEvent: { title: "Annual Cultural Fest", date: "November 21-23" },
      logoPlaceholder: "korus"
    },
    {
      name: "Kalliope",
      section: "kalliope",
      brief: "The official literary and public speaking society of KIIT, dedicated to eloquence, debate, and the art of words.",
      category: "Literature & Debate",
      members: "400+",
      gradient: "from-indigo-900 via-blue-900 to-red-600",
      website: "https://ksac.kiit.ac.in/societies/kalliope/",
      instagram: "https://www.instagram.com/kalliope_kiit",
      upcomingEvent: { title: "Annual Literary Fest", date: "October 10-12" },
      logoPlaceholder: "kalliope"
    },
    {
      name: "Kronicle",
      section: "kronicle",
      brief: "The official literary and debating society of KIIT, fostering skills in argumentation, conflict, and convincing discourse.",
      category: "Debate & Literature",
      members: "350+",
      gradient: "from-black via-gray-900 to-stone-500",
      website: "https://ksac.kiit.ac.in/societies/kronicle/",
      instagram: "https://www.instagram.com/kronicle_official",
      upcomingEvent: { title: "Parliamentary Debate", date: "September 26-28" },
      logoPlaceholder: "kronicle"
    },
    {
      name: "Khwaab",
      section: "khwaab",
      brief: "The official Social Service Society of KIIT, inspired by the 'Art of Giving', focusing on rural development and humanitarian work.",
      category: "Social Service",
      members: "500+",
      gradient: "from-sky-500 via-blue-600 to-indigo-700",
      website: "https://ksac.kiit.ac.in/societies/khwaab/",
      instagram: "https://www.instagram.com/khwaab.kiit",
      upcomingEvent: { title: "Rural Outreach Program", date: "October 2" },
      logoPlaceholder: "khwaab"
    },
    {
      name: "KIIT Automobile Society",
      section: "automobile",
      brief: "Automobile engineering enthusiasts building vehicles and exploring automotive technologies.",
      category: "Engineering",
      members: "400+",
      gradient: "from-black via-slate-800 to-red-700",
      website: "https://ksac.kiit.ac.in/societies/kiit-automobile-society/",
      instagram: "#",
      upcomingEvent: { title: "Auto Expo 2026", date: "February 7-8" },
      logoPlaceholder: "automobile"
    },
    {
      name: "Apogeio",
      section: "apogeio",
      brief: "The Aeronautical Society of KIIT, working on aerospace technology and innovation.",
      category: "Engineering",
      members: "300+",
      gradient: "from-sky-400 via-blue-600 to-indigo-900",
      website: "https://ksac.kiit.ac.in/societies/apogeio/",
      instagram: "https://www.instagram.com/apogeio",
      upcomingEvent: { title: "Aero Exhibition 2026", date: "March 15" },
      logoPlaceholder: "apogeio"
    },
    {
      name: "KIIT Robotics Society",
      section: "robotics",
      brief: "The official Robotics Society of KIIT, pioneering automation, AI, and robotics projects.",
      category: "Engineering",
      members: "600+",
      gradient: "from-black via-emerald-600 to-cyan-400",
      website: "#",
      instagram: "https://www.instagram.com/kiit_robotics.society",
      upcomingEvent: { title: "Robotics Championship", date: "October 24-26" },
      logoPlaceholder: "krs"
    },

    {
      name: "Keurig",
      section: "keurig",
      brief: "The official Cooking Society of KIIT, celebrating culinary arts and food culture.",
      category: "Food",
      members: "450+",
      gradient: "from-black via-teal-800 to-cyan-500",
      website: "#",
      instagram: "https://www.instagram.com/keurig_kiit_",
      upcomingEvent: { title: "Campus Food Fest", date: "November 1" },
      logoPlaceholder: "keurig"
    },
    {
      name: "Kreative Eye",
      section: "kreativeeye",
      brief: "Photography and Painting Society capturing moments and imagination through art.",
      category: "Arts",
      members: "600+",
      gradient: "from-yellow-400 via-red-600 to-rose-800",
      website: "#",
      instagram: "https://www.instagram.com/kreativeeye.kiit",
      upcomingEvent: { title: "Photography Exhibition", date: "September 27" },
      logoPlaceholder: "ke"
    },
    {
      name: "Kartavya",
      section: "kartavya",
      brief: "Social Responsibility Cell engaging students in social service and awareness programs.",
      category: "Social",
      members: "400+",
      gradient: "from-black via-fuchsia-600 to-sky-400",
      website: "#",
      instagram: "https://www.instagram.com/kartavyaofficial",
      upcomingEvent: { title: "Social Impact Week", date: "January 20-26, 2026" },
      logoPlaceholder: "kartavya"
    },
    {
      name: "Kamakshi",
      section: "kamakshi",
      brief: "The Women’s Society of KIIT, working towards empowerment and equality.",
      category: "Social",
      members: "300+",
      gradient: "from-purple-800 via-violet-700 to-green-500",
      website: "#",
      instagram: "https://www.instagram.com/kamakshi.heforshe.kiit",
      upcomingEvent: { title: "Women Empowerment Drive", date: "October 5" },
      logoPlaceholder: "kamakshi"
    },
    {
      name: "KIIT International Students Society",
      section: "kintl",
      brief: "International Students Society, uniting cultures from across the globe at KIIT.",
      category: "Cultural",
      members: "200+",
      gradient: "from-indigo-400 via-blue-500 to-teal-600",
      website: "#",
      instagram: "https://www.instagram.com/kiit_intl_students_society",
      upcomingEvent: { title: "Global Students Meet", date: "November 14" },
      logoPlaceholder: "kintlnew"
    },
    {
      name: "Khwahishein",
      section: "khwahishein",
      brief: "The official Hindi Society of KIIT, celebrating Hindi literature, music, and arts.",
      category: "Cultural",
      members: "300+",
      gradient: "from-red-500 via-purple-600 to-blue-500",
      website: "#",
      instagram: "https://www.instagram.com/kiit.khwahishein",
      upcomingEvent: { title: "Hindi Poetry Night", date: "September 20" },
      logoPlaceholder: "khwahishein"
    },
    {
      name: "KIIT Film Society",
      section: "filmsociety",
      brief: "The official film appreciation and filmmaking society of KIIT.",
      category: "Arts",
      members: "250+",
      gradient: "from-black via-neutral-800 to-stone-400",
      website: "#",
      instagram: "https://www.instagram.com/kiit.filmsoc.kfs",
      upcomingEvent: { title: "24-Hour Film Festival", date: "October 18-19" },
      logoPlaceholder: "kfs"
    },
    {
      name: "Kalakaar",
      section: "kalakaar",
      brief: "The official Dramatic Society of KIIT, organizing plays, theater, and street performances.",
      category: "Drama",
      members: "400+",
      gradient: "from-amber-900 via-red-800 to-yellow-600",
      website: "#",
      instagram: "https://www.instagram.com/kalakaar.ksac",
      upcomingEvent: { title: "Stage Play Festival", date: "December 5-7" },
      logoPlaceholder: "kalakaar"
    },
    {
      name: "Konnexions",
      section: "konnexions",
      brief: "The Web Development & IT Society of KIIT, promoting coding and digital skills.",
      category: "Tech",
      members: "500+",
      gradient: "from-black via-blue-900 to-cyan-800",
      website: "#",
      instagram: "https://www.instagram.com/kiitkonnexions",
      upcomingEvent: { title: "KIIT Hackathon", date: "October 4-5" },
      logoPlaceholder: "konnexions"
    },
    {
      name: "K-Konnect",
      section: "kconnect",
      brief: "The Alumni Connect Society, bridging students and KIIT alumni worldwide.",
      category: "Networking",
      members: "200+",
      gradient: "from-red-500 via-blue-500 to-lime-500",
      website: "#",
      instagram: "https://www.instagram.com/kkonnect",
      upcomingEvent: { title: "Annual Alumni Meet", date: "December 21" },
      logoPlaceholder: "konnect"
    },
    {
      name: "KIIT Wordsmith",
      section: "wordsmith",
      brief: "The Writing Society of KIIT, encouraging literature, blogs, and creative writing.",
      category: "Literature",
      members: "350+",
      gradient: "from-black via-red-800 to-stone-200",
      website: "#",
      instagram: "https://www.instagram.com/kiit.wordsmith",
      upcomingEvent: { title: "Open Mic Poetry", date: "September 24" },
      logoPlaceholder: "wordsmith"
    },
    {
      name: "Kzarshion",
      section: "kzarshion",
      brief: "The official Fashion Society of KIIT, redefining style and creativity on campus.",
      category: "Fashion",
      members: "350+",
      gradient: "from-black via-purple-800 to-rose-400",
      website: "#",
      instagram: "https://www.instagram.com/kzarshion_official",
      upcomingEvent: { title: "Annual Fashion Walk", date: "November 8" },
      logoPlaceholder: "kzarshion"
    },
    {
      name: "Kraya Kuber",
      section: "krayakuber",
      brief: "Marketing Society of KIIT, focusing on brand, strategy, and market awareness.",
      category: "Business",
      members: "300+",
      gradient: "from-blue-600 via-cyan-500 to-orange-400",
      website: "#",
      instagram: "https://www.instagram.com/kraya.kuber",
      upcomingEvent: { title: "Marketing Hackfest", date: "October 11" },
      logoPlaceholder: "kk"
    },
    {
      name: "Kimaya",
      section: "kimaya",
      brief: "Medical Society of KIIT, spreading medical awareness and first aid training.",
      category: "Health",
      members: "300+",
      gradient: "from-teal-900 via-emerald-800 to-cyan-700",
      website: "#",
      instagram: "https://www.instagram.com/kimaya_kiit",
      upcomingEvent: { title: "First Aid Workshop", date: "September 29" },
      logoPlaceholder: "kimaya"
    },
    {
      name: "Society for Civil Engineering",
      section: "civil",
      brief: "The Civil Engineering Society of KIIT for innovation in infrastructure and design.",
      category: "Engineering",
      members: "350+",
      gradient: "from-emerald-800 via-green-600 to-emerald-700",
      website: "#",
      instagram: "https://www.instagram.com/ksce_.official_",
      upcomingEvent: { title: "Civil Tech Fest 2026", date: "February 21-22" },
      logoPlaceholder: "ksce"
    },
    {
      name: "NCC",
      section: "ncc",
      brief: "National Cadet Corps at KIIT, instilling discipline, unity, and leadership.",
      category: "Discipline",
      members: "200+",
      gradient: "from-red-600 via-blue-900 to-sky-500",
      website: "#",
      instagram: "https://www.instagram.com/kiit_ncc",
      upcomingEvent: { title: "Annual Training Camp", date: "December 15-24" },
      logoPlaceholder: "ncc"
    },
    {
      name: "NSS",
      section: "nss",
      brief: "National Service Scheme at KIIT, focusing on community service and development.",
      category: "Social",
      members: "300+",
      gradient: "from-blue-900 via-indigo-800 to-red-700",
      website: "#",
      instagram: "https://www.instagram.com/nsskiit",
      upcomingEvent: { title: "Community Service Drive", date: "October 2" },
      logoPlaceholder: "nss"
    },
    {
      name: "Youth Red Cross KIIT",
      section: "yrc",
      brief: "The Youth Red Cross KIIT chapter works for humanitarian service, social welfare, disaster relief, blood donation, and community health awareness.",
      category: "Social Service",
      members: "300+",
      gradient: "from-rose-100 via-red-600 to-slate-800",
      website: "#",
      instagram: "https://www.instagram.com/yrc_kiit",
      upcomingEvent: { title: "Blood Donation Camp", date: "October 1" },
      logoPlaceholder: "yrc"
    },
    {
      name: "TEDX-KU",
      section: "tedx-ku",
      brief: "The official TEDx Society of KIIT, organizing TEDx events to inspire ideas and innovation.",
      category: "Innovation",
      members: "200+",
      gradient: "from-red-800 via-orange-600 to-yellow-500",
      website: "https://www.tedxkiituniversity.in/",
      instagram: "https://www.instagram.com/tedxkiitu/",
      upcomingEvent: { title: "TEDx KIIT 2025", date: "December 10" },
      logoPlaceholder: "tedxku"
    },
    {
      name: "KIIT Animal & Environment Welfare Society",
      section: "kiit-animal-environment",
      brief: "A society dedicated to animal welfare, wildlife conservation, and environmental protection.",
      category: "Environment",
      members: "150+",
      gradient: "from-black via-emerald-600 to-lime-500",
      website: "https://kiitaews.wordpress.com/",
      instagram: "https://www.instagram.com/kiitaews/",
      upcomingEvent: { title: "Eco Awareness Drive", date: "October 15" },
      logoPlaceholder: "keaws"
    },
    {
      name: "KIIT Electrical Society",
      section: "kiit-electrical",
      brief: "A technical society focusing on electrical engineering innovations, workshops, and projects.",
      category: "Technical",
      members: "300+",
      gradient: "from-yellow-800 via-amber-600 to-orange-500",
      website: "https://www.keskiit.in/",
      instagram: "https://www.instagram.com/kiit_electrical_society/",
      upcomingEvent: { title: "Circuit Design Challenge", date: "November 20" },
      logoPlaceholder: "kes"
    },
    {
      name: "Enactus",
      section: "enactus",
      brief: "The Social Entrepreneurship Society of KIIT empowering students to create community impact.",
      category: "Entrepreneurship",
      members: "250+",
      gradient: "from-purple-800 via-fuchsia-600 to-pink-500",
      website: "https://enactuskiit.in/",
      instagram: "https://www.instagram.com/enact.kiit/",
      upcomingEvent: { title: "Social Startup Pitch", date: "December 5" },
      logoPlaceholder: "enactus"
    },
    {
      name: "Kraftovity",
      section: "kraftovity",
      brief: "The official Art & Craft Society of KIIT, nurturing creativity through hands-on artistic activities.",
      category: "Art",
      members: "180+",
      gradient: "from-pink-800 via-rose-600 to-red-500",
      website: "https://www.instagram.com/kraftovity_kiit/",
      instagram: "https://ksac.kiit.ac.in/societies/kraftovity/",
      upcomingEvent: { title: "Handmade Art Fest", date: "October 25" },
      logoPlaceholder: "kraftovity"
    },
    {
      name: "SPIC MACAY",
      section: "spic-macay",
      brief: "The Indian Classical Music and Culture Society promoting heritage through art and performances.",
      category: "Culture",
      members: "220+",
      gradient: "from-indigo-800 via-blue-600 to-cyan-500",
      website: "https://ksac.kiit.ac.in/societies/spic-macay/",
      instagram: "https://www.instagram.com/spic.macay.kiit_chapter/",
      upcomingEvent: { title: "Classical Night", date: "November 15" },
      logoPlaceholder: "spicmacay"
    }
  ]


  const handleServiceClick = (route: string) => {
    if (route) {
      navigate(route);
    } else {
      alert("Coming Soon! This service is under development and will be available soon.");
    }
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-kiit-green-soft to-white">
      {/* Back to Home Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-kiit-green hover:text-kiit-green-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-kiit-green mb-6 animate-fade-in">
              KIIT Societies, Fests and Sports
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4">
              Your gateway to campus societies, events, and opportunities
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8 text-sm md:text-base text-gray-600">
              <span>Never miss an interview, fest, or sports event again</span>
              <span className="hidden md:inline">•</span>
              <span>One calendar. All societies. All events.</span>
            </div>

            <div className="relative mb-12">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-kiit-green-light to-purple-200 rounded-full flex items-center justify-center mb-8">
                <div className="text-6xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Services */}
      <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2">
              <Rocket className="w-6 h-6 text-kiit-green" />
              <h2 className="text-3xl font-bold text-kiit-green">Quick Access</h2>
            </div>
            <p className="text-gray-600">Track deadlines, events, and announcements</p>
          </div>


          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {societyServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-kiit-green cursor-pointer"
                  onClick={() => handleServiceClick(service.route)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${service.gradient} w-fit mx-auto mb-3`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl mb-2">{service.emoji}</div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold px-3 py-1 rounded-full text-sm bg-gradient-to-r ${service.gradient} text-white`}>
                        {service.price}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        Explore
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* All KIIT Societies */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kiit-green mb-4">All KIIT Societies</h2>
            <p className="text-gray-600">Discover societies that match your interests and passions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {kiitSocieties.map((society, index) => (
              <div
                id={society.section}
                key={index}
                className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                {/* Main Card with Gradient Background */}
                <div className={`relative h-80 bg-gradient-to-br ${society.gradient} p-6 text-white`}>
                  {/* Society Logo Placeholder */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl border border-white/30">
                      {Societies[society.logoPlaceholder as keyof typeof Societies] ? (
                        <img
                          src={Societies[society.logoPlaceholder as keyof typeof Societies]}
                          alt={society.name}
                          className="w-12 h-12 object-contain rounded-md"
                        />
                      ) : (
                        <span>{society.logoPlaceholder}</span>
                      )}
                    </div>
                    {/* Instagram Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(society.instagram, '_blank');
                      }}
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30"
                    >
                      <Instagram className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Society Name - Clickable */}
                  <button
                    onClick={() => society.website !== "#" && window.open(society.website, '_blank')}
                    className="text-left w-full group/name"
                  >
                    <h3 className="text-2xl font-bold mb-2 group-hover/name:underline flex items-center gap-2">
                      {society.name}
                      {society.website !== "#" && <ExternalLink className="w-4 h-4 opacity-0 group-hover/name:opacity-100 transition-opacity duration-300" />}
                    </h3>
                  </button>

                  {/* Category and Members */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                      {society.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {society.members}
                    </span>
                  </div>

                  {/* Upcoming Event Box - Always Visible */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (society.website !== "#") {
                        window.open(society.website, '_blank');
                      }
                    }}
                    className="w-full mb-4 p-3 bg-white/90 text-gray-800 rounded-xl border-2 border-yellow-300 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group/event"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          Upcoming Event
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {society.upcomingEvent.title}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-orange-600">
                          {society.upcomingEvent.date}
                        </div>
                        <ExternalLink className="w-3 h-3 mt-1 ml-auto opacity-0 group-hover/event:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  </button>

                  {/* Brief - Hidden by default, shown on hover */}
                  <div className="absolute inset-x-6 bottom-6 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <div className="p-4 bg-white/95 backdrop-blur-sm rounded-xl text-gray-800 shadow-lg border border-white/50">
                      <p className="text-sm leading-relaxed">{society.brief}</p>
                    </div>
                  </div>
                </div>

                {/* Glowing Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`
                  }}>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-br from-kiit-green-soft to-purple-100">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-kiit-green mb-6"><Calendar1 className="w-4 h-4" /> Never Miss an Opportunity</h2>
            <p className="text-gray-600 mb-8">
              Stay updated with all society interviews, fest announcements, and sports events in one place.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button
                className="bg-kiit-green hover:bg-kiit-green-dark text-white px-8 py-3"
                onClick={() => alert("Coming Soon! Interview tracker is under development.")}
              >
                Track Interviews
              </Button>
              <Button
                variant="outline"
                className="border-kiit-green text-kiit-green hover:bg-kiit-green hover:text-white px-8 py-3"
                onClick={() => alert("Coming Soon! Event calendar is under development.")}
              >
                View All Events
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Support */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 text-white shadow-lg"
          onClick={() => window.open('https://wa.me/1234567890', '_blank')}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default KiitSocieties;
