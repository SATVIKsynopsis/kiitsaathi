export interface Campus {
  id: number;
  code: string;
  name: string;
  keywords: string[];
  cover: string;
  description: string;
  keyFeatures: string[];
  quickFacts: {
    area: string;
    established: string;
    specialization: string;
  };
}

export const campuses: Campus[] = [
  {
    id: 1,
    code: "C1",
    name: "Campus 1",
    keywords: ["1", "c1", "campus 1", "main", "central"],
    cover: "/assets/campus/1.jpg",
    description: "The main campus featuring the administrative block and central facilities.",
    keyFeatures: ["Administrative Block", "Central Library", "Main Auditorium", "Student Center"],
    quickFacts: {
      area: "120 acres",
      established: "1997",
      specialization: "Administration & Central Facilities"
    }
  },
  {
    id: 2,
    code: "C2",
    name: "Campus 2",
    keywords: ["2", "c2", "campus 2", "engineering"],
    cover: "/assets/campus/2.jpg",
    description: "Primary engineering campus with state-of-the-art laboratories and research facilities.",
    keyFeatures: ["Engineering Labs", "Research Centers", "Tech Incubators", "Innovation Hub"],
    quickFacts: {
      area: "85 acres",
      established: "1999",
      specialization: "Engineering & Technology"
    }
  },
  {
    id: 3,
    code: "C3",
    name: "Campus 3",
    keywords: ["3", "c3", "campus 3", "medical"],
    cover: "/assets/campus/3.jpg",
    description: "Medical campus housing the medical college and hospital facilities.",
    keyFeatures: ["Medical College", "Hospital", "Research Labs", "Clinical Training"],
    quickFacts: {
      area: "95 acres",
      established: "2004",
      specialization: "Medical & Healthcare"
    }
  },
  {
    id: 4,
    code: "C4",
    name: "Campus 4",
    keywords: ["4", "c4", "campus 4", "residential"],
    cover: "/assets/campus/4.jpg",
    description: "Residential campus with modern hostels and recreational facilities.",
    keyFeatures: ["Student Hostels", "Recreation Center", "Sports Complex", "Dining Halls"],
    quickFacts: {
      area: "110 acres",
      established: "2001",
      specialization: "Residential & Recreation"
    }
  },
  {
    id: 5,
    code: "C5",
    name: "Campus 5",
    keywords: ["5", "c5", "campus 5", "law"],
    cover: "/assets/campus/5.jpg",
    description: "Law campus with moot courts and legal research facilities.",
    keyFeatures: ["Law School", "Moot Courts", "Legal Library", "Research Centers"],
    quickFacts: {
      area: "65 acres",
      established: "2006",
      specialization: "Law & Legal Studies"
    }
  },
  {
    id: 6,
    code: "C6",
    name: "Campus 6",
    keywords: ["6", "c6", "campus 6", "business"],
    cover: "/assets/campus/6.jpg",
    description: "Business school campus with modern classrooms and conference facilities.",
    keyFeatures: ["Business School", "Conference Rooms", "Executive Training", "Career Center"],
    quickFacts: {
      area: "70 acres",
      established: "2008",
      specialization: "Business & Management"
    }
  },
  {
    id: 7,
    code: "C7",
    name: "Campus 7",
    keywords: ["7", "c7", "campus 7", "arts"],
    cover: "/assets/campus/7.jpg",
    description: "Arts and humanities campus with cultural centers and performance spaces.",
    keyFeatures: ["Arts Center", "Performance Halls", "Studios", "Cultural Hub"],
    quickFacts: {
      area: "55 acres",
      established: "2010",
      specialization: "Arts & Humanities"
    }
  },
  {
    id: 8,
    code: "C8",
    name: "Campus 8",
    keywords: ["8", "c8", "campus 8", "research"],
    cover: "/assets/campus/8.jpg",
    description: "Research-focused campus with advanced laboratories and innovation centers.",
    keyFeatures: ["Research Labs", "Innovation Centers", "Startup Incubators", "Patent Office"],
    quickFacts: {
      area: "90 acres",
      established: "2012",
      specialization: "Research & Innovation"
    }
  },
  {
    id: 9,
    code: "C9",
    name: "Campus 9",
    keywords: ["9", "c9", "campus 9", "sports"],
    cover: "/assets/campus/9.jpg",
    description: "Sports campus with international-standard facilities and training centers.",
    keyFeatures: ["Olympic Pool", "Athletics Track", "Indoor Stadium", "Training Centers"],
    quickFacts: {
      area: "100 acres",
      established: "2014",
      specialization: "Sports & Athletics"
    }
  },
  {
    id: 10,
    code: "C10",
    name: "Campus 10",
    keywords: ["10", "c10", "campus 10", "international"],
    cover: "/assets/campus/10.jpg",
    description: "International campus for exchange programs and global collaborations.",
    keyFeatures: ["International Center", "Exchange Programs", "Global Partnerships", "Cultural Exchange"],
    quickFacts: {
      area: "75 acres",
      established: "2016",
      specialization: "International Programs"
    }
  },
  {
    id: 11,
    code: "C11",
    name: "Campus 11",
    keywords: ["11", "c11", "campus 11", "agriculture"],
    cover: "/assets/campus/11.jpg",
    description: "Agricultural campus with experimental farms and research facilities.",
    keyFeatures: ["Research Farms", "Agricultural Labs", "Greenhouse Complex", "Food Processing"],
    quickFacts: {
      area: "150 acres",
      established: "2005",
      specialization: "Agriculture & Food Science"
    }
  },
  {
    id: 12,
    code: "C12",
    name: "Campus 12",
    keywords: ["12", "c12", "campus 12", "biotechnology"],
    cover: "/assets/campus/12.jpg",
    description: "Biotechnology campus with advanced research facilities and clean rooms.",
    keyFeatures: ["Biotech Labs", "Clean Rooms", "Genomics Center", "Pharmaceutical Research"],
    quickFacts: {
      area: "80 acres",
      established: "2009",
      specialization: "Biotechnology & Life Sciences"
    }
  },
  {
    id: 13,
    code: "C13",
    name: "Campus 13",
    keywords: ["13", "c13", "campus 13", "fashion"],
    cover: "/assets/campus/13.jpg",
    description: "Fashion and design campus with studios and exhibition spaces.",
    keyFeatures: ["Design Studios", "Fashion Labs", "Exhibition Halls", "Textile Research"],
    quickFacts: {
      area: "45 acres",
      established: "2011",
      specialization: "Fashion & Design"
    }
  },
  {
    id: 14,
    code: "C14",
    name: "Campus 14",
    keywords: ["14", "c14", "campus 14", "hospitality"],
    cover: "/assets/campus/14.jpg",
    description: "Hospitality and tourism campus with training kitchens and mock hotels.",
    keyFeatures: ["Training Kitchens", "Mock Hotel", "Conference Facilities", "Event Management"],
    quickFacts: {
      area: "60 acres",
      established: "2013",
      specialization: "Hospitality & Tourism"
    }
  },
  {
    id: 15,
    code: "C15",
    name: "Campus 15",
    keywords: ["15", "c15", "campus 15", "pharmacy"],
    cover: "/assets/campus/15.jpg",
    description: "Pharmacy campus with drug research facilities and medicinal gardens.",
    keyFeatures: ["Pharmacy Labs", "Drug Research", "Medicinal Gardens", "Quality Control"],
    quickFacts: {
      area: "65 acres",
      established: "2007",
      specialization: "Pharmacy & Drug Research"
    }
  },
  {
    id: 16,
    code: "C16",
    name: "Campus 16",
    keywords: ["16", "c16", "campus 16", "dental"],
    cover: "/assets/campus/16.jpg",
    description: "Dental campus with clinical facilities and training centers.",
    keyFeatures: ["Dental Clinics", "Training Centers", "X-Ray Facilities", "Oral Surgery"],
    quickFacts: {
      area: "40 acres",
      established: "2015",
      specialization: "Dental Sciences"
    }
  },
  {
    id: 17,
    code: "C17",
    name: "Campus 17",
    keywords: ["17", "c17", "campus 17", "nursing"],
    cover: "/assets/campus/17.jpg",
    description: "Nursing campus with simulation labs and healthcare training facilities.",
    keyFeatures: ["Simulation Labs", "Healthcare Training", "Patient Care Units", "Skills Lab"],
    quickFacts: {
      area: "50 acres",
      established: "2010",
      specialization: "Nursing & Healthcare"
    }
  },
  {
    id: 18,
    code: "C18",
    name: "Campus 18",
    keywords: ["18", "c18", "campus 18", "veterinary"],
    cover: "/assets/campus/18.jpg",
    description: "Veterinary campus with animal hospitals and research facilities.",
    keyFeatures: ["Animal Hospital", "Veterinary Labs", "Research Facilities", "Farm Animals"],
    quickFacts: {
      area: "85 acres",
      established: "2012",
      specialization: "Veterinary Sciences"
    }
  },
  {
    id: 19,
    code: "C19",
    name: "Campus 19",
    keywords: ["19", "c19", "campus 19", "marine"],
    cover: "/assets/campus/19.jpg",
    description: "Marine sciences campus with aquaculture facilities and coastal research.",
    keyFeatures: ["Aquaculture Labs", "Marine Research", "Coastal Studies", "Fish Breeding"],
    quickFacts: {
      area: "70 acres",
      established: "2014",
      specialization: "Marine Sciences"
    }
  },
  {
    id: 20,
    code: "C20",
    name: "Campus 20",
    keywords: ["20", "c20", "campus 20", "environmental"],
    cover: "/assets/campus/20.jpg",
    description: "Environmental sciences campus with sustainability research and green technologies.",
    keyFeatures: ["Environmental Labs", "Green Technologies", "Sustainability Center", "Eco Research"],
    quickFacts: {
      area: "90 acres",
      established: "2016",
      specialization: "Environmental Sciences"
    }
  },
  {
    id: 21,
    code: "C21",
    name: "Campus 21",
    keywords: ["21", "c21", "campus 21", "mining"],
    cover: "/assets/campus/21.jpg",
    description: "Mining engineering campus with geological surveys and mineral processing labs.",
    keyFeatures: ["Mining Labs", "Geological Surveys", "Mineral Processing", "Safety Training"],
    quickFacts: {
      area: "100 acres",
      established: "2008",
      specialization: "Mining Engineering"
    }
  },
  {
    id: 22,
    code: "C22",
    name: "Campus 22",
    keywords: ["22", "c22", "campus 22", "aerospace"],
    cover: "/assets/campus/22.jpg",
    description: "Aerospace engineering campus with flight simulators and propulsion labs.",
    keyFeatures: ["Flight Simulators", "Propulsion Labs", "Aerospace Research", "Wind Tunnels"],
    quickFacts: {
      area: "95 acres",
      established: "2017",
      specialization: "Aerospace Engineering"
    }
  },
  {
    id: 23,
    code: "C23",
    name: "Campus 23",
    keywords: ["23", "c23", "campus 23", "nanotechnology"],
    cover: "/assets/campus/23.jpg",
    description: "Nanotechnology campus with advanced microscopy and fabrication facilities.",
    keyFeatures: ["Nano Labs", "Microscopy Center", "Fabrication Units", "Clean Rooms"],
    quickFacts: {
      area: "55 acres",
      established: "2018",
      specialization: "Nanotechnology"
    }
  },
  {
    id: 24,
    code: "C24",
    name: "Campus 24",
    keywords: ["24", "c24", "campus 24", "robotics"],
    cover: "/assets/campus/24.jpg",
    description: "Robotics and AI campus with automation labs and intelligent systems research.",
    keyFeatures: ["Robotics Labs", "AI Research", "Automation Systems", "Intelligent Manufacturing"],
    quickFacts: {
      area: "75 acres",
      established: "2019",
      specialization: "Robotics & AI"
    }
  },
  {
    id: 25,
    code: "C25",
    name: "Campus 25",
    keywords: ["25", "c25", "campus 25", "renewable"],
    cover: "/assets/campus/25.jpg",
    description: "Renewable energy campus with solar farms and sustainable technology research.",
    keyFeatures: ["Solar Farms", "Wind Energy", "Battery Research", "Sustainable Tech"],
    quickFacts: {
      area: "120 acres",
      established: "2020",
      specialization: "Renewable Energy"
    }
  }
];

export const searchCampuses = (query: string): Campus[] => {
  if (!query.trim()) return campuses;
  
  const lowercaseQuery = query.toLowerCase().trim();
  
  return campuses.filter(campus => 
    campus.keywords.some(keyword => 
      keyword.toLowerCase().includes(lowercaseQuery)
    ) ||
    campus.name.toLowerCase().includes(lowercaseQuery) ||
    campus.description.toLowerCase().includes(lowercaseQuery) ||
    campus.quickFacts.specialization.toLowerCase().includes(lowercaseQuery)
  );
};