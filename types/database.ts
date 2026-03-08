export type UserRole = 'worker' | 'renter' | 'admin';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    full_name?: string;
    avatar_url?: string;
    company_name?: string;
    title?: string;
    skills?: string[];
    created_at: string;
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    requirements?: string[];
    benefits?: string[];
    logo_url?: string;
    is_sponsored: boolean;
    created_at: string;

    // Upwork Style Fields
    category: string;
    sub_category?: string;
    experience_level?: 'Entry' | 'Intermediate' | 'Expert';
    contract_type?: 'Hourly' | 'Fixed Price';
    budget_min?: number;
    budget_max?: number;
    hourly_rate_min?: number;
    hourly_rate_max?: number;
    estimated_duration?: string;
    project_size?: 'Small' | 'Medium' | 'Large';
}

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: Job;
        Insert: Partial<Job>;
        Update: Partial<Job>;
      };
      // Add other tables here if needed
    };
  };
};
