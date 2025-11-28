export interface CampusLocation {
  id: number;
  name: string;
  fullName: string;
  description: string;
  hasMap: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  mapsUrl: string;
}

export const campusLocations: CampusLocation[] = [
  {
    id: 1,
    name: "Campus 1",
    fullName: "KIIT Campus 1",
    description: "Explore Campus 1 facilities and detailed room layout.",
    hasMap: true,
    coordinates: { lat: 20.34619739198187, lng: 85.8235108875394 },
    address: "KIIT Road, Patia, Bhubaneswar, Odisha 751024",
    mapsUrl: "https://maps.app.goo.gl/NCghaHF4inACGth6A"
  },
  {
    id: 2,
    name: "Campus 2",
    fullName: "KIIT Campus 2",
    description: "Explore Campus 2 facilities and detailed room layout.",
    hasMap: true,
    coordinates: { lat: 20.35330634805269, lng: 85.8196462383565 },
    address: "KIIT Road, Patia, Bhubaneswar, Odisha 751024",
    mapsUrl: "https://maps.app.goo.gl/fr6YnvZu2b4VfCmg8"
  },
  {
    id: 3,
    name: "Campus 3",
    fullName: "KIIT Campus 3",
    description: "School of Civil Engineering",
    hasMap: true,
    coordinates: { lat: 20.353541496607637, lng: 85.81666697089064 },
    address: "KIIT Campus 3, Patia, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/bNhSLPfoQzv6nLzY9"
  },
  {
    id: 4,
    name: "Campus 4",
    fullName: "KIIT Campus 4",
    description: "Academic and hostel facilities near main gate.",
    hasMap: true,
    coordinates: { lat: 20.354061257961888, lng: 85.82032776904137 },
    address: "KIIT Campus 4, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/fmARXaFgJi8u5QuW8"
  },
  {
    id: 5,
    name: "Campus 5",
    fullName: "KIIT Campus 5",
    description: "Main administrative campus close to KIIT Avenue.",
    hasMap: true,
    coordinates: { lat: 20.352713604060305, lng: 85.8139618671921 },
    address: "Campus 5, KIIT Avenue, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/F5ScDz7xaVR4qakf6"
  },
  {
    id: 6,
    name: "Campus 6",
    fullName: "KIIT Campus 6",
    description: "Events Hub and Auditorium",
    hasMap: true,
    coordinates: { lat: 20.35339108623044, lng: 85.81960695369895 },
    address: "Campus 6, KIIT University, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/5Fv9rm5jyhtGNmE37"
  },
  {
    id: 7,
    name: "Campus 7",
    fullName: "KIIT Campus 7",
    description: "Major academic blocks with hostels.",
    hasMap: true,
    coordinates: { lat: 20.350638693774123, lng: 85.81967462671251 },
    address: "Campus 7, KIIT Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/MBGeh9wYtY4oNRXx8"
  },
  {
    id: 8,
    name: "Campus 8",
    fullName: "KIIT Campus 8",
    description: "School of Mechanical Engineering",
    hasMap: true,
    coordinates: { lat: 20.351433654050293, lng: 85.81987516479447 },
    address: "Campus 8, KIIT, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/jGR6Tcs84jEpoyq36"
  },
  {
    id: 9,
    name: "Campus 9",
    fullName: "KIIT Campus 9",
    description: "KIIT Boarding School",
    hasMap: true,
    coordinates: { lat: 20.35347801705653, lng: 85.81164748253455 },
    address: "Campus 9, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/r5bBCLj54LKwJ7Yt7"
  },
  {
    id: 11,
    name: "Campus 11",
    fullName: "KIIT Campus 11",
    description: "School of Biotechnology and Chemical Engineering",
    hasMap: true,
    coordinates: { lat: 20.36036092554409, lng: 85.82311175739764 },
    address: "Campus 11, KIIT University, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/A7HoZZ6yztpsGMbz6"
  },
  {
    id: 12,
    name: "Campus 12",
    fullName: "KIIT Campus 12",
    description: "School of Electronics Engineering",
    hasMap: true,
    coordinates: { lat: 20.354705023589826, lng: 85.81957743041116 },
    address: "Campus 12, KIIT University, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/7PZgsP1qQcnvQ3p69"
  },
  {
    id: 13,
    name: "Campus 13",
    fullName: "KIIT Campus 13",
    description: "KSAC and Sports Centre",
    hasMap: true,
    coordinates: { lat: 20.356870850263622, lng: 85.81861485554828 },
    address: "Campus 13, KIIT University, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/TmDjz23a7pDZAEky5"
  },
  {
    id: 14,
    name: "Campus 14",
    fullName: "KIIT Campus 14",
    description: "Polytechnic School",
    hasMap: true,
    coordinates: { lat: 20.355177951885306, lng: 85.815312315658 },
    address: "Campus 14, KIIT University, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/J1gxhu5iQ5YV7W8Y8"
  },
  {
    id: 15,
    name: "Campus 15",
    fullName: "KIIT Campus 15",
    description: "School of Computer Engineering",
    hasMap: true,
    coordinates: { lat: 20.348387921132566, lng: 85.81590478623299 },
    address: "Campus 15, KIIT Patia, Bhubaneswar",
    mapsUrl: "https://maps.app.goo.gl/TkC6GKgfVeYLqss8A"
  },
  {
    id: 16,
    name: "Campus 16",
    fullName: "KIIT Campus 16",
    description: "School of Law",
    hasMap: true,
    coordinates: { lat: 20.362002039556174, lng: 85.82272490582258 },
    address: "Campus 16, KIIT University, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/GJXxstwy36NxkV166"
  },
  {
    id: 17,
    name: "Campus 17",
    fullName: "KIIT Campus 17",
    description: "School of Architecture",
    hasMap: true,
    coordinates: { lat: 20.348644613638957, lng: 85.81936246534276 },
    address: "Campus 17, KIIT University, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/t93UbVFY8AEzwdMp6"
  },
  {
    id: 20,
    name: "Campus 20",
    fullName: "KIIT Campus 20",
    description: "Knowledge Tower",
    hasMap: true,
    coordinates: { lat: 20.35406937584415, lng: 85.8161210365073 },
    address: "Campus 20, KIIT University, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/eGUsPSVsfQ6iu9MD7"
  },
  {
    id: 22,
    name: "Campus 22",
    fullName: "KIIT Campus 22",
    description: "KIIT R&D and Innovation Centre",
    hasMap: true,
    coordinates: { lat: 20.354558154031388, lng: 85.81435827328825 },
    address: "Campus 22, KIIT Road, Bhubaneswar, Odisha",
    mapsUrl: "https://maps.app.goo.gl/xtbtBPmYfUGio5YJ7"
  },
  {
    id: 25,
    name: "Campus 25",
    fullName: "KIIT Campus 25",
    description: "School of Computer Engineering",
    hasMap: true,
    coordinates: { lat: 20.36464727147983, lng: 85.81699075369917 },
    address: "School of Computer Engineering, KIIT Campus 25, Bhubaneswar",
    mapsUrl: "https://maps.app.goo.gl/aiH4924Fucy1Whz57"
  }
];

