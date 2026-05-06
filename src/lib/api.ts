import {Announcement, Assignment, Course, CourseMember, MaterialItem, Notification, Submission, User, UserRole} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

type LoginResponse = {
  token: string;
  user: User;
};

const authStore = {
  token: localStorage.getItem('elp_token') || '',
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authStore.token ? {Authorization: `Bearer ${authStore.token}`} : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const login = await fetchJson<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
  authStore.token = login.token;
  localStorage.setItem('elp_token', login.token);
  return login;
}

export function hasSessionToken() {
  return Boolean(authStore.token);
}

export async function getMe() {
  return fetchJson<User>('/me');
}

export async function getBootstrapData() {
  return fetchJson<{
    user: User;
    courses: Course[];
    assignments: Assignment[];
    notifications: Notification[];
  }>('/mobile/bootstrap');
}

export async function joinCourse(joinCode: string) {
  return fetchJson<{joined: boolean; course: Course}>('/courses/join', {
    method: 'POST',
    body: JSON.stringify({join_code: joinCode}),
  });
}

export async function leaveCourse(courseId: string) {
  return fetchJson<{left: boolean; course_id: string}>(`/courses/${courseId}/leave`, {
    method: 'POST',
  });
}

export async function getDiscoverCourses() {
  return fetchJson<Course[]>('/courses/discover');
}

export async function createCourse(payload: {name: string; code: string; semester: string; description?: string}) {
  return fetchJson<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCourse(courseId: string, payload: {name?: string; code?: string; semester?: string; description?: string}) {
  return fetchJson<Course>(`/courses/${courseId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function createAssignmentForCourse(
  courseId: string,
  payload: {title: string; description?: string; due_date: string; max_file_size_mb?: number; upload_tier?: string},
) {
  return fetchJson<Assignment>(`/courses/${courseId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAssignment(
  assignmentId: string,
  payload: {title?: string; description?: string; due_date?: string; max_file_size_mb?: number; upload_tier?: string},
) {
  return fetchJson<Assignment>(`/assignments/${assignmentId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAssignment(assignmentId: string) {
  return fetchJson<{deleted: boolean; assignment_id: string}>(`/assignments/${assignmentId}`, {
    method: 'DELETE',
  });
}

export async function getCourseAnnouncements(courseId: string) {
  return fetchJson<Announcement[]>(`/courses/${courseId}/announcements`);
}

export async function createCourseAnnouncement(courseId: string, payload: {title: string; body: string}) {
  return fetchJson<Announcement>(`/courses/${courseId}/announcements`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCourseMaterials(courseId: string) {
  return fetchJson<MaterialItem[]>(`/courses/${courseId}/materials`);
}

export async function createCourseMaterial(courseId: string, payload: {title: string; file_url: string}) {
  return fetchJson<MaterialItem>(`/courses/${courseId}/materials`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteCourseMaterial(materialId: string) {
  return fetchJson<{deleted: boolean; material_id: string}>(`/materials/${materialId}`, {
    method: 'DELETE',
  });
}

export async function getCourseMembers(courseId: string) {
  return fetchJson<CourseMember[]>(`/courses/${courseId}/members`);
}

export async function removeCourseMember(courseId: string, memberId: string) {
  return fetchJson<{removed: boolean; member_id: string; course_id: string}>(`/courses/${courseId}/members/${memberId}`, {
    method: 'DELETE',
  });
}

export async function submitAssignment(assignmentId: string, payload: {text_entry?: string; files: {name: string; url: string; size_bytes: number}[]}) {
  return fetchJson(`/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function markNotificationRead(notificationId: string) {
  return fetchJson<Notification>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export async function getSubmissions() {
  return fetchJson<Submission[]>('/submissions');
}

export async function gradeSubmission(submissionId: string, grade: number, feedback = '') {
  return fetchJson<Submission>(`/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    body: JSON.stringify({grade, feedback}),
  });
}

export async function deleteCourse(courseId: string) {
  return fetchJson<{deleted: boolean; course_id: string}>(`/courses/${courseId}`, {
    method: 'DELETE',
  });
}

export async function getAdminUsers() {
  return fetchJson<User[]>('/admin/users');
}

export async function createAdminUser(payload: {name: string; email: string; role: UserRole; password?: string}) {
  return fetchJson<User>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(userId: string, payload: {name?: string; email?: string; role?: UserRole}) {
  return fetchJson<User>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(userId: string) {
  return fetchJson<{deleted: boolean; user_id: string}>(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

export function clearAuthSession() {
  authStore.token = '';
  localStorage.removeItem('elp_token');
}
