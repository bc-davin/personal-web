export interface Experience {
  _id: string;
  title: string;
  company: string;
  location?: string;
  lat?: number;
  lon?: number;
  description: string;
  responsibilities: string[];
  technologies: string[];
  start_date: string;
  end_date?: string;
  employment_type: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExperienceCreate {
  title: string;
  company: string;
  location?: string;
  lat?: number;
  lon?: number;
  description: string;
  responsibilities?: string[];
  technologies?: string[];
  start_date: string;
  end_date?: string;
  employment_type?: string;
  is_current?: boolean;
}
