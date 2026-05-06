/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  LogIn, 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Bell, 
  User as UserIcon,
  LogIn as LogInIcon,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import Layout from './components/Layout';
import CourseDetail from './pages/CourseDetail';
import AssignmentDetail from './pages/AssignmentDetail';
import GradingQueue from './pages/GradingQueue';
import { Button } from './components/ui/Button';
import { UserRole } from './types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { clearAuthSession, createAdminUser, deleteAdminUser, getAdminUsers, getMe, hasSessionToken, login, updateAdminUser } from './lib/api';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Sub-components as proper functions
const Dashboard = ({ role }: { role: UserRole }) => {
  const { assignments, courses, usingMockData } = useAppData();
  return (
    <div className="grid grid-cols-12 gap-6">
    {usingMockData && (
      <div className="col-span-12 rounded-2xl border border-warning/20 bg-warning/5 px-4 py-3 text-xs font-bold text-warning">
        API offline, currently using local mock data.
      </div>
    )}
    {/* Welcome Banner - Big Bento Block */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-12 lg:col-span-8 bg-gradient-to-br from-primary to-primary-light rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/20"
    >
      <div className="relative z-10">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
          {role === 'student' ? 'Welcome back, Alex!' : 'Hello, Prof. Anderson'}
        </h2>
        <p className="text-white/80 max-w-lg text-lg font-medium leading-relaxed">
          {role === 'student' 
            ? "You have 3 assignments due this week. Your average submission rate is up by 15% compared to last semester."
            : "You have 12 pending submissions to grade today and 1 faculty meeting at 3 PM."}
        </p>
        <div className="flex gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-2xl font-black">{role === 'student' ? '4.2' : '12'}</div>
            <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">{role === 'student' ? 'Current GPA' : 'Grading Pool'}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-2xl font-black">{role === 'student' ? '98%' : '4'}</div>
            <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">{role === 'student' ? 'Attendance' : 'Active Classes'}</div>
          </div>
        </div>
      </div>
      <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
    </motion.div>

    {/* Urgent Tasks - Vertical Bento Block */}
    <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl text-slate-800 tracking-tight">{role === 'student' ? 'Urgent Tasks' : 'Upcoming Deadlines'}</h3>
        <span className="text-danger text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
          Priority
        </span>
      </div>
      <div className="space-y-4 flex-1">
        {assignments.map((assignment, idx) => (
          <Link 
            to={role === 'student' ? `/assignments/${assignment.id}` : `/grading`}
            key={assignment.id} 
            className={cn(
              "p-4 rounded-2xl border-l-4 transition-all hover:translate-x-1",
              idx === 0 ? "bg-warning/5 border-warning" : "bg-danger/5 border-danger"
            )}
          >
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {courses.find(c => c.id === assignment.course_id)?.code}
            </div>
            <div className="font-bold text-slate-800 truncate">{assignment.title}</div>
            <div className={cn(
              "text-[10px] mt-2 font-black uppercase tracking-widest",
              idx === 0 ? "text-warning" : "text-danger"
            )}>
              {role === 'student' ? (idx === 0 ? 'Deadline: 2h 45m left' : 'Overdue (Late penalty applies)') : 'Grading ends 18:00'}
            </div>
          </Link>
        ))}
        {assignments.length < 3 && (
           <div className="p-4 bg-slate-50 rounded-2xl opacity-60 grayscale border-l-4 border-slate-300">
             <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">MA102</div>
             <div className="font-bold text-slate-300">Weekly Quiz #12</div>
             <div className="text-[10px] mt-2 font-black text-slate-300 uppercase tracking-widest">Completed</div>
           </div>
        )}
      </div>
    </div>

    {/* Recent Courses - Small Grid Bento */}
    <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
      <h3 className="font-black text-lg mb-6 tracking-tight text-slate-800">My Courses</h3>
      <div className="space-y-5">
        {courses.map(course => (
          <Link to={`/courses/${course.id}`} key={course.id} className="flex items-center gap-4 group">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all group-hover:scale-110 group-hover:rotate-6",
              course.id === 'c1' ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
            )}>
              {course.code.slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-black text-slate-800 truncate group-hover:text-primary transition-colors">{course.name}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{course.enrolled_student_count} Students</div>
            </div>
          </Link>
        ))}
      </div>
    </div>

    {/* Quick Upload / Actions - Small Grid Bento Dark */}
    <div className="col-span-12 md:col-span-4 bg-text-main text-white rounded-[2rem] p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
      <div className="relative z-10 flex justify-between items-start">
        <h3 className="font-black text-lg tracking-tight">Quick Action</h3>
        <span className="text-[8px] px-2 py-1 bg-white/10 rounded-full font-black uppercase tracking-widest">Tier: 500MB</span>
      </div>
      <div className="relative z-10 border-2 border-dashed border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:border-white/40 transition-colors mt-6 bg-white/5 backdrop-blur-sm">
        <div className="w-10 h-10 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
           <LogIn size={20} className="transform rotate-90" />
        </div>
        <div className="text-xs font-black uppercase tracking-widest">Fast Upload</div>
        <div className="text-[8px] text-white/40 mt-1 uppercase font-bold tracking-tighter">PDF, ZIP supported</div>
      </div>
    </div>

    {/* Activity Feed - Small Grid Bento */}
    <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm overflow-hidden">
      <h3 className="font-black text-lg mb-6 tracking-tight text-slate-800">Activity</h3>
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-primary shrink-0"></div>
          <div>
            <div className="text-sm font-black text-slate-800">UXD101 Grade Released</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Yesterday, 4:30 PM</div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-warning shrink-0"></div>
          <div>
            <div className="text-sm font-black text-slate-800">New Material Posted</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tuesday, 10:15 AM</div>
          </div>
        </div>
      </div>
    </div>

    {/* Wide Status Block */}
    <div className="col-span-12 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-xl tracking-tight text-slate-800">System Status</h3>
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-success rounded-full"></span> Healthy</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-slate-200 rounded-full"></span> Offline</span>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl">
           <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
             <span>Storage Used</span>
             <span className="text-primary">78%</span>
           </div>
           <div className="w-full bg-white h-4 rounded-full overflow-hidden p-1 shadow-inner">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '78%' }}
               className="bg-primary h-full rounded-full"
             />
           </div>
           <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">
             <span>390MB / 500MB</span>
             <span>Plan: Standard Student</span>
           </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 w-full md:w-64">
        <Button className="w-full h-14 rounded-2xl">Check For Updates</Button>
        <Button variant="outline" className="w-full h-14 rounded-2xl">Contact Admin</Button>
      </div>
    </div>
    </div>
  );
};

