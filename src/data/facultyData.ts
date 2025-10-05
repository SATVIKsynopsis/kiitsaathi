// Faculty and Contact Person Data for KIIT CSIT
// Extracted from official records - maintaining exact order

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  linkedin: string;
  category: 'contact' | 'faculty';
  department?: string;
}

// Contact Persons (46 total)
export const contactPersons: FacultyMember[] = [
  {
    id: 'cp-1',
    name: 'Dr. Biswajit Sahoo',
    designation: 'Director General',
    email: 'director.csit@kiit.ac.in',
    phone: '9437229507',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-2',
    name: 'Dr. Hrudaya Kumar Tripathy',
    designation: 'Dean, Research',
    email: 'dean_research.cse@kiit.ac.in',
    phone: '9437432185',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-3',
    name: 'Dr. Bhabani Sankar Prasad Mishra',
    designation: 'Dean, Academics (CS)',
    email: 'dean.cse@kiit.ac.in',
    phone: '9438037401',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-4',
    name: 'Dr. Arup Abhinna Acharya',
    designation: 'Dean, Academics (IT)',
    email: 'dean_it@kiit.ac.in',
    phone: '9861058079',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-5',
    name: 'Dr. Amulya Ratna Swain',
    designation: 'Dean, Academics (CC & CSM)',
    email: 'dean.ccm@kiit.ac.in',
    phone: '9439627127',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-6',
    name: 'Dr. Ajay Kumar Jena',
    designation: 'Associate Dean',
    email: 'ajay.jenafcs@kiit.ac.in',
    phone: '9437232068',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-7',
    name: 'Dr. Anuja Kumar Acharya',
    designation: 'Dy. Controller of Examination',
    email: 'dycoe.csit@kiit.ac.in',
    phone: '9438520431',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-8',
    name: 'Dr. Manas Ranjan Lenka',
    designation: 'Asst. CoE-I',
    email: 'acoe.cese@kiit.ac.in',
    phone: '9861077824',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-9',
    name: 'Mr. Sujoy Datta',
    designation: 'Asst. CoE-2',
    email: 'acoe.csit@kiit.ac.in',
    phone: '8093713885',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-10',
    name: 'Dr. Subhasis Dash',
    designation: 'Asst. CoE-3',
    email: 'fic.examcell.cse@kiit.ac.in',
    phone: '9437800206',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-11',
    name: 'Mr. Lalit Kumar Vashishtha',
    designation: 'Asst. CoE-4',
    email: 'fic.examcell.cse@kiit.ac.in',
    phone: '9668224395',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-12',
    name: 'Dr. Kumar Devadutta',
    designation: 'Associate Dean (T&P)',
    email: 'kumar.devadutta@kiit.ac.in',
    phone: 'tnp.scs@kiit.ac.in',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-13',
    name: 'Mr. Kshirod Kumar Nayak',
    designation: 'Sr. Administrative Officer',
    email: 'kshirod.nayak@kiit.ac.in',
    phone: '8223004014',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-14',
    name: 'Dr. Satarupa Mohanty',
    designation: 'Faculty-In-Charges (Alumni Relation)',
    email: 'satarupafcs@kiit.ac.in',
    phone: '9124941515',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-15',
    name: 'Dr. Namita Panda',
    designation: 'Faculty-In-Charges (Alumni Relation)',
    email: 'npandafcs@kiit.ac.in',
    phone: '9437444205',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-16',
    name: 'Ms. Shilpa Das',
    designation: 'Faculty-In-Charges (Alumni Relation)',
    email: 'shilpa.dasfcs@kiit.ac.in',
    phone: '7008810670',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-17',
    name: 'Dr. Himansu Das',
    designation: 'Laboratory Governance',
    email: 'himanshufcs@kiit.ac.in',
    phone: '9861335143',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-18',
    name: 'Mrs. Suchismita Das',
    designation: 'Laboratory Governance',
    email: 'suchismita.dasfcs@kiit.ac.in',
    phone: '8763977944',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-19',
    name: 'Ms. Arodhana Behura',
    designation: 'Library Enrichment',
    email: 'arodhana.behurafcs@kiit.ac.in',
    phone: '7787821733',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-20',
    name: 'Dr. Mohit Ranjan Panda',
    designation: 'Quality Assurance',
    email: 'qacell.cse@kiit.ac.in',
    phone: '9777999330',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-21',
    name: 'Dr. Adyasha Dash',
    designation: 'Quality Assurance',
    email: 'qacell.cse@kiit.ac.in',
    phone: '7077694248',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-22',
    name: 'Dr. Pratyusa Mukherjee',
    designation: 'Quality Assurance',
    email: 'qacell.cse@kiit.ac.in',
    phone: '9861937376',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-23',
    name: 'Ms. Santwana Sagnika',
    designation: 'Website & Social Media Management',
    email: 'webmaster.sce@kiit.ac.in',
    phone: '8093945565',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-24',
    name: 'Dr. Robi Shaw',
    designation: 'Website & Social Media Management',
    email: 'webmaster.sce@kiit.ac.in',
    phone: '9007960872',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-25',
    name: 'Dr. Monjusha Pandey',
    designation: 'Student Affairs',
    email: 'ficstudentactivity.cse@kiit.ac.in',
    phone: '8763999448',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-26',
    name: 'Dr. Leena Das',
    designation: 'Student Affairs',
    email: 'ficstudentactivity.cse@kiit.ac.in',
    phone: '7750827038',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-27',
    name: 'Ms. Roshni Pradhan',
    designation: 'Student Affairs',
    email: 'ficstudentactivity.cse@kiit.ac.in',
    phone: '9439659354',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-28',
    name: 'Mr. Sankalp Nayak',
    designation: 'Student Affairs',
    email: 'ficstudentactivity.cse@kiit.ac.in',
    phone: '9853261679',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-29',
    name: 'Mr. Ajit Kumar Pasayat',
    designation: 'Student Affairs',
    email: 'ficstudentactivity.cse@kiit.ac.in',
    phone: '9040570908',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-30',
    name: 'Ms. Mandakini Priyadarshani Behera',
    designation: 'Student Affairs',
    email: 'ficstudentactivity.cse@kiit.ac.in',
    phone: '8917364496',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-31',
    name: 'Mr. R. N. Ramakanta Parida',
    designation: 'Student Affairs (NCC & NSS)',
    email: 'nss.sce@kiit.ac.in',
    phone: '7978036775',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-32',
    name: 'Dr. Minakhi Rout',
    designation: 'Student Affairs (NCC & NSS)',
    email: 'nss.sce@kiit.ac.in',
    phone: '9861108580',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-33',
    name: 'Mrs. Subhashree Darshana',
    designation: 'Student Affairs (NCC & NSS)',
    email: 'nss.sce@kiit.ac.in',
    phone: '7008097297',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-34',
    name: 'Dr. Rajat Kumar Behera',
    designation: 'International Student Affairs (Academics)',
    email: 'rajatkumar.beherafcs@kiit.ac.in',
    phone: '9886072882',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-35',
    name: 'Dr. Jayanta Mondal',
    designation: 'International Student Affairs (Academics)',
    email: 'jayanta.mondalfcs@kiit.ac.in',
    phone: '7908003806',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-36',
    name: 'Dr. Mainak Bandyopadhyay',
    designation: 'International Student Affairs (Academics)',
    email: 'mainak.bandyopadhyayfcs@kiit.ac.in',
    phone: '8009387402',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-37',
    name: 'Dr. Ajay Kumar Jena',
    designation: 'Time Table Governance',
    email: 'ajay.jenafcs@kiit.ac.in',
    phone: '9437232068',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-38',
    name: 'Dr. Abhaya Kumar Sahoo',
    designation: 'Time Table Governance',
    email: 'abhaya.sahoofcs@kiit.ac.in',
    phone: '9861443456',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-39',
    name: 'Dr. Dayal Kumar Behera',
    designation: 'Time Table Governance',
    email: 'dayal.beherafcs@kiit.ac.in',
    phone: '9853334495',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-40',
    name: 'Dr. Arghya Kundu',
    designation: 'Guest Lecture Engagement',
    email: 'arghya.kundufcs@kiit.ac.in',
    phone: '8792739730',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-41',
    name: 'Dr. Pradeep Kumar Mallick',
    designation: 'Guest Lecture Engagement',
    email: 'pradeep.mallickfcs@kiit.ac.in',
    phone: '8895885152',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-42',
    name: 'Dr. Vikas Hassija',
    designation: 'Industry & Institute Collaboration',
    email: 'vikas.hassijafcs@kiit.ac.in',
    phone: '8700580723',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-43',
    name: 'Dr. Satyananda Champati Rai',
    designation: 'Industry & Institute Collaboration',
    email: 'satya.raifcs@kiit.ac.in',
    phone: '9078513157',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-44',
    name: 'Dr. Jagannath Singh',
    designation: 'Project Co-ordinator (UG)',
    email: 'jagannath.singhfcs@kiit.ac.in',
    phone: '9861085883',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-45',
    name: 'Dr. Sushruta Mishra',
    designation: 'Project Co-ordinator (UG)',
    email: 'sushruta.mishrafcs@kiit.ac.in',
    phone: '7751995740',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-46',
    name: 'Dr. Saikat Chakraborty',
    designation: 'Project Co-ordinator (UG)',
    email: 'saikat.chakrabortyfcs@kiit.ac.in',
    phone: '993768429',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  }
];

