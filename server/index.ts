import cors from 'cors';
import express, {Request, Response, NextFunction} from 'express';
import {randomUUID} from 'node:crypto';
import {announcements, assignments, courses, enrollments, materials, notifications, submissions, uploadPolicyTiers, users} from './data';
import {UserRole} from './types';

const app = express();
const port = Number(process.env.PORT || 4000);
const sessions = new Map<string, string>();

app.use(cors());
app.use(express.json());

const publicUser = (user: (typeof users)[number]) => {
  const {password, ...safeUser} = user;
  return safeUser;
};

const getVisibleCourseIds = (user: (typeof users)[number]) => {
  if (user.role === 'admin') {
    return new Set(courses.map((c) => c.id));
  }
  if (user.role === 'lecturer') {
    return new Set(courses.filter((c) => c.lecturer_id === user.id).map((c) => c.id));
  }
  return new Set(enrollments.get(user.id) ?? []);
};

const serializeCourse = (course: (typeof courses)[number], user: (typeof users)[number]) => {
  const myRole: UserRole = user.role === 'admin' ? 'admin' : user.role === 'lecturer' ? 'lecturer' : 'student';
  return {...course, my_role: myRole};
};

const getVisibleCourses = (user: (typeof users)[number]) => {
  const ids = getVisibleCourseIds(user);
  return courses.filter((course) => ids.has(course.id)).map((course) => serializeCourse(course, user));
};

const getVisibleAssignments = (user: (typeof users)[number]) => {
  const ids = getVisibleCourseIds(user);
  return assignments.filter((assignment) => ids.has(assignment.course_id));
};

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token || !sessions.has(token)) {
    return res.status(401).json({message: 'Unauthorized'});
  }

  const userId = sessions.get(token);
  const user = users.find((u) => u.id === userId);
  if (!user) {
    sessions.delete(token);
    return res.status(401).json({message: 'Unauthorized'});
  }

  (req as Request & {currentUser: typeof user}).currentUser = user;
  return next();
};

const requireRole = (roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  if (!roles.includes(user.role)) {
    return res.status(403).json({message: 'Forbidden'});
  }
  return next();
};

app.get('/api/health', (_req, res) => {
  res.json({status: 'ok', service: 'elp-api'});
});

app.post('/api/auth/login', (req, res) => {
  const {email, password} = req.body ?? {};
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({message: 'Invalid credentials'});
  }

  const token = randomUUID();
  sessions.set(token, user.id);

  return res.json({
    token,
    user: publicUser(user),
    expires_in_seconds: 60 * 60 * 8,
  });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  res.json(publicUser(user));
});

app.get('/api/mobile/bootstrap', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const userNotifications = notifications.filter((n) => n.user_id === user.id);

  res.json({
    user: publicUser(user),
    courses: getVisibleCourses(user),
    assignments: getVisibleAssignments(user),
    notifications: userNotifications,
    upload_policies: uploadPolicyTiers,
  });
});

app.get('/api/courses', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  res.json(getVisibleCourses(user));
});

app.get('/api/courses/discover', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  if (user.role !== 'student') {
    return res.json([]);
  }

  const joined = enrollments.get(user.id) ?? new Set<string>();
  const discoverable = courses.filter((course) => !joined.has(course.id)).map((course) => serializeCourse(course, user));
  return res.json(discoverable);
});

app.post('/api/courses/join', authMiddleware, requireRole(['student']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const rawCode = String(req.body?.join_code ?? '').trim();
  const found = courses.find((course) => course.join_code.toLowerCase() === rawCode.toLowerCase());
  if (!found) {
    return res.status(404).json({message: 'Invalid join code'});
  }

  const current = enrollments.get(user.id) ?? new Set<string>();
  if (!current.has(found.id)) {
    current.add(found.id);
    enrollments.set(user.id, current);
    found.enrolled_student_count += 1;
  }

  return res.json({joined: true, course: serializeCourse(found, user)});
});

