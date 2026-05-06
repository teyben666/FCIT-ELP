/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  id: string;
  email: string;
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
  join_code?: string;
  lecturer_id: string;
  semester: string;
  enrolled_student_count: number;
  my_role: UserRole;
  description?: string;
}

export type UploadTier = 'general' | 'standard' | 'video';

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

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  student_name?: string;
  assignment_title?: string;
  submitted_at: string;
  files: { name: string; url: string; size_bytes: number }[];
  text_entry?: string;
  grade?: number;
  feedback?: string;
  is_late: boolean;
  graded_at?: string;
}

export type NotificationType = 'assignment_due' | 'grade_released' | 'announcement' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  course_id?: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  action_link: string;
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

export interface CourseMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