const CourseList = () => {
  const { courses, assignments, discoverCourses, joinByCode, leaveFromCourse, user, createCourse, createAssignment, updateCourse, deleteCourse } = useAppData();
  const [joinCode, setJoinCode] = React.useState('');
  const [joinStatus, setJoinStatus] = React.useState('');
  const [courseFilter, setCourseFilter] = React.useState<'current' | 'completed'>('current');
  const [layoutMode, setLayoutMode] = React.useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem(`elp_course_layout_${user.role}`);
    return saved === 'list' ? 'list' : 'grid';
  });
  const [courseName, setCourseName] = React.useState('');
  const [courseCode, setCourseCode] = React.useState('');
  const [semester, setSemester] = React.useState('2026S');
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [assignmentTitle, setAssignmentTitle] = React.useState('');
  const [assignmentDueDate, setAssignmentDueDate] = React.useState('');
  const [editingCourseId, setEditingCourseId] = React.useState('');
  const [editCourseName, setEditCourseName] = React.useState('');
  const [editCourseCode, setEditCourseCode] = React.useState('');
  const [editSemester, setEditSemester] = React.useState('');

  React.useEffect(() => {
    localStorage.setItem(`elp_course_layout_${user.role}`, layoutMode);
  }, [layoutMode, user.role]);

  const now = Date.now();
  const isCourseCompleted = (courseId: string) => {
    const related = assignments.filter((assignment) => assignment.course_id === courseId);
    if (related.length === 0) {
      return false;
    }
    return related.every((assignment) => new Date(assignment.due_date).getTime() < now);
  };
  const filteredCourses = courses.filter((course) => (courseFilter === 'current' ? !isCourseCompleted(course.id) : isCourseCompleted(course.id)));

  return (
    <div className="space-y-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Courses</h2>
      <div className="flex flex-wrap gap-3">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setCourseFilter('current')}
            className={cn(
              'px-6 py-2.5 font-bold text-sm rounded-xl transition-all',
              courseFilter === 'current' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            Current
          </button>
          <button
            onClick={() => setCourseFilter('completed')}
            className={cn(
              'px-6 py-2.5 font-bold text-sm rounded-xl transition-all',
              courseFilter === 'completed' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            Completed
          </button>
        </div>
        {(user.role === 'student' || user.role === 'lecturer') && (
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setLayoutMode('grid')}
              className={cn(
                'px-4 py-2.5 font-bold text-sm rounded-xl transition-all',
                layoutMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600',
              )}
            >
              Grid
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={cn(
                'px-4 py-2.5 font-bold text-sm rounded-xl transition-all',
                layoutMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600',
              )}
            >
              List
            </button>
          </div>
        )}
      </div>
    </div>

    {user.role === 'student' && (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Join Course</h3>
        <p className="text-sm text-slate-500">Enter class code (same flow as Google Classroom).</p>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="e.g. UXD101-JOIN"
            className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full"
          />
          <Button
            className="h-12 rounded-xl"
            onClick={async () => {
              setJoinStatus('');
              try {
                await joinByCode(joinCode);
                setJoinCode('');
                setJoinStatus('Joined successfully.');
              } catch {
                setJoinStatus('Join failed. Please check your class code.');
              }
            }}
          >
            Join
          </Button>
        </div>
        {joinStatus && <p className="text-xs font-bold text-primary">{joinStatus}</p>}
        {discoverCourses.length > 0 && (
          <p className="text-xs text-slate-400">
            Available class codes: {discoverCourses.map((course) => course.join_code).filter(Boolean).join(', ')}
          </p>
        )}
      </div>
    )}

    {user.role === 'lecturer' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-black">Create Course</h3>
          <input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Course name" className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full" />
          <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="Course code" className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full" />
          <input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Semester" className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full" />
          <Button
            className="rounded-xl h-11"
            onClick={async () => {
              await createCourse({name: courseName, code: courseCode, semester});
              setCourseName('');
              setCourseCode('');
            }}
          >
            Create Course
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-black">Create Assignment</h3>
          <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full">
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
            ))}
          </select>
          <input value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} placeholder="Assignment title" className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full" />
          <input type="datetime-local" value={assignmentDueDate} onChange={(e) => setAssignmentDueDate(e.target.value)} className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full" />
          <Button
            className="rounded-xl h-11"
            onClick={async () => {
              if (!selectedCourseId || !assignmentDueDate) {
                return;
              }
              await createAssignment(selectedCourseId, {
                title: assignmentTitle,
                due_date: new Date(assignmentDueDate).toISOString(),
              });
              setAssignmentTitle('');
              setAssignmentDueDate('');
            }}
          >
            Publish Assignment
          </Button>
        </div>
      </div>
    )}
    
    <div className={cn('gap-8', layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col')}>
      {filteredCourses.map(course => (
        <Link 
          to={`/courses/${course.id}`}
          key={course.id} 
          className={cn(
            'bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group flex h-full',
            layoutMode === 'grid' ? 'flex-col' : 'flex-row items-center',
          )}
        >
          <div className={cn(
            course.id === 'c1' ? 'bg-primary/5' : 'bg-indigo-50',
            layoutMode === 'grid' ? 'h-40 p-8 relative overflow-hidden' : 'w-40 self-stretch p-6 relative overflow-hidden',
          )}>
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
             <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10">
               <span className="font-black text-2xl uppercase">{course.code.slice(0, 2)}</span>
             </div>
          </div>
          <div className="p-8 flex-1 flex flex-col">
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{course.code}</span>
            <h3 className="text-2xl font-extrabold mt-2 group-hover:text-primary transition-colors leading-tight">{course.name}</h3>
            <p className="text-slate-500 font-medium text-sm mt-3 line-clamp-2 leading-relaxed">{course.description}</p>
            <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Semester: {course.semester}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="w-10 h-10 rounded-full bg-slate-200 border-4 border-white overflow-hidden ring-1 ring-slate-100 relative group/avatar">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.id+j}`} alt="student" className="transition-transform group-hover/avatar:scale-110" />
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center gap-2 group-hover:bg-primary group-hover:text-white transition-all">
                 <span className="text-sm font-bold">{course.enrolled_student_count}</span>
                 <ChevronRight size={18} />
              </div>
            </div>
            {user.role === 'student' && (
              <Button
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={async (e) => {
                  e.preventDefault();
                  await leaveFromCourse(course.id);
                }}
              >
                Leave Course
              </Button>
            )}
            {user.role === 'lecturer' && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingCourseId(course.id);
                    setEditCourseName(course.name);
                    setEditCourseCode(course.code);
                    setEditSemester(course.semester);
                  }}
                >
                  Edit Course
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={async (e) => {
                    e.preventDefault();
                    await deleteCourse(course.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
    {user.role === 'lecturer' && editingCourseId && (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <h3 className="text-lg font-black">Edit Course</h3>
        <input value={editCourseName} onChange={(e) => setEditCourseName(e.target.value)} placeholder="Course name" className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full" />
        <input value={editCourseCode} onChange={(e) => setEditCourseCode(e.target.value)} placeholder="Course code" className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full" />
        <input value={editSemester} onChange={(e) => setEditSemester(e.target.value)} placeholder="Semester" className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full" />
        <div className="flex gap-3">
          <Button
            className="rounded-xl"
            onClick={async () => {
              await updateCourse(editingCourseId, {
                name: editCourseName,
                code: editCourseCode,
                semester: editSemester,
              });
              setEditingCourseId('');
            }}
          >
            Save Course
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => setEditingCourseId('')}>
            Cancel
          </Button>
        </div>
      </div>
    )}
    {filteredCourses.length === 0 && (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
        No {courseFilter} courses found.
      </div>
    )}
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) => {
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('student');
  const [email, setEmail] = React.useState('student@university.edu');
  const [password, setPassword] = React.useState('password123');
  const [loginError, setLoginError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const presets: Record<UserRole, string> = {
      student: 'student@university.edu',
      lecturer: 'lecturer@university.edu',
      admin: 'admin@university.edu',
    };
    setEmail(presets[selectedRole]);
    setPassword('password123');
  }, [selectedRole]);

  return (
  <div className="min-h-screen bg-surface flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-surface to-surface">
     <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-primary/10 border border-slate-100 relative overflow-hidden"
     >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        
        <div className="flex flex-col items-center mb-12 relative z-10 text-center">
           <div className="w-20 h-20 bg-primary rounded-[1.8rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-primary/30 mb-8 transform hover:rotate-12 transition-transform cursor-pointer relative">
              E
              <div className="absolute inset-0 bg-white/20 rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity" />
           </div>
           <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none">EduPulse</h1>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-3">University Learning Portal</p>
        </div>

        <div className="space-y-6 relative z-10">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role</label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                {(['student', 'lecturer', 'admin'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      'py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all',
                      selectedRole === role ? 'bg-white text-primary shadow-sm' : 'text-slate-400',
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic ID</label>
              <input 
                type="email" 
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-800 placeholder:text-slate-300"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-800 placeholder:text-slate-300"
              />
           </div>
           <div className="flex justify-between items-center px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                 <div className="w-5 h-5 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center group-hover:border-primary transition-colors">
                    <div className="w-2 h-2 rounded-sm bg-primary opacity-0 group-hover:opacity-20 translate-y-0.5 group-active:opacity-100 transition-opacity" />
                 </div>
                 <span className="text-xs font-bold text-slate-500">Keep me in</span>
              </label>
              <button className="text-primary font-bold text-xs hover:underline transition-all">Forgot credentials?</button>
           </div>

           <Button 
            className="w-full h-16 text-lg rounded-[1.8rem] shadow-2xl shadow-primary/30 font-black tracking-tight" 
            disabled={loading}
            onClick={async () => {
              setLoginError('');
              setLoading(true);
              try {
                await onLogin(email, password);
              } catch {
                setLoginError('Invalid credentials. Please check email and password.');
              } finally {
                setLoading(false);
              }
            }}
          >
             {loading ? 'Signing In...' : 'Secure Sign In'} <LogInIcon size={20} className="ml-1" />
           </Button>
           {loginError && <p className="text-danger text-xs font-bold text-center">{loginError}</p>}
        </div>

        <div className="mt-12 pt-10 border-t border-slate-50 text-center relative z-10">
           <p className="text-slate-400 text-sm font-bold">New academic? <button className="text-primary font-black hover:underline transition-all">Request access</button></p>
        </div>
     </motion.div>
  </div>
  );
};

const Notifications = () => {
  const { notifications, markAsRead } = useAppData();
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false);
  const displayNotifications = showUnreadOnly ? notifications.filter((item) => !item.is_read) : notifications;
  return (
    <div className="max-w-3xl mx-auto space-y-10">
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
       <div>
         <h2 className="text-4xl font-black text-slate-900 tracking-tight">Center</h2>
         <p className="text-slate-500 font-medium mt-1">Keep track of your academic journey.</p>
       </div>
       <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 w-fit">
          <button
            onClick={() => setShowUnreadOnly(false)}
            className={cn(
              'px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl',
              !showUnreadOnly ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            All
          </button>
          <button
            onClick={() => setShowUnreadOnly(true)}
            className={cn(
              'px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl',
              showUnreadOnly ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            Unread
          </button>
       </div>
    </header>

    <div className="space-y-6">
      {displayNotifications.slice(0, 6).map((item, i) => (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          key={item.id} 
          className={cn(
            "bg-white p-8 rounded-[2.5rem] border transition-all hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden",
            i === 1 ? "border-primary/20 bg-primary/[0.02]" : "border-slate-100"
          )}
        >
          {i === 1 && <div className="absolute top-0 left-0 w-2 h-full bg-primary" />}
          <div className="flex flex-col md:flex-row gap-6">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110",
              i === 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
            )}>
              <ChevronRight size={28} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{item.type.replace('_', ' ')}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(item.created_at).toLocaleString()}</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{item.title}</h4>
              <p className="text-slate-500 mt-3 font-medium leading-relaxed">{item.body}</p>
              
              <div className="mt-6 flex items-center gap-4">
                 <Button size="sm" variant="outline" className="rounded-xl font-bold" onClick={() => markAsRead(item.id)}>
                  Mark read
                 </Button>
                 <Button size="sm" className="rounded-xl font-bold">View Detail</Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
    </div>
  );
};

const Profile = ({ userRole }: { userRole: UserRole }) => (
  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col items-center text-center shadow-xl shadow-slate-200/50">
         <div className="w-32 h-32 rounded-full border-8 border-primary/5 p-2 relative group cursor-pointer">
            <img src={userRole === 'student' ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Prof"} alt="Avatar" className="w-full h-full rounded-full bg-slate-100 transition-transform group-hover:scale-105" />
         </div>
         <h3 className="text-2xl font-black text-slate-900 mt-6 tracking-tight">{userRole === 'student' ? 'Alex Johnson' : 'Prof. Anderson'}</h3>
         <p className="text-slate-400 font-medium">{userRole === 'student' ? 'B.A. Graphic Design • Year 2' : 'Senior Lecturer • School of Design'}</p>
         
         <div className="mt-8 pt-8 border-t border-slate-100 w-full">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center">Current Role</p>
            <p className="text-sm font-black uppercase text-primary text-center mt-2">{userRole}</p>
         </div>
      </div>
    </div>
    
    <div className="md:col-span-2 space-y-10">
       <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-black mb-8 tracking-tight text-slate-800">Notification Preferences</h3>
          <div className="space-y-8">
             {[
               { label: 'Email Notifications', desc: 'Receive summaries and major alerts via email.' },
               { label: 'Push Notifications', desc: 'Direct alerts to your mobile device browsers.' },
               { label: 'Quiet Hours', desc: 'Silence all alerts between 10PM and 8AM.' }
             ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between gap-6 pb-8 border-b border-slate-50 last:border-0 last:pb-0">
                   <div className="max-w-xs">
                      <p className="font-bold text-slate-800 text-lg">{pref.label}</p>
                      <p className="text-sm text-slate-400 font-medium mt-1 leading-snug">{pref.desc}</p>
                   </div>
                   <button className={cn(
                     "w-14 h-8 rounded-full transition-all relative p-1",
                     i === 2 ? "bg-slate-200" : "bg-primary"
                   )}>
                      <div className={cn(
                        "w-6 h-6 bg-white rounded-full shadow-md transition-all",
                        i === 2 ? "translate-x-0" : "translate-x-6"
                      )} />
                   </button>
                </div>
             ))}
          </div>
          <Button className="w-full mt-10 h-16 rounded-[1.5rem]" variant="secondary">Save Preferences</Button>
       </section>
    </div>
  </div>
);

const StudentPage = () => <Dashboard role="student" />;

const LecturerPage = () => (
  <div className="space-y-8">
    <div className="bg-white border border-slate-200 rounded-3xl p-8">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lecturer Page</h2>
      <p className="text-slate-500 mt-2">Overview and teaching stats. Create/edit actions are now in My Courses.</p>
    </div>
    <Dashboard role="lecturer" />
  </div>
);

const AdminPage = () => {
  const {courses, assignments, notifications} = useAppData();
  const [users, setUsers] = React.useState<{id: string; name: string; email: string; role: UserRole}[]>([]);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('student');

  const loadUsers = React.useCallback(async () => {
    const response = await getAdminUsers();
    setUsers(response.map((u) => ({id: u.id, name: u.name, email: u.email, role: u.role})));
  }, []);

  React.useEffect(() => {
    loadUsers().catch(() => setUsers([]));
  }, [loadUsers]);

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-3xl p-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Page</h2>
        <p className="text-slate-500 mt-2">System-wide monitoring for courses, submissions, and notification operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-black">Courses</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{courses.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-black">Assignments</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{assignments.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-black">Notifications</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{notifications.length}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-black">User Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50" />
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50">
            <option value="student">student</option>
            <option value="lecturer">lecturer</option>
            <option value="admin">admin</option>
          </select>
          <Button
            onClick={async () => {
              await createAdminUser({name, email, role});
              setName('');
              setEmail('');
              await loadUsers();
            }}
          >
            Add User
          </Button>
        </div>
        <div className="space-y-3">
          {users.map((item) => (
            <div key={item.id} className="border border-slate-100 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400">{item.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={item.role}
                  onChange={async (e) => {
                    await updateAdminUser(item.id, {role: e.target.value as UserRole});
                    await loadUsers();
                  }}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <option value="student">student</option>
                  <option value="lecturer">lecturer</option>
                  <option value="admin">admin</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await deleteAdminUser(item.id);
                    await loadUsers();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(hasSessionToken());
  const [userRole, setUserRole] = React.useState<UserRole>('student');

  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    getMe()
      .then((me) => setUserRole(me.role))
      .catch(() => {
        clearAuthSession();
        setIsAuthenticated(false);
      });
  }, [isAuthenticated]);

  const handleSignOut = React.useCallback(() => {
    clearAuthSession();
    setUserRole('student');
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={async (email, password) => {
          const result = await login(email, password);
          setUserRole(result.user.role);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const roleHomePath: Record<UserRole, string> = {
    student: '/student',
    lecturer: '/lecturer',
    admin: '/admin',
  };

  const studentNavItems = [
    { icon: LayoutDashboard, label: 'Student Page', path: '/student' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  const lecturerNavItems = [
    { icon: GraduationCap, label: 'Lecturer Page', path: '/lecturer' },
    { icon: BookOpen, label: 'My Courses', path: '/courses' },
    { icon: GraduationCap, label: 'Grading', path: '/grading' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  const adminNavItems = [
    { icon: ShieldCheck, label: 'Admin Page', path: '/admin' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  const navItemsByRole: Record<UserRole, { icon: any, label: string, path: string }[]> = {
    student: studentNavItems,
    lecturer: lecturerNavItems,
    admin: adminNavItems,
  };

  return (
    <AppDataProvider>
      <Routes>
        <Route
          path="/"
          element={<Layout customNavItems={navItemsByRole[userRole]} onSignOut={handleSignOut} />}
        >
          <Route index element={<Navigate to={roleHomePath[userRole]} replace />} />
          <Route path="student" element={userRole === 'student' ? <StudentPage /> : <Navigate to={roleHomePath[userRole]} replace />} />
          <Route path="lecturer" element={userRole === 'lecturer' ? <LecturerPage /> : <Navigate to={roleHomePath[userRole]} replace />} />
          <Route path="admin" element={userRole === 'admin' ? <AdminPage /> : <Navigate to={roleHomePath[userRole]} replace />} />
          <Route path="courses" element={<CourseList />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route path="assignments/:assignmentId" element={<AssignmentDetail />} />
          <Route path="grading" element={<GradingQueue />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile userRole={userRole} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppDataProvider>
  );
}