app.post('/api/courses/:courseId/leave', authMiddleware, requireRole(['student']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const target = courses.find((course) => course.id === req.params.courseId);
  if (!target) {
    return res.status(404).json({message: 'Course not found'});
  }

  const joined = enrollments.get(user.id) ?? new Set<string>();
  if (joined.has(target.id)) {
    joined.delete(target.id);
    enrollments.set(user.id, joined);
    target.enrolled_student_count = Math.max(0, target.enrolled_student_count - 1);
  }

  return res.json({left: true, course_id: target.id});
});

app.post('/api/courses', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const {name, code, semester, description} = req.body ?? {};
  if (!name || !code || !semester) {
    return res.status(400).json({message: 'name, code, semester are required'});
  }

  const created = {
    id: randomUUID(),
    name: String(name),
    code: String(code).toUpperCase(),
    join_code: `${String(code).toUpperCase()}-JOIN`,
    lecturer_id: user.role === 'admin' ? String(req.body?.lecturer_id ?? user.id) : user.id,
    semester: String(semester),
    enrolled_student_count: 0,
    my_role: user.role,
    description: String(description ?? ''),
  };
  courses.push(created);
  return res.status(201).json(serializeCourse(created, user));
});

app.patch('/api/courses/:courseId', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const target = courses.find((course) => course.id === req.params.courseId);
  if (!target) {
    return res.status(404).json({message: 'Course not found'});
  }
  if (user.role === 'lecturer' && target.lecturer_id !== user.id) {
    return res.status(403).json({message: 'Forbidden'});
  }

  const {name, code, semester, description} = req.body ?? {};
  if (name !== undefined) {
    target.name = String(name);
  }
  if (code !== undefined) {
    target.code = String(code).toUpperCase();
    target.join_code = `${target.code}-JOIN`;
  }
  if (semester !== undefined) {
    target.semester = String(semester);
  }
  if (description !== undefined) {
    target.description = String(description);
  }

  return res.json(serializeCourse(target, user));
});

app.delete('/api/courses/:courseId', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const targetIndex = courses.findIndex((course) => course.id === req.params.courseId);
  if (targetIndex < 0) {
    return res.status(404).json({message: 'Course not found'});
  }
  const target = courses[targetIndex];
  if (user.role === 'lecturer' && target.lecturer_id !== user.id) {
    return res.status(403).json({message: 'Forbidden'});
  }

  courses.splice(targetIndex, 1);
  for (let i = assignments.length - 1; i >= 0; i -= 1) {
    if (assignments[i].course_id === target.id) {
      assignments.splice(i, 1);
    }
  }
  for (let i = materials.length - 1; i >= 0; i -= 1) {
    if (materials[i].course_id === target.id) {
      materials.splice(i, 1);
    }
  }
  for (const [, joined] of enrollments.entries()) {
    joined.delete(target.id);
  }
  return res.json({deleted: true, course_id: target.id});
});

app.get('/api/courses/:courseId', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const course = courses.find((c) => c.id === req.params.courseId);
  if (!course) {
    return res.status(404).json({message: 'Course not found'});
  }
  if (!getVisibleCourseIds(user).has(course.id)) {
    return res.status(403).json({message: 'Forbidden'});
  }
  return res.json(serializeCourse(course, user));
});

app.get('/api/courses/:courseId/assignments', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  if (!getVisibleCourseIds(user).has(req.params.courseId)) {
    return res.status(403).json({message: 'Forbidden'});
  }
  const list = assignments.filter((a) => a.course_id === req.params.courseId);
  res.json(list);
});

app.get('/api/courses/:courseId/materials', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  if (!getVisibleCourseIds(user).has(req.params.courseId)) {
    return res.status(403).json({message: 'Forbidden'});
  }
  const list = materials
    .filter((item) => item.course_id === req.params.courseId)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return res.json(list);
});

