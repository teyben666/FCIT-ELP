export type UserRole = 'student' | 'lecturer' | 'admin';
export type UploadTier = 'general' | 'standard' | 'video';
export type NotificationType = 'assignment_due' | 'grade_released' | 'announcement' | 'system';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  settings: {
    notifications: {
      email_enabled: boolean;
      push_enabled: boolean;
      quiet_hours_start: string;
      quiet_hours_end: string;
      digest_frequency: 'daily' | 'weekly' | 'off';
    };
  };
}

export interface Course {
  id: string;
  name: string;
  code: string;
  join_code: string;
  lecturer_id: string;
  semester: string;
  enrolled_student_count: number;
  my_role: UserRole;
  description?: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  max_file_size_mb: number;
  allow_late_submission: boolean;
  late_penalty_per_day: number;
  upload_tier: UploadTier;
}

export interface SubmissionFile {
  name: string;
  url: string;
  size_bytes: number;
}

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  submitted_at: string;
  files: SubmissionFile[];
  text_entry?: string;
  grade?: number;
  feedback?: string;
  is_late: boolean;
  graded_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  course_id?: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  action_link: string;
  dedup_key: string;
}

export interface Announcement {
  id: string;
  course_id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
}

export interface MaterialItem {
  id: string;
  course_id: string;
  title: string;
  file_url: string;
  created_at: string;
}

export interface UploadPolicyTier {
  id: UploadTier;
  label: string;
  max_file_size_mb: number;
  accepted_types: string[];
  chunked_upload_enabled: boolean;
}
