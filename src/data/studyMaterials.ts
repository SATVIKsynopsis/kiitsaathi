// Dummy data for Study Materials
export interface StudyMaterialItem {
  id: number;
  title: string;
  subject: string;
  semester: string;
  year: string;
  type: 'note' | 'pyq';
  downloadUrl: string; // placeholder for now
  views: number;
  uploadedBy: string;
  uploadDate: string;
}


export const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

export const years = ["2024", "2023", "2022", "2021", "2020"];