app.post('/api/courses/:courseId/materials', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const course = courses.find((c) => c.id === req.params.courseId);
  if (!course) {
    return res.status(404).json({message: 'Course not found'});
  }
  if (user.role === 'lecturer' && course.lecturer_id !== user.id) {
    return res.status(403).json({message: 'Forbidden'});
  }

  const {title, file_url} = req.body ?? {};
  if (!title || !file_url) {
    return res.status(400).json({message: 'title and file_url are required'});
  }

  const created = {
    id: randomUUID(),
    course_id: course.id,
    title: String(title),
    file_url: String(file_url),
    created_at: new Date().toISOString(),
  };
  materials.push(created);
  return res.status(201).json(created);
});

app.delete('/api/materials/:materialId', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const targetIndex = materials.findIndex((item) => item.id === req.params.materialId);
  if (targetIndex < 0) {
    return res.status(404).json({message: 'Material not found'});
  }
  const target = materials[targetIndex];
  const course = courses.find((c) => c.id === target.course_id);
  if (!course) {
    return res.status(404).json({message: 'Course not found'});
  }
  if (user.role === 'lecturer' && course.lecturer_id !== user.id) {
    return res.status(403).json({message: 'Forbidden'});
  }
  materials.splice(targetIndex, 1);
  return res.json({deleted: true, material_id: target.id});
});

app.post('/api/courses/:courseId/assignments', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const course = courses.find((c) => c.id === req.params.courseId);
  if (!course) {
    return res.status(404).json({message: 'Course not found'});
  }
  if (user.role === 'lecturer' && course.lecturer_id !== user.id) {
    return res.status(403).json({message: 'Forbidden'});
  }

  const {title, description, due_date, max_file_size_mb, upload_tier = 'general'} = req.body ?? {};
  if (!title || !due_date) {
    return res.status(400).json({message: 'title and due_date are required'});
  }

  const created = {
    id: randomUUID(),
    course_id: course.id,
    title: String(title),
    description: String(description ?? ''),
    due_date: String(due_date),
    max_file_size_mb: Number(max_file_size_mb ?? 50),
    allow_late_submission: true,
    late_penalty_per_day: 5,
    upload_tier,
  };
  assignments.push(created);
  return res.status(201).json(created);
});

app.patch('/api/assignments/:assignmentId', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const target = assignments.find((assignment) => assignment.id === req.params.assignmentId);
  if (!target) {
    return res.status(404).json({message: 'Assignment not found'});
  }

  const parentCourse = courses.find((course) => course.id === target.course_id);
  if (!parentCourse) {
    return res.status(404).json({message: 'Course not found'});
  }
  if (user.role === 'lecturer' && parentCourse.lecturer_id !== user.id) {
    return res.status(403).json({message: 'Forbidden'});
  }

  const {title, description, due_date, max_file_size_mb, upload_tier} = req.body ?? {};
  if (title !== undefined) {
    target.title = String(title);
  }
  if (description !== undefined) {
    target.description = String(description);
  }
  if (due_date !== undefined) {
    target.due_date = String(due_date);
  }
  if (max_file_size_mb !== undefined) {
    target.max_file_size_mb = Number(max_file_size_mb);
  }
  if (upload_tier !== undefined) {
    target.upload_tier = upload_tier;
  }

  return res.json(target);
});

app.delete('/api/assignments/:assignmentId', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const targetIndex = assignments.findIndex((assignment) => assignment.id === req.params.assignmentId);
  if (targetIndex < 0) {
    return res.status(404).json({message: 'Assignment not found'});
  }

  const target = assignments[targetIndex];
  const parentCourse = courses.find((course) => course.id === target.course_id);
  if (!parentCourse) {
    return res.status(404).json({message: 'Course not found'});
  }
  if (user.role === 'lecturer' && parentCourse.lecturer_id !== user.id) {
    return res.status(403).json({message: 'Forbidden'});
  }

  assignments.splice(targetIndex, 1);
  for (let i = submissions.length - 1; i >= 0; i -= 1) {
    if (submissions[i].assignment_id === target.id) {
      submissions.splice(i, 1);
    }
  }

  return res.json({deleted: true, assignment_id: target.id});
});

