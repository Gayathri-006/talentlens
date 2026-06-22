CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('candidate', 'recruiter');

CREATE TYPE application_status AS ENUM (
  'applied',
  'under_review',
  'shortlisted',
  'interview',
  'selected',
  'rejected'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  role user_role NOT NULL,
  avatar_url TEXT,
  google_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(30),
  linkedin TEXT,
  github TEXT,
  portfolio TEXT,
  skills TEXT[],
  location VARCHAR(150),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(200),
  company_website TEXT,
  company_location VARCHAR(150),
  recruiter_title VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  location VARCHAR(150),
  job_type VARCHAR(100),
  experience_level VARCHAR(100),
  salary_range VARCHAR(100),
  min_salary INTEGER,
  required_skills TEXT[],
  responsibilities TEXT,
  requirements TEXT,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  linkedin TEXT,
  github TEXT,
  portfolio TEXT,
  cover_letter TEXT,
  resume_file_path TEXT,
  resume_original_name TEXT,
  status application_status DEFAULT 'applied',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, candidate_id)
);

CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type VARCHAR(100),
  size_bytes INTEGER,
  extracted_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resume_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis JSONB NOT NULL,
  overall_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidate_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
  overall_match_score INTEGER,
  technical_match INTEGER,
  experience_match INTEGER,
  education_match INTEGER,
  project_match INTEGER,
  strengths TEXT[],
  weaknesses TEXT[],
  missing_skills TEXT[],
  risk_factors TEXT[],
  recommendation TEXT,
  interview_questions JSONB,
  full_analysis JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interview_date DATE NOT NULL,
  interview_time TIME NOT NULL,
  interview_type VARCHAR(100),
  meeting_link TEXT,
  interviewer_name VARCHAR(150),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_name VARCHAR(150) NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  event_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES users(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  email_type VARCHAR(100),
  recipient_email VARCHAR(255),
  subject TEXT,
  body TEXT,
  status VARCHAR(50) DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_resumes_candidate_id ON resumes(candidate_id);
CREATE INDEX idx_candidate_scores_application_id ON candidate_scores(application_id);
CREATE INDEX idx_interviews_application_id ON interviews(application_id);