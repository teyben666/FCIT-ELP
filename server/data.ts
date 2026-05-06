import {Announcement, Assignment, MaterialItem, NotificationItem, Submission, UploadPolicyTier, User, UserRole, Course} from './types';

export const users: User[] = [
  {
    id: 'u1',
    email: 'student@university.edu',
    password: 'password123',
    name: 'Alex Johnson',
    role: 'student',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    settings: {
      notifications: {
        email_enabled: true,
        push_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        digest_frequency: 'daily',
      },
    },
  },
  {
    id: 'l1',
    email: 'lecturer@university.edu',
    password: 'password123',
    name: 'Prof. Anderson',
    role: 'lecturer',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prof',
    settings: {
      notifications: {
        email_enabled: true,
        push_enabled: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        digest_frequency: 'weekly',
      },
    },
  },
  {
    id: 'a1',
    email: 'admin@university.edu',
    password: 'password123',
    name: 'System Admin',
    role: 'admin',
    settings: {
      notifications: {
        email_enabled: true,
        push_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '07:00',
        digest_frequency: 'off',
      },
    },
  },
];

export const courses: Course[] = [
  {
    id: 'c1',
    name: 'Intro to UX Design',
    code: 'UXD101',
    join_code: 'UXD101-JOIN',
    lecturer_id: 'l1',
    semester: '2026S',
    enrolled_student_count: 45,
    my_role: 'student',
    description: 'Learn fundamentals of UX design from wireframe to validation.',
  },
  {
    id: 'c2',
    name: 'Advanced Web Development',
    code: 'CS302',
    join_code: 'CS302-JOIN',
    lecturer_id: 'l1',
    semester: '2026S',
    enrolled_student_count: 30,
    my_role: 'student',
    description: 'Build full-stack apps with modern frontend and backend tooling.',
  },
  {
    id: 'c3',
    name: 'Interaction Design Studio',
    code: 'IXD210',
    join_code: 'IXD210-JOIN',
    lecturer_id: 'l1',
    semester: '2026S',
    enrolled_student_count: 0,
    my_role: 'student',
    description: 'Studio-based interaction design with critiques and rapid iteration.',
  },
];

export const uploadPolicyTiers: UploadPolicyTier[] = [
  {
    id: 'general',
    label: 'General documents',
    max_file_size_mb: 50,
    accepted_types: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'],
    chunked_upload_enabled: false,
  },
  {
    id: 'standard',
    label: 'Standard assignment package',
    max_file_size_mb: 200,
    accepted_types: ['pdf', 'zip', 'rar', '7z'],
    chunked_upload_enabled: false,
  },
  {
    id: 'video',
    label: 'Video/media submission',
    max_file_size_mb: 500,
    accepted_types: ['mp4', 'mov', 'zip'],
    chunked_upload_enabled: true,
  },
];

export const assignments: Assignment[] = [
  {
    id: 'a1',
    course_id: 'c1',
    title: 'Final Project: Wireframe',
    description: 'Create a mobile wireframe and short rationale report.',
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    max_file_size_mb: 50,
    allow_late_submission: true,
    late_penalty_per_day: 5,
    upload_tier: 'general',
  },
  {
    id: 'a2',
    course_id: 'c2',
    title: 'Server-side Integration',
    description: 'Implement REST API and connect to your frontend app.',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    max_file_size_mb: 200,
    allow_late_submission: false,
    late_penalty_per_day: 0,
    upload_tier: 'standard',
  },
];

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    user_id: 'u1',
    type: 'assignment_due',
    course_id: 'c1',
    title: 'Approaching Deadline',
    body: 'Final Project: Wireframe is due in 24 hours.',
    created_at: new Date().toISOString(),
    is_read: false,
    action_link: '/assignments/a1',
    dedup_key: 'u1:assignment_due:a1:24h',
  },
  {
    id: 'n2',
    user_id: 'u1',
    type: 'grade_released',
    course_id: 'c2',
    title: 'New Grade Available',
    body: 'Your Quiz 1 result has been published.',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    is_read: true,
    action_link: '/courses/c2',
    dedup_key: 'u1:grade_released:q1',
  },
];

export const submissions: Submission[] = [];
export const announcements: Announcement[] = [
  {
    id: 'an1',
    course_id: 'c1',
    author_id: 'l1',
    title: 'Welcome to UXD101',
    body: 'Please review the syllabus and Week 1 material before class.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];
export const materials: MaterialItem[] = [
  {
    id: 'm1',
    course_id: 'c1',
    title: 'Week 1 - UX Intro.pdf',
    file_url: '/materials/ux-intro.pdf',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm2',
    course_id: 'c2',
    title: 'REST API Notes.pdf',
    file_url: '/materials/rest-api-notes.pdf',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];
export const enrollments = new Map<string, Set<string>>([
  ['u1', new Set(['c1'])],
]);

export const roleByUserId = new Map<string, UserRole>(users.map((u) => [u.id, u.role]));