app.get('/api/assignments', authMiddleware, (_req, res) => {
  res.json(assignments);
});

app.get('/api/assignments/:assignmentId', authMiddleware, (req, res) => {
  const assignment = assignments.find((a) => a.id === req.params.assignmentId);
  if (!assignment) {
    return res.status(404).json({message: 'Assignment not found'});
  }
  return res.json(assignment);
});

app.post('/api/assignments/:assignmentId/submissions', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const assignment = assignments.find((a) => a.id === req.params.assignmentId);
  if (!assignment) {
    return res.status(404).json({message: 'Assignment not found'});
  }

  const {files = [], text_entry = ''} = req.body ?? {};
  const now = new Date().toISOString();
  const isLate = new Date(now).getTime() > new Date(assignment.due_date).getTime();

  const submission = {
    id: randomUUID(),
    assignment_id: assignment.id,
    user_id: user.id,
    submitted_at: now,
    files,
    text_entry,
    is_late: isLate,
  };

  submissions.push(submission);
  return res.status(201).json(submission);
});

app.get(
  '/api/assignments/:assignmentId/submissions',
  authMiddleware,
  requireRole(['lecturer', 'admin']),
  (req, res) => {
    const list = submissions.filter((s) => s.assignment_id === req.params.assignmentId);
    return res.json(list);
  },
);

app.patch('/api/submissions/:submissionId/grade', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const target = submissions.find((s) => s.id === req.params.submissionId);
  if (!target) {
    return res.status(404).json({message: 'Submission not found'});
  }

  const {grade, feedback} = req.body ?? {};
  target.grade = Number(grade);
  target.feedback = feedback ?? '';
  target.graded_at = new Date().toISOString();

  return res.json(target);
});

app.get('/api/submissions', authMiddleware, requireRole(['lecturer', 'admin']), (_req, res) => {
  const enriched = submissions
    .map((submission) => {
      const student = users.find((u) => u.id === submission.user_id);
      const assignment = assignments.find((a) => a.id === submission.assignment_id);
      return {
        ...submission,
        student_name: student?.name || 'Unknown Student',
        assignment_title: assignment?.title || 'Unknown Assignment',
      };
    })
    .sort((a, b) => +new Date(b.submitted_at) - +new Date(a.submitted_at));

  return res.json(enriched);
});

app.get('/api/courses/:courseId/members', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const course = courses.find((c) => c.id === req.params.courseId);
  if (!course) {
    return res.status(404).json({message: 'Course not found'});
  }
  if (user.role === 'lecturer' && course.lecturer_id !== user.id) {
    return res.status(403).json({message: 'Forbidden'});
  }

  const members = [...enrollments.entries()]
    .filter(([, joined]) => joined.has(course.id))
    .map(([userId]) => users.find((u) => u.id === userId))
    .filter(Boolean)
    .map((member) => ({id: member!.id, name: member!.name, email: member!.email, role: member!.role}));

  return res.json(members);
});

app.delete('/api/courses/:courseId/members/:memberId', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const course = courses.find((c) => c.id === req.params.courseId);
  if (!course) {
    return res.status(404).json({message: 'Course not found'});
  }
  if (user.role === 'lecturer' && course.lecturer_id !== user.id) {
    return res.status(403).json({message: 'Forbidden'});
  }

  const joined = enrollments.get(req.params.memberId);
  if (joined?.has(course.id)) {
    joined.delete(course.id);
    course.enrolled_student_count = Math.max(0, course.enrolled_student_count - 1);
  }
  return res.json({removed: true, member_id: req.params.memberId, course_id: course.id});
});

app.get('/api/admin/users', authMiddleware, requireRole(['admin']), (_req, res) => {
  return res.json(users.map((user) => publicUser(user)));
});