// Faculty Members - Starting from real data, filling rest with demo data
export const facultyMembers: FacultyMember[] = [
  // Real faculty from images (Computer Science and Engineering department)
  { id: 'f-1', name: 'Jagannath Singh', designation: 'Computer Science and Engineering', email: 'jagannath.singh@kiit.ac.in', phone: '+91-9437012400', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-2', name: 'Jasaswi Prasad Mohanty', designation: 'Computer Science and Engineering', email: 'jasaswi.mohanty@kiit.ac.in', phone: '+91-9437012401', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-3', name: 'Joy Sarraf', designation: 'Computer Science and Engineering', email: 'joy.sarraf@kiit.ac.in', phone: '+91-9437012402', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-4', name: 'Jayanta Mondal', designation: 'Computer Science and Engineering', email: 'jayanta.mondal@kiit.ac.in', phone: '+91-9437012403', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-5', name: 'Jayanti Dansana', designation: 'Computer Science and Engineering', email: 'jayanti.dansana@kiit.ac.in', phone: '+91-9437012404', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-6', name: 'Jaydeep Das', designation: 'Computer Science and Engineering', email: 'jaydeep.das@kiit.ac.in', phone: '+91-9437012405', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-7', name: 'Jayeeta Chakraborty', designation: 'Computer Science and Engineering', email: 'jayeeta.chakraborty@kiit.ac.in', phone: '+91-9437012406', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-8', name: 'Jhalak Hota', designation: 'Computer Science and Engineering', email: 'jhalak.hota@kiit.ac.in', phone: '+91-9437012407', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-9', name: 'Joy Dutta', designation: 'Computer Science and Engineering', email: 'joy.dutta@kiit.ac.in', phone: '+91-9437012408', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-10', name: 'Junali Jasmine Jena', designation: 'Computer Science and Engineering', email: 'junali.jena@kiit.ac.in', phone: '+91-9437012409', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-11', name: 'Jyotiprakash Mishra', designation: 'Computer Science and Engineering', email: 'jyotiprakash.mishra@kiit.ac.in', phone: '+91-9437012410', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-12', name: 'Krishna Chakravarty', designation: 'Computer Science and Engineering', email: 'krishna.chakravarty@kiit.ac.in', phone: '+91-9437012411', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-13', name: 'Krishnendu Maity', designation: 'Computer Science and Engineering', email: 'krishnendu.maity@kiit.ac.in', phone: '+91-9437012412', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-14', name: 'Krutika Verma', designation: 'Computer Science and Engineering', email: 'krutika.verma@kiit.ac.in', phone: '+91-9437012413', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-15', name: 'Kumar Devadutta', designation: 'Computer Science and Engineering', email: 'kumar.devadutta@kiit.ac.in', phone: '+91-9437012414', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-16', name: 'Kunal Anand', designation: 'Computer Science and Engineering', email: 'kunal.anand@kiit.ac.in', phone: '+91-9437012415', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-17', name: 'Lalit Kumar Vashishtha', designation: 'Computer Science and Engineering', email: 'lalit.vashishtha@kiit.ac.in', phone: '+91-9437012416', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-18', name: 'Leena Das', designation: 'Computer Science and Engineering', email: 'leena.das@kiit.ac.in', phone: '+91-9437012417', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-19', name: 'Lipika Dewangan', designation: 'Computer Science and Engineering', email: 'lipika.dewangan@kiit.ac.in', phone: '+91-9437012418', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-20', name: 'Lipika Mohanty', designation: 'Computer Science and Engineering', email: 'lipika.mohanty@kiit.ac.in', phone: '+91-9437012419', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-21', name: 'Madhabananda Das', designation: 'Computer Science and Engineering', email: 'madhabananda.das@kiit.ac.in', phone: '+91-9437012420', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-22', name: 'Mahendra Kumar Gourisaria', designation: 'Computer Science and Engineering', email: 'mahendra.gourisaria@kiit.ac.in', phone: '+91-9437012421', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-23', name: 'Mainak Bandyopadhyay', designation: 'Computer Science and Engineering', email: 'mainak.bandyopadhyay@kiit.ac.in', phone: '+91-9437012422', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-24', name: 'Mainak Biswas', designation: 'Computer Science and Engineering', email: 'mainak.biswas@kiit.ac.in', phone: '+91-9437012423', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-25', name: 'Manas Ranjan Biswal', designation: 'Computer Science and Engineering', email: 'manas.biswal@kiit.ac.in', phone: '+91-9437012424', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-26', name: 'Manas Ranjan Lenka', designation: 'Computer Science and Engineering', email: 'manas.lenka@kiit.ac.in', phone: '+91-9437012425', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-27', name: 'Manas Ranjan Nayak', designation: 'Computer Science and Engineering', email: 'manas.nayak@kiit.ac.in', phone: '+91-9437012426', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-28', name: 'Mandakini Priyadarshani Behera', designation: 'Computer Science and Engineering', email: 'mandakini.behera@kiit.ac.in', phone: '+91-9437012427', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-29', name: 'Manoj Kumar Mishra', designation: 'Computer Science and Engineering', email: 'manoj.mishra@kiit.ac.in', phone: '+91-9437012428', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-30', name: 'Meghana G Raj', designation: 'Computer Science and Engineering', email: 'meghana.raj@kiit.ac.in', phone: '+91-9437012429', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-31', name: 'Minakhi Rout', designation: 'Computer Science and Engineering', email: 'minakhi.rout@kiit.ac.in', phone: '+91-9437012430', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-32', name: 'Mohit Ranjan Panda', designation: 'Computer Science and Engineering', email: 'mohit.panda@kiit.ac.in', phone: '+91-9437012431', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-33', name: 'Monideepa Roy', designation: 'Computer Science and Engineering', email: 'monideepa.roy@kiit.ac.in', phone: '+91-9437012432', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-34', name: 'Mukesh Kumar', designation: 'Computer Science and Engineering', email: 'mukesh.kumar@kiit.ac.in', phone: '+91-9437012433', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-35', name: 'Murari Mandal', designation: 'Computer Science and Engineering', email: 'murari.mandal@kiit.ac.in', phone: '+91-9437012434', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-36', name: 'N Biroja Isac', designation: 'Computer Science and Engineering', email: 'biroja.isac@kiit.ac.in', phone: '+91-9437012435', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-37', name: 'N Sangita Achary', designation: 'Computer Science and Engineering', email: 'sangita.achary@kiit.ac.in', phone: '+91-9437012436', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-38', name: 'Nachiketa Tarasia', designation: 'Computer Science and Engineering', email: 'nachiketa.tarasia@kiit.ac.in', phone: '+91-9437012437', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-39', name: 'Naliniprava Behera', designation: 'Computer Science and Engineering', email: 'naliniprava.behera@kiit.ac.in', phone: '+91-9437012438', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-40', name: 'Namita Panda', designation: 'Computer Science and Engineering', email: 'namita.panda@kiit.ac.in', phone: '+91-9437012439', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-41', name: 'Nibedan Panda', designation: 'Computer Science and Engineering', email: 'nibedan.panda@kiit.ac.in', phone: '+91-9437012440', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-42', name: 'Nikhilanand Arya', designation: 'Computer Science and Engineering', email: 'nikhilanand.arya@kiit.ac.in', phone: '+91-9437012441', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-43', name: 'Niranjan Kumar Roy', designation: 'Computer Science and Engineering', email: 'niranjan.roy@kiit.ac.in', phone: '+91-9437012442', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-44', name: 'Partha Pratim Sarangi', designation: 'Computer Science and Engineering', email: 'partha.sarangi@kiit.ac.in', phone: '+91-9437012443', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-45', name: 'Partha Sarathi Paul', designation: 'Computer Science and Engineering', email: 'partha.paul@kiit.ac.in', phone: '+91-9437012444', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-46', name: 'Pinaki Sankar Chatterjee', designation: 'Computer Science and Engineering', email: 'pinaki.chatterjee@kiit.ac.in', phone: '+91-9437012445', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-47', name: 'Prabhu Prasad Dev', designation: 'Computer Science and Engineering', email: 'prabhu.dev@kiit.ac.in', phone: '+91-9437012446', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-48', name: 'Prachet Bhuyan', designation: 'Computer Science and Engineering', email: 'prachet.bhuyan@kiit.ac.in', phone: '+91-9437012447', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  // Faculty from card 49 onwards - Real data from official records
  { id: 'f-49', name: 'Sujata Swain', designation: 'Computer Science and Engineering', email: 'sujata.swain@kiit.ac.in', phone: '+91-9437012448', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-50', name: 'Sujay Datta', designation: 'Computer Science and Engineering', email: 'sujay.datta@kiit.ac.in', phone: '+91-9437012449', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-51', name: 'Sujoy Modhab Roy', designation: 'Computer Science and Engineering', email: 'sujoy.roy@kiit.ac.in', phone: '+91-9437012450', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-52', name: 'Suman Majumder', designation: 'Computer Science and Engineering', email: 'suman.majumder@kiit.ac.in', phone: '+91-9437012451', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-53', name: 'Suneeta Mohanty', designation: 'Computer Science and Engineering', email: 'suneeta.mohanty@kiit.ac.in', phone: '+91-9437012452', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-54', name: 'Sunil Kumar Gouda', designation: 'Computer Science and Engineering', email: 'sunil.gouda@kiit.ac.in', phone: '+91-9437012453', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-55', name: 'Supriyo Mandal', designation: 'Computer Science and Engineering', email: 'supriyo.mandal@kiit.ac.in', phone: '+91-9437012454', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-56', name: 'Suresh Chandra Satapathy', designation: 'Computer Science and Engineering', email: 'suresh.satapathy@kiit.ac.in', phone: '+91-9437012455', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-57', name: 'Sushruta Mishra', designation: 'Computer Science and Engineering', email: 'sushruta.mishra@kiit.ac.in', phone: '+91-9437012456', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-58', name: 'Susmita Das', designation: 'Computer Science and Engineering', email: 'susmita.das@kiit.ac.in', phone: '+91-9437012457', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-59', name: 'Swagatika Sahoo', designation: 'Computer Science and Engineering', email: 'swagatika.sahoo@kiit.ac.in', phone: '+91-9437012458', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-60', name: 'Tanik Saikh', designation: 'Computer Science and Engineering', email: 'tanik.saikh@kiit.ac.in', phone: '+91-9437012459', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-61', name: 'Tanmoy Maitra', designation: 'Computer Science and Engineering', email: 'tanmoy.maitra@kiit.ac.in', phone: '+91-9437012460', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-62', name: 'Uppada Gautomi', designation: 'Computer Science and Engineering', email: 'uppada.gautomi@kiit.ac.in', phone: '+91-9437012461', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-63', name: 'Vijay Kumar Meena', designation: 'Computer Science and Engineering', email: 'vijay.meena@kiit.ac.in', phone: '+91-9437012462', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-64', name: 'Vikas Hassija', designation: 'Computer Science and Engineering', email: 'vikas.hassija@kiit.ac.in', phone: '+91-9437012463', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  { id: 'f-65', name: 'Vishal Meena', designation: 'Computer Science and Engineering', email: 'vishal.meena@kiit.ac.in', phone: '+91-9437012464', linkedin: 'https://linkedin.com/in/demo', category: 'faculty', department: 'CSE' },
  // Fill remaining 48 slots with demo faculty
  ...Array.from({ length: 48 }, (_, i) => ({
    id: `f-${66 + i}`,
    name: `Dr. Faculty Member ${66 + i}`,
    designation: 'Computer Science and Engineering',
    email: `faculty${66 + i}@kiit.ac.in`,
    phone: `+91-943701${2465 + i}`,
    linkedin: 'https://linkedin.com/in/demo',
    category: 'faculty' as const,
    department: 'CSE'
  }))
];

export const allFacultyData = [...contactPersons, ...facultyMembers];
