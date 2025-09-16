export const curriculum: Record<string, Record<string, Array<{ name: string; credits: number }>>> = {
  CSE: {
    "1": [
      { name: "PHYSICS", credits: 3 },
      { name: "Differential Equations and Linear Algebra", credits: 4 },
      { name: "SCIENCE OF LIVING SYSTEMS", credits: 2 },
      { name: "ENVIRONMENTAL SCIENCE", credits: 2 },
      { name: "PHYSICS LAB", credits: 1 },
      { name: "PROGRAMMING LAB", credits: 4 },
      { name: "ENGINEERING DRAWING & GRAPHICS", credits: 1 },
      { name: "ENGINEERING ELECTIVE-II", credits: 2 },
      { name: "SCIENCE ELECTIVE", credits: 2 }
    ],
    "2": [
      { name: "CHEMISTRY", credits: 3 },
      { name: "Transform Calculus and Numerical Analysis", credits: 4 },
      { name: "ENGLISH", credits: 2 },
      { name: "BASIC ELECTRONICS", credits: 2 },
      { name: "CHEMISTRY LAB", credits: 1 },
      { name: "YOGA", credits: 1 },
      { name: "ENGINEERING LAB", credits: 1 },
      { name: "WORKSHOP", credits: 1 },
      { name: "COMMUNICATION LAB", credits: 1 },
      { name: "ENGINEERING ELECTIVE-I", credits: 2 },
      { name: "SOCIAL SCIENCE ELECTIVE", credits: 2 }
    ],
    "3": [
      { name: "DS", credits: 4 },
      { name: "Digital Systems Design", credits: 3 },
      { name: "Scientific and Technical Writing", credits: 2 },
      { name: "Industry 4.0 Technologies", credits: 2 },
      { name: "Automata Theory and Formal Languages", credits: 4 },
      { name: "PS", credits: 4 },
      { name: "DSA LAB", credits: 1 },
      { name: "Digital Systems Design LAB", credits: 1 }
    ],
    "4": [
      { name: "Scientific and Technical Writing", credits: 2 },
      { name: "HASS Elective - II", credits: 3 },
      { name: "OOPJ", credits: 3 },
      { name: "OS", credits: 3 },
      { name: "Discrete Structures", credits: 4 },
      { name: "COA", credits: 4 },
      { name: "DBMS", credits: 3 },
      { name: "OOPJ LAB", credits: 1 },
      { name: "OS LAB", credits: 1 },
      { name: "DBMS LAB", credits: 1 },
      { name: "Vocational Electives", credits: 1 }
    ],
    "5": [
      { name: "COMPUTER NETWORKS", credits: 3 },
      { name: "DESIGN & ANALYSIS OF ALGO", credits: 3 },
      { name: "SOFTWARE ENGINEERING", credits: 4 },
      { name: "Engineering Economics", credits: 3 },
      { name: "NETWORK LAB", credits: 1 },
      { name: "ALGORITHM LAB", credits: 1 },
      { name: "Professional Elective-1", credits: 3 },
      { name: "Professional Elective-2", credits: 3 },
      { name: "K-Explore Open Elective-I", credits: 1 }
    ],
    "6": [
      { name: "UHV", credits: 3 },
      { name: "AI", credits: 3 },
      { name: "ML", credits: 4 },
      { name: "AI LAB", credits: 1 },
      { name: "MINI PROJECT", credits: 2 },
      { name: "Application Development LAB", credits: 2 },
      { name: "Professional Elective-III", credits: 3 },
      { name: "HASS Elective- III", credits: 3 },
      { name: "Open Elective-II/MI-1", credits: 3 }
    ],
    "7": [
      { name: "HRM", credits: 3 },
      { name: "PROFESSIONAL PRACTICE, LAW & ETHICS", credits: 2 },
      { name: "PROJECT 1/INTERNSHIP", credits: 3 },
      { name: "PRACTICAL TRAINING", credits: 2 },
      { name: "Coursera Elective", credits: 3 }
    ],
    "8": [
      { name: "Major Project", credits: 10 },
      { name: "Comprehensive Viva", credits: 2 }
    ]
  },
  IT: {
    "1": [
      { name: "Mathematics I", credits: 4 },
      { name: "Physics", credits: 3 },
      { name: "Chemistry", credits: 3 },
      { name: "Programming for Problem Solving", credits: 4 },
      { name: "English", credits: 3 },
      { name: "Environmental Science", credits: 3 },
      { name: "Physics Lab", credits: 1 },
      { name: "Chemistry Lab", credits: 1 },
      { name: "Programming Lab", credits: 2 }
    ],
    "2": [
      { name: "Mathematics II", credits: 4 },
      { name: "Basic Electronics", credits: 3 },
      { name: "Engineering Mechanics", credits: 3 },
      { name: "Data Structures", credits: 4 },
      { name: "Digital Logic", credits: 3 },
      { name: "Professional Communication", credits: 3 },
      { name: "Electronics Lab", credits: 1 },
      { name: "Data Structures Lab", credits: 2 },
      { name: "Digital Logic Lab", credits: 1 }
    ],
    "3": [
      { name: "Mathematics III", credits: 4 },
      { name: "Computer Organization", credits: 3 },
      { name: "Object Oriented Programming", credits: 4 },
      { name: "Database Management System", credits: 4 },
      { name: "Discrete Mathematics", credits: 3 },
      { name: "Economics", credits: 3 },
      { name: "OOP Lab", credits: 2 },
      { name: "DBMS Lab", credits: 2 }
    ],
    "4": [
      { name: "Analysis of Algorithms", credits: 4 },
      { name: "Computer Networks", credits: 4 },
      { name: "Operating Systems", credits: 4 },
      { name: "Software Engineering", credits: 3 },
      { name: "Information Systems", credits: 3 },
      { name: "Probability & Statistics", credits: 3 },
      { name: "Networks Lab", credits: 2 },
      { name: "OS Lab", credits: 2 }
    ],
    "5": [
      { name: "Web Technology", credits: 4 },
      { name: "Information Security", credits: 4 },
      { name: "System Administration", credits: 3 },
      { name: "Human Computer Interaction", credits: 3 },
      { name: "Elective I", credits: 3 },
      { name: "Management", credits: 3 },
      { name: "Web Technology Lab", credits: 2 },
      { name: "Security Lab", credits: 2 }
    ],
    "6": [
      { name: "Enterprise Resource Planning", credits: 3 },
      { name: "Data Warehousing", credits: 3 },
      { name: "Mobile Application Development", credits: 3 },
      { name: "Elective II", credits: 3 },
      { name: "Elective III", credits: 3 },
      { name: "Minor Project", credits: 4 },
      { name: "ERP Lab", credits: 2 },
      { name: "Mobile App Lab", credits: 2 }
    ],
    "7": [
      { name: "IT Service Management", credits: 3 },
      { name: "Business Intelligence", credits: 3 },
      { name: "Elective IV", credits: 3 },
      { name: "Elective V", credits: 3 },
      { name: "Major Project I", credits: 6 },
      { name: "Industrial Training", credits: 2 },
      { name: "BI Lab", credits: 2 }
    ],
    "8": [
      { name: "Entrepreneurship", credits: 2 },
      { name: "Elective VI", credits: 3 },
      { name: "Major Project II", credits: 10 },
      { name: "Seminar", credits: 2 },
      { name: "Comprehensive Viva", credits: 3 }
    ]
  },
  CSSE: {
    "1": [
      { name: "Mathematics I", credits: 4 },
      { name: "Physics", credits: 3 },
      { name: "Chemistry", credits: 3 },
      { name: "Programming for Problem Solving", credits: 4 },
      { name: "English", credits: 3 },
      { name: "Environmental Science", credits: 3 },
      { name: "Physics Lab", credits: 1 },
      { name: "Chemistry Lab", credits: 1 },
      { name: "Programming Lab", credits: 2 }
    ],
    "2": [
      { name: "Mathematics II", credits: 4 },
      { name: "Basic Electronics", credits: 3 },
      { name: "Engineering Mechanics", credits: 3 },
      { name: "Data Structures", credits: 4 },
      { name: "Digital Logic", credits: 3 },
      { name: "Professional Communication", credits: 3 },
      { name: "Electronics Lab", credits: 1 },
      { name: "Data Structures Lab", credits: 2 },
      { name: "Digital Logic Lab", credits: 1 }
    ],
    "3": [
      { name: "Mathematics III", credits: 4 },
      { name: "Computer Organization", credits: 3 },
      { name: "Object Oriented Programming", credits: 4 },
      { name: "Database Management System", credits: 4 },
      { name: "Discrete Mathematics", credits: 3 },
      { name: "Economics", credits: 3 },
      { name: "OOP Lab", credits: 2 },
      { name: "DBMS Lab", credits: 2 }
    ],
    "4": [
      { name: "Analysis of Algorithms", credits: 4 },
      { name: "Computer Networks", credits: 4 },
      { name: "Operating Systems", credits: 4 },
      { name: "Software Engineering", credits: 4 },
      { name: "Theory of Computation", credits: 3 },
      { name: "Cyber Security Fundamentals", credits: 3 },
      { name: "Networks Lab", credits: 2 },
      { name: "Security Lab", credits: 1 }
    ],
    "5": [
      { name: "Cryptography", credits: 4 },
      { name: "Network Security", credits: 4 },
      { name: "Web Application Security", credits: 3 },
      { name: "Digital Forensics", credits: 3 },
      { name: "Elective I", credits: 3 },
      { name: "Management", credits: 3 },
      { name: "Cryptography Lab", credits: 2 },
      { name: "Web Security Lab", credits: 2 }
    ],
    "6": [
      { name: "Ethical Hacking", credits: 4 },
      { name: "Malware Analysis", credits: 3 },
      { name: "Security Audit", credits: 3 },
      { name: "Elective II", credits: 3 },
      { name: "Elective III", credits: 3 },
      { name: "Minor Project", credits: 4 },
      { name: "Ethical Hacking Lab", credits: 2 },
      { name: "Malware Lab", credits: 2 }
    ],
    "7": [
      { name: "Cloud Security", credits: 3 },
      { name: "IoT Security", credits: 3 },
      { name: "Elective IV", credits: 3 },
      { name: "Elective V", credits: 3 },
      { name: "Major Project I", credits: 6 },
      { name: "Industrial Training", credits: 2 },
      { name: "IoT Security Lab", credits: 2 }
    ],
    "8": [
      { name: "Entrepreneurship", credits: 2 },
      { name: "Elective VI", credits: 3 },
      { name: "Major Project II", credits: 10 },
      { name: "Seminar", credits: 2 },
      { name: "Comprehensive Viva", credits: 3 }
    ]
  },
  CSCE: {
    "1": [
      { name: "Mathematics I", credits: 4 },
      { name: "Physics", credits: 3 },
      { name: "Chemistry", credits: 3 },
      { name: "Programming for Problem Solving", credits: 4 },
      { name: "English", credits: 3 },
      { name: "Environmental Science", credits: 3 },
      { name: "Physics Lab", credits: 1 },
      { name: "Chemistry Lab", credits: 1 },
      { name: "Programming Lab", credits: 2 }
    ],
    "2": [
      { name: "Mathematics II", credits: 4 },
      { name: "Basic Electronics", credits: 3 },
      { name: "Engineering Mechanics", credits: 3 },
      { name: "Data Structures", credits: 4 },
      { name: "Digital Logic", credits: 3 },
      { name: "Professional Communication", credits: 3 },
      { name: "Electronics Lab", credits: 1 },
      { name: "Data Structures Lab", credits: 2 },
      { name: "Digital Logic Lab", credits: 1 }
    ],
    "3": [
      { name: "Mathematics III", credits: 4 },
      { name: "Computer Organization", credits: 3 },
      { name: "Object Oriented Programming", credits: 4 },
      { name: "Database Management System", credits: 4 },
      { name: "Discrete Mathematics", credits: 3 },
      { name: "Economics", credits: 3 },
      { name: "OOP Lab", credits: 2 },
      { name: "DBMS Lab", credits: 2 }
    ],
    "4": [
      { name: "Analysis of Algorithms", credits: 4 },
      { name: "Computer Networks", credits: 4 },
      { name: "Operating Systems", credits: 4 },
      { name: "Software Engineering", credits: 3 },
      { name: "Computer Graphics", credits: 3 },
      { name: "Artificial Intelligence", credits: 4 },
      { name: "Networks Lab", credits: 2 },
      { name: "Graphics Lab", credits: 1 }
    ],
    "5": [
      { name: "Machine Learning", credits: 4 },
      { name: "Natural Language Processing", credits: 3 },
      { name: "Computer Vision", credits: 3 },
      { name: "Robotics", credits: 3 },
      { name: "Elective I", credits: 3 },
      { name: "Management", credits: 3 },
      { name: "ML Lab", credits: 2 },
      { name: "Computer Vision Lab", credits: 2 },
      { name: "Robotics Lab", credits: 1 }
    ],
    "6": [
      { name: "Deep Learning", credits: 4 },
      { name: "Pattern Recognition", credits: 3 },
      { name: "Expert Systems", credits: 3 },
      { name: "Elective II", credits: 3 },
      { name: "Elective III", credits: 3 },
      { name: "Minor Project", credits: 4 },
      { name: "Deep Learning Lab", credits: 2 },
      { name: "Pattern Recognition Lab", credits: 2 }
    ],
    "7": [
      { name: "Reinforcement Learning", credits: 3 },
      { name: "Cognitive Computing", credits: 3 },
      { name: "Elective IV", credits: 3 },
      { name: "Elective V", credits: 3 },
      { name: "Major Project I", credits: 6 },
      { name: "Industrial Training", credits: 2 },
      { name: "Cognitive Computing Lab", credits: 2 }
    ],
    "8": [
      { name: "Entrepreneurship", credits: 2 },
      { name: "Elective VI", credits: 3 },
      { name: "Major Project II", credits: 10 },
      { name: "Seminar", credits: 2 },
      { name: "Comprehensive Viva", credits: 3 }
    ]
  },
  ECE: {
    "1": [
      { name: "Mathematics I", credits: 4 },
      { name: "Physics", credits: 3 },
      { name: "Chemistry", credits: 3 },
      { name: "Programming for Problem Solving", credits: 4 },
      { name: "English", credits: 3 },
      { name: "Environmental Science", credits: 3 },
      { name: "Physics Lab", credits: 1 },
      { name: "Chemistry Lab", credits: 1 },
      { name: "Programming Lab", credits: 2 }
    ],
    "2": [
      { name: "Mathematics II", credits: 4 },
      { name: "Basic Electronics", credits: 3 },
      { name: "Engineering Mechanics", credits: 3 },
      { name: "Circuit Analysis", credits: 4 },
      { name: "Digital Logic", credits: 3 },
      { name: "Professional Communication", credits: 3 },
      { name: "Electronics Lab", credits: 1 },
      { name: "Circuit Analysis Lab", credits: 2 },
      { name: "Digital Logic Lab", credits: 1 }
    ],
    "3": [
      { name: "Mathematics III", credits: 4 },
      { name: "Electronic Devices", credits: 3 },
      { name: "Signals and Systems", credits: 4 },
      { name: "Network Analysis", credits: 3 },
      { name: "Data Structures", credits: 3 },
      { name: "Economics", credits: 3 },
      { name: "Electronic Devices Lab", credits: 2 },
      { name: "Signals Lab", credits: 2 },
      { name: "Data Structures Lab", credits: 1 }
    ],
    "4": [
      { name: "Analog Electronics", credits: 4 },
      { name: "Digital Electronics", credits: 4 },
      { name: "Electromagnetic Theory", credits: 3 },
      { name: "Control Systems", credits: 4 },
      { name: "Probability & Statistics", credits: 3 },
      { name: "Microprocessors", credits: 3 },
      { name: "Analog Electronics Lab", credits: 2 },
      { name: "Microprocessor Lab", credits: 2 }
    ],
    "5": [
      { name: "Communication Systems", credits: 4 },
      { name: "VLSI Design", credits: 3 },
      { name: "Digital Signal Processing", credits: 4 },
      { name: "Antenna Theory", credits: 3 },
      { name: "Elective I", credits: 3 },
      { name: "Management", credits: 3 },
      { name: "Communication Lab", credits: 2 },
      { name: "DSP Lab", credits: 2 }
    ],
    "6": [
      { name: "Microwave Engineering", credits: 3 },
      { name: "Embedded Systems", credits: 4 },
      { name: "Optical Communication", credits: 3 },
      { name: "Elective II", credits: 3 },
      { name: "Elective III", credits: 3 },
      { name: "Minor Project", credits: 4 },
      { name: "Embedded Systems Lab", credits: 2 },
      { name: "Optical Communication Lab", credits: 2 }
    ],
    "7": [
      { name: "Wireless Communication", credits: 3 },
      { name: "Radar Systems", credits: 3 },
      { name: "Elective IV", credits: 3 },
      { name: "Elective V", credits: 3 },
      { name: "Major Project I", credits: 6 },
      { name: "Industrial Training", credits: 2 },
      { name: "Wireless Lab", credits: 2 }
    ],
    "8": [
      { name: "Entrepreneurship", credits: 2 },
      { name: "Elective VI", credits: 3 },
      { name: "Major Project II", credits: 10 },
      { name: "Seminar", credits: 2 },
      { name: "Comprehensive Viva", credits: 3 }
    ]
  },
  EEE: {
    "1": [
      { name: "Mathematics I", credits: 4 },
      { name: "Physics", credits: 3 },
      { name: "Chemistry", credits: 3 },
      { name: "Programming for Problem Solving", credits: 4 },
      { name: "English", credits: 3 },
      { name: "Environmental Science", credits: 3 },
      { name: "Physics Lab", credits: 1 },
      { name: "Chemistry Lab", credits: 1 },
      { name: "Programming Lab", credits: 2 }
    ],
    "2": [
      { name: "Mathematics II", credits: 4 },
      { name: "Basic Electronics", credits: 3 },
      { name: "Engineering Mechanics", credits: 3 },
      { name: "Circuit Analysis", credits: 4 },
      { name: "Engineering Drawing", credits: 3 },
      { name: "Professional Communication", credits: 3 },
      { name: "Electronics Lab", credits: 1 },
      { name: "Circuit Analysis Lab", credits: 2 },
      { name: "Drawing Lab", credits: 1 }
    ],
    "3": [
      { name: "Mathematics III", credits: 4 },
      { name: "Electrical Machines I", credits: 4 },
      { name: "Network Analysis", credits: 3 },
      { name: "Electromagnetic Theory", credits: 3 },
      { name: "Materials Science", credits: 3 },
      { name: "Economics", credits: 3 },
      { name: "Electrical Machines Lab I", credits: 2 },
      { name: "Network Analysis Lab", credits: 2 }
    ],
    "4": [
      { name: "Electrical Machines II", credits: 4 },
      { name: "Power Electronics", credits: 4 },
      { name: "Control Systems", credits: 4 },
      { name: "Electrical Measurements", credits: 3 },
      { name: "Probability & Statistics", credits: 3 },
      { name: "Signals and Systems", credits: 3 },
      { name: "Electrical Machines Lab II", credits: 2 },
      { name: "Power Electronics Lab", credits: 2 }
    ],
    "5": [
      { name: "Power Systems I", credits: 4 },
      { name: "Microprocessors", credits: 3 },
      { name: "Electrical Drives", credits: 3 },
      { name: "High Voltage Engineering", credits: 3 },
      { name: "Elective I", credits: 3 },
      { name: "Management", credits: 3 },
      { name: "Power Systems Lab", credits: 2 },
      { name: "Microprocessor Lab", credits: 2 }
    ],
    "6": [
      { name: "Power Systems II", credits: 4 },
      { name: "Switch Gear & Protection", credits: 3 },
      { name: "Renewable Energy", credits: 3 },
      { name: "Elective II", credits: 3 },
      { name: "Elective III", credits: 3 },
      { name: "Minor Project", credits: 4 },
      { name: "Protection Lab", credits: 2 },
      { name: "Renewable Energy Lab", credits: 2 }
    ],
    "7": [
      { name: "Power System Operation", credits: 3 },
      { name: "Smart Grid", credits: 3 },
      { name: "Elective IV", credits: 3 },
      { name: "Elective V", credits: 3 },
      { name: "Major Project I", credits: 6 },
      { name: "Industrial Training", credits: 2 },
      { name: "Smart Grid Lab", credits: 2 }
    ],
    "8": [
      { name: "Entrepreneurship", credits: 2 },
      { name: "Elective VI", credits: 3 },
      { name: "Major Project II", credits: 10 },
      { name: "Seminar", credits: 2 },
      { name: "Comprehensive Viva", credits: 3 }
    ]
  }
};