app.post('/api/admin/users', authMiddleware, requireRole(['admin']), (req, res) => {
  const {name, email, role = 'student', password = 'password123'} = req.body ?? {};
  if (!name || !email) {
    return res.status(400).json({message: 'name and email are required'});
  }
  const created = {
    id: randomUUID(),
    name: String(name),
    email: String(email),
    role,
    password: String(password),
    settings: {
      notifications: {
        email_enabled: true,
        push_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        digest_frequency: 'daily' as const,
      },
    },
  };
  users.push(created);
  return res.status(201).json(publicUser(created));
});

app.patch('/api/admin/users/:userId', authMiddleware, requireRole(['admin']), (req, res) => {
  const target = users.find((user) => user.id === req.params.userId);
  if (!target) {
    return res.status(404).json({message: 'User not found'});
  }
  const {name, email, role} = req.body ?? {};
  if (name !== undefined) {
    target.name = String(name);
  }
  if (email !== undefined) {
    target.email = String(email);
  }
  if (role !== undefined) {
    target.role = role;
  }
  return res.json(publicUser(target));
});

app.delete('/api/admin/users/:userId', authMiddleware, requireRole(['admin']), (req, res) => {
  const targetIndex = users.findIndex((user) => user.id === req.params.userId);
  if (targetIndex < 0) {
    return res.status(404).json({message: 'User not found'});
  }
  const removed = users[targetIndex];
  users.splice(targetIndex, 1);
  enrollments.delete(removed.id);
  return res.json({deleted: true, user_id: removed.id});
});

app.get('/api/notifications', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const list = notifications
    .filter((n) => n.user_id === user.id)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return res.json(list);
});

app.get('/api/courses/:courseId/announcements', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  if (!getVisibleCourseIds(user).has(req.params.courseId)) {
    return res.status(403).json({message: 'Forbidden'});
  }
  const list = announcements
    .filter((item) => item.course_id === req.params.courseId)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return res.json(list);
});

app.post('/api/courses/:courseId/announcements', authMiddleware, requireRole(['lecturer', 'admin']), (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const course = courses.find((c) => c.id === req.params.courseId);
  if (!course) {
    return res.status(404).json({message: 'Course not found'});
  }
  if (user.role === 'lecturer' && course.lecturer_id !== user.id) {
    return res.status(403).json({message: 'Forbidden'});
  }

  const {title, body} = req.body ?? {};
  if (!title || !body) {
    return res.status(400).json({message: 'title and body are required'});
  }

  const created = {
    id: randomUUID(),
    course_id: course.id,
    author_id: user.id,
    title: String(title),
    body: String(body),
    created_at: new Date().toISOString(),
  };
  announcements.push(created);

  const studentIds = [...enrollments.entries()]
    .filter(([, joined]) => joined.has(course.id))
    .map(([studentId]) => studentId);
  studentIds.forEach((studentId) => {
    notifications.push({
      id: randomUUID(),
      user_id: studentId,
      type: 'announcement',
      course_id: course.id,
      title: `New announcement in ${course.code}`,
      body: created.title,
      created_at: new Date().toISOString(),
      is_read: false,
      action_link: `/courses/${course.id}`,
      dedup_key: `${studentId}:announcement:${created.id}`,
    });
  });

  return res.status(201).json(created);
});

app.patch('/api/notifications/:notificationId/read', authMiddleware, (req, res) => {
  const user = (req as Request & {currentUser: (typeof users)[number]}).currentUser;
  const target = notifications.find((n) => n.id === req.params.notificationId && n.user_id === user.id);
  if (!target) {
    return res.status(404).json({message: 'Notification not found'});
  }
  target.is_read = true;
  return res.json(target);
});

app.get('/api/upload-policies', authMiddleware, (_req, res) => {
  res.json(uploadPolicyTiers);
});

app.listen(port, () => {
  console.log(`ELP API running on http://localhost:${port}`);
});
