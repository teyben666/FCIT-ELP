import { User, Course, Assignment, Notification } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  email: 'student@university.edu',
  name: 'Alex Johnson',
  role: 'student',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  settings: {
    notifications: {
      email_enabled: true,
      push_enabled: true,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      digest_frequency: 'daily'
    }
  }
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    name: 'Intro to UX Design',
    code: 'UXD101',
    lecturer_id: 'l1',
    semester: '2026S',
    enrolled_student_count: 45,
    my_role: 'student',
    description: 'Learn the fundamentals of user experience design, from wireframing to high-fidelity prototyping.'
  },
  {
    id: 'c2',
    name: 'Advanced Web Development',
    code: 'CS302',
    lecturer_id: 'l2',
    semester: '2026S',
    enrolled_student_count: 30,
    my_role: 'student',
    description: 'Deep dive into full-stack development with modern frameworks and cloud services.'
  }
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    course_id: 'c1',
    title: 'Final Project: Wireframe',
    description: 'Create a low-fidelity wireframe for a mobile application of your choice.',
    due_date: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    max_file_size_mb: 50,
    allow_late_submission: true,
    late_penalty_per_day: 5,
    upload_tier: 'general'
  },
  {
    id: 'a2',
    course_id: 'c2',
    title: 'Server-side Integration',
    description: 'Implement a REST API using Express and integrate it with your frontend.',
    due_date: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    max_file_size_mb: 200,
    allow_late_submission: false,
    late_penalty_per_day: 0,
    upload_tier: 'standard'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'assignment_due',
    course_id: 'c1',
    title: 'Approaching Deadline',
    body: 'Your Final Project: Wireframe is due in 24 hours.',
    created_at: new Date().toISOString(),
    is_read: false,
    action_link: '/assignments/a1'
  },
  {
    id: 'n2',
    type: 'grade_released',
    course_id: 'c2',
    title: 'New Grade Available',
    body: 'Your Quiz 1 results have been published.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_read: true,
    action_link: '/courses/c2'
  }
];
