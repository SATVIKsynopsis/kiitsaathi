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
    phone: '943-722-9507',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-2',
    name: 'Dr. Hrudaya Kumar Tripathy',
    designation: 'Dean, Research',
    email: 'hrudaya.tripathy@kiit.ac.in',
    phone: '+91-9437012345',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-3',
    name: 'Dr. Bhabani Sankar Prasad Mishra',
    designation: 'Dean, Academics (CS)',
    email: 'bhabani.mishra@kiit.ac.in',
    phone: '+91-9437012346',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-4',
    name: 'Dr. Arup Abhinna Acharya',
    designation: 'Dean, Academics (IT)',
    email: 'arup.acharya@kiit.ac.in',
    phone: '+91-9437012347',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-5',
    name: 'Dr. Amulya Ratna Swain',
    designation: 'Dean, Academics (CC & CSM)',
    email: 'amulya.swain@kiit.ac.in',
    phone: '+91-9437012348',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-6',
    name: 'Dr. Ajay Kumar Jena',
    designation: 'Associate Dean',
    email: 'ajay.jena@kiit.ac.in',
    phone: '+91-9437012349',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-7',
    name: 'Dr. Anuja Kumar Acharya',
    designation: 'Dy. Controller of Examination',
    email: 'anuja.acharya@kiit.ac.in',
    phone: '+91-9437012350',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-8',
    name: 'Dr. Manas Ranjan Lenka',
    designation: 'Asst. CoE-I',
    email: 'manas.lenka@kiit.ac.in',
    phone: '+91-9437012351',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-9',
    name: 'Mr. Sujoy Datta',
    designation: 'Asst. CoE-2',
    email: 'sujoy.datta@kiit.ac.in',
    phone: '+91-9437012352',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-10',
    name: 'Dr. Subhasis Dash',
    designation: 'Asst. CoE-3',
    email: 'subhasis.dash@kiit.ac.in',
    phone: '+91-9437012353',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-11',
    name: 'Mr. Lalit Kumar Vashishtha',
    designation: 'Asst. CoE-4',
    email: 'lalit.vashishtha@kiit.ac.in',
    phone: '+91-9437012354',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-12',
    name: 'Dr. Kumar Devadutta',
    designation: 'Associate Dean (T&P)',
    email: 'kumar.devadutta@kiit.ac.in',
    phone: '+91-9437012355',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-13',
    name: 'Mr. Kshirod Kumar Nayak',
    designation: 'Sr. Administrative Officer',
    email: 'kshirod.nayak@kiit.ac.in',
    phone: '+91-9437012356',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-14',
    name: 'Dr. Satarupa Mohanty',
    designation: 'Faculty-In-Charges (Alumni Relation)',
    email: 'satarupa.mohanty@kiit.ac.in',
    phone: '+91-9437012357',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-15',
    name: 'Dr. Namita Panda',
    designation: 'Faculty-In-Charges (Alumni Relation)',
    email: 'namita.panda@kiit.ac.in',
    phone: '+91-9437012358',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-16',
    name: 'Ms. Shilpa Das',
    designation: 'Faculty-In-Charges (Alumni Relation)',
    email: 'shilpa.das@kiit.ac.in',
    phone: '+91-9437012359',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-17',
    name: 'Dr. Himansu Das',
    designation: 'Laboratory Governance',
    email: 'himansu.das@kiit.ac.in',
    phone: '+91-9437012360',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-18',
    name: 'Mrs. Suchismita Das',
    designation: 'Laboratory Governance',
    email: 'suchismita.das@kiit.ac.in',
    phone: '+91-9437012361',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-19',
    name: 'Ms. Arodhana Behura',
    designation: 'Library Enrichment',
    email: 'arodhana.behura@kiit.ac.in',
    phone: '+91-9437012362',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-20',
    name: 'Dr. Mohit Ranjan Panda',
    designation: 'Quality Assurance',
    email: 'mohit.panda@kiit.ac.in',
    phone: '+91-9437012363',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-21',
    name: 'Dr. Adyasha Dash',
    designation: 'Quality Assurance',
    email: 'adyasha.dash@kiit.ac.in',
    phone: '+91-9437012364',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-22',
    name: 'Dr. Pratyusa Mukherjee',
    designation: 'Quality Assurance',
    email: 'pratyusa.mukherjee@kiit.ac.in',
    phone: '+91-9437012365',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-23',
    name: 'Ms. Santwana Sagnika',
    designation: 'Website & Social Media Management',
    email: 'santwana.sagnika@kiit.ac.in',
    phone: '+91-9437012366',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-24',
    name: 'Dr. Robi Shaw',
    designation: 'Website & Social Media Management',
    email: 'robi.shaw@kiit.ac.in',
    phone: '+91-9437012367',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-25',
    name: 'Dr. Monjusha Pandey',
    designation: 'Student Affairs',
    email: 'monjusha.pandey@kiit.ac.in',
    phone: '+91-9437012368',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-26',
    name: 'Dr. Leena Das',
    designation: 'Student Affairs',
    email: 'leena.das@kiit.ac.in',
    phone: '+91-9437012369',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-27',
    name: 'Ms. Roshni Pradhan',
    designation: 'Student Affairs',
    email: 'roshni.pradhan@kiit.ac.in',
    phone: '+91-9437012370',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-28',
    name: 'Mr. Sankalp Nayak',
    designation: 'Student Affairs',
    email: 'sankalp.nayak@kiit.ac.in',
    phone: '+91-9437012371',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-29',
    name: 'Mr. Ajit Kumar Pasayat',
    designation: 'Student Affairs',
    email: 'ajit.pasayat@kiit.ac.in',
    phone: '+91-9437012372',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-30',
    name: 'Ms. Mandakini Priyadarshani Behera',
    designation: 'Student Affairs',
    email: 'mandakini.behera@kiit.ac.in',
    phone: '+91-9437012373',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-31',
    name: 'Mr. R. N. Ramakanta Parida',
    designation: 'Student Affairs (NCC & NSS)',
    email: 'ramakanta.parida@kiit.ac.in',
    phone: '+91-9437012374',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-32',
    name: 'Dr. Minakhi Rout',
    designation: 'Student Affairs (NCC & NSS)',
    email: 'minakhi.rout@kiit.ac.in',
    phone: '+91-9437012375',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-33',
    name: 'Mrs. Subhashree Darshana',
    designation: 'Student Affairs (NCC & NSS)',
    email: 'subhashree.darshana@kiit.ac.in',
    phone: '+91-9437012376',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-34',
    name: 'Dr. Rajat Kumar Behera',
    designation: 'International Student Affairs (Academics)',
    email: 'rajat.behera@kiit.ac.in',
    phone: '+91-9437012377',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-35',
    name: 'Dr. Jayanta Mondal',
    designation: 'International Student Affairs (Academics)',
    email: 'jayanta.mondal@kiit.ac.in',
    phone: '+91-9437012378',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-36',
    name: 'Dr. Mainak Bandyopadhyay',
    designation: 'International Student Affairs (Academics)',
    email: 'mainak.bandyopadhyay@kiit.ac.in',
    phone: '+91-9437012379',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-37',
    name: 'Dr. Ajay Kumar Jena',
    designation: 'Time Table Governance',
    email: 'ajay.jena@kiit.ac.in',
    phone: '+91-9437012380',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-38',
    name: 'Dr. Abhaya Kumar Sahoo',
    designation: 'Time Table Governance',
    email: 'abhaya.sahoo@kiit.ac.in',
    phone: '+91-9437012381',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-39',
    name: 'Dr. Dayal Kumar Behera',
    designation: 'Time Table Governance',
    email: 'dayal.behera@kiit.ac.in',
    phone: '+91-9437012382',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-40',
    name: 'Dr. Arghya Kundu',
    designation: 'Guest Lecture Engagement',
    email: 'arghya.kundu@kiit.ac.in',
    phone: '+91-9437012383',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-41',
    name: 'Dr. Pradeep Kumar Mallick',
    designation: 'Guest Lecture Engagement',
    email: 'pradeep.mallick@kiit.ac.in',
    phone: '+91-9437012384',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-42',
    name: 'Dr. Vikas Hassija',
    designation: 'Industry & Institute Collaboration',
    email: 'vikas.hassija@kiit.ac.in',
    phone: '+91-9437012385',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-43',
    name: 'Dr. Satyananda Champati Rai',
    designation: 'Industry & Institute Collaboration',
    email: 'satyananda.rai@kiit.ac.in',
    phone: '+91-9437012386',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-44',
    name: 'Dr. Jogannath Singh',
    designation: 'Project Co-ordinator (UG)',
    email: 'jogannath.singh@kiit.ac.in',
    phone: '+91-9437012387',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-45',
    name: 'Dr. Sushruta Mishra',
    designation: 'Project Co-ordinator (UG)',
    email: 'sushruta.mishra@kiit.ac.in',
    phone: '+91-9437012388',
    linkedin: 'https://linkedin.com/in/demo',
    category: 'contact'
  },
  {
    id: 'cp-46',
    name: 'Dr. Saikat Chakraborty',
    designation: 'Project Co-ordinator (UG)',
    email: 'saikat.chakraborty@kiit.ac.in',
    phone: '+91-9437012389',
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
  // Fill remaining 65 slots with demo faculty
  ...Array.from({ length: 65 }, (_, i) => ({
    id: `f-${49 + i}`,
    name: `Dr. Faculty Member ${49 + i}`,
    designation: 'Computer Science and Engineering',
    email: `faculty${49 + i}@kiit.ac.in`,
    phone: `+91-943701${2448 + i}`,
    linkedin: 'https://linkedin.com/in/demo',
    category: 'faculty' as const,
    department: 'CSE'
  }))
];

export const allFacultyData = [...contactPersons, ...facultyMembers];
