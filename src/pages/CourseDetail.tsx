import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Megaphone, 
  Files, 
  FileCheck, 
  GraduationCap,
  ChevronRight,
  MoreHorizontal,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAppData } from '../context/AppDataContext';
import { createCourseAnnouncement, createCourseMaterial, deleteCourseMaterial, getCourseAnnouncements, getCourseMaterials, getCourseMembers, removeCourseMember } from '../lib/api';
import { Announcement, CourseMember, MaterialItem } from '../types';
import { Button } from '../components/ui/Button';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = React.useState('announcements');
  const {courses, assignments, user, discoverCourses, joinByCode, leaveFromCourse, updateAssignment, deleteAssignment} = useAppData();
  const [items, setItems] = React.useState<Announcement[]>([]);
  const [materials, setMaterials] = React.useState<MaterialItem[]>([]);
  const [members, setMembers] = React.useState<CourseMember[]>([]);
  const [announcementTitle, setAnnouncementTitle] = React.useState('');
  const [announcementBody, setAnnouncementBody] = React.useState('');
  const [materialTitle, setMaterialTitle] = React.useState('');
  const [materialUrl, setMaterialUrl] = React.useState('');
  const [editAssignmentId, setEditAssignmentId] = React.useState('');
  const [editAssignmentTitle, setEditAssignmentTitle] = React.useState('');
  const [editAssignmentDueDate, setEditAssignmentDueDate] = React.useState('');
  const course = courses.find(c => c.id === courseId);
  const isJoined = Boolean(courseId && courses.some((courseItem) => courseItem.id === courseId));
  const canJoin = Boolean(courseId && discoverCourses.some((courseItem) => courseItem.id === courseId));

  React.useEffect(() => {
    let active = true;
    async function loadAnnouncements() {
      if (!courseId) {
        return;
      }
      try {
        const response = await getCourseAnnouncements(courseId);
        if (active) {
          setItems(response);
        }
      } catch {
        if (active) {
          setItems([]);
        }
      }
    }
    loadAnnouncements();
    return () => {
      active = false;
    };
  }, [courseId]);

  React.useEffect(() => {
    let active = true;
    async function loadMaterialsAndMembers() {
      if (!courseId) {
        return;
      }
      try {
        const [materialResponse, memberResponse] = await Promise.all([
          getCourseMaterials(courseId),
          user.role === 'student' ? Promise.resolve([]) : getCourseMembers(courseId),
        ]);
        if (!active) {
          return;
        }
        setMaterials(materialResponse);
        setMembers(memberResponse);
      } catch {
        if (!active) {
          return;
        }
        setMaterials([]);
        setMembers([]);
      }
    }
    loadMaterialsAndMembers();
    return () => {
      active = false;
    };
  }, [courseId, user.role]);

  if (!course) return <div className="p-10 text-center">Course not found</div>;

  const tabs = [
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'materials', label: 'Materials', icon: Files },
    { id: 'assignments', label: 'Assignments', icon: FileCheck },
    { id: 'grades', label: 'Grades', icon: GraduationCap },
  ];

  return (
    <div className="space-y-8">
      {/* Course Hero */}
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden bg-primary p-8 md:p-12 flex flex-col justify-end text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10">
          <span className="text-sm font-bold uppercase tracking-widest text-primary-foreground/70">{course.code} • {course.semester}</span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-2 tracking-tight">{course.name}</h1>
          <p className="text-primary-foreground/80 mt-2 max-w-xl hidden md:block">{course.description}</p>
        </div>
      </div>
      {user.role === 'student' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-slate-700">Enrollment:</span>
          <span className={isJoined ? 'text-success font-black text-xs uppercase' : 'text-warning font-black text-xs uppercase'}>
            {isJoined ? 'Joined' : 'Not joined'}
          </span>
          {isJoined && courseId && (
            <Button variant="outline" size="sm" onClick={() => leaveFromCourse(courseId)}>
              Leave Course
            </Button>
          )}
          {!isJoined && canJoin && (
            <Button
              size="sm"
              onClick={async () => {
                if (!course) {
                  return;
                }
                await joinByCode(course.join_code || '');
              }}
            >
              Join Course
            </Button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar gap-2 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            {(user.role === 'lecturer' || user.role === 'admin') && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-lg font-black">Post Announcement</h3>
                <input
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Title"
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full"
                />
                <textarea
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  placeholder="Announcement details"
                  className="min-h-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 w-full"
                />
                <Button
                  className="rounded-xl"
                  onClick={async () => {
                    if (!courseId || !announcementTitle || !announcementBody) {
                      return;
                    }
                    await createCourseAnnouncement(courseId, {title: announcementTitle, body: announcementBody});
                    const refreshed = await getCourseAnnouncements(courseId);
                    setItems(refreshed);
                    setAnnouncementTitle('');
                    setAnnouncementBody('');
                  }}
                >
                  Publish
                </Button>
              </div>
            )}

             {items.map((item) => (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }} 
                 animate={{ opacity: 1, x: 0 }}
                 key={item.id} 
                 className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden"
               >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-xl text-slate-800 tracking-tight">{item.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {item.body}
                  </p>
                  <button className="text-primary font-black text-[10px] uppercase tracking-widest mt-6 inline-flex items-center gap-2 hover:translate-x-1 transition-transform">
                    Read Full Story <ArrowRight size={14} />
                  </button>
               </motion.div>
             ))}
            {items.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-sm text-slate-500">
                No announcement yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-4">
            {(user.role === 'lecturer' || user.role === 'admin') && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-lg font-black">Upload Material</h3>
                <input
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="Material title"
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full"
                />
                <input
                  value={materialUrl}
                  onChange={(e) => setMaterialUrl(e.target.value)}
                  placeholder="File URL (or storage path)"
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full"
                />
                <Button
                  onClick={async () => {
                    if (!courseId || !materialTitle || !materialUrl) {
                      return;
                    }
                    await createCourseMaterial(courseId, {title: materialTitle, file_url: materialUrl});
                    const refreshed = await getCourseMaterials(courseId);
                    setMaterials(refreshed);
                    setMaterialTitle('');
                    setMaterialUrl('');
                  }}
                >
                  Add Material
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((item) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow group"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    <Files size={24} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                    <p className="text-xs text-slate-400 uppercase font-bold mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <a href={item.file_url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-primary transition-colors">
                    <MoreHorizontal size={20} />
                  </a>
                  {(user.role === 'lecturer' || user.role === 'admin') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await deleteCourseMaterial(item.id);
                        if (!courseId) {
                          return;
                        }
                        const refreshed = await getCourseMaterials(courseId);
                        setMaterials(refreshed);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
            {materials.length === 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-sm text-slate-500">
                No materials uploaded yet.
              </div>
            )}
            {(user.role === 'lecturer' || user.role === 'admin') && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-lg font-black">Course Members</h3>
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-3">
                    <div>
                      <p className="font-bold text-slate-800">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!courseId) {
                          return;
                        }
                        await removeCourseMember(courseId, member.id);
                        const refreshed = await getCourseMembers(courseId);
                        setMembers(refreshed);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {members.length === 0 && <p className="text-sm text-slate-500">No enrolled students yet.</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {assignments.filter(a => a.course_id === courseId).map((assignment) => (
               <Link 
                to={`/assignments/${assignment.id}`}
                key={assignment.id} 
                className="block bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary/50 transition-all hover:shadow-lg group shadow-sm"
               >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
                        <FileCheck size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">{assignment.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="flex items-center gap-1 text-xs text-slate-500">
                             <Clock size={12} />
                             Due {new Date(assignment.due_date).toLocaleDateString()}
                           </span>
                           <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                           <span className="text-xs font-bold text-primary uppercase">{assignment.upload_tier}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-400 font-bold uppercase">Status</p>
                        <p className="text-sm font-bold text-warning">Pending Submission</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                  {(user.role === 'lecturer' || user.role === 'admin') && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditAssignmentId(assignment.id);
                          setEditAssignmentTitle(assignment.title);
                          setEditAssignmentDueDate(new Date(assignment.due_date).toISOString().slice(0, 16));
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async (e) => {
                          e.preventDefault();
                          await deleteAssignment(assignment.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
               </Link>
            ))}
            {(user.role === 'lecturer' || user.role === 'admin') && editAssignmentId && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black">Edit Assignment</h4>
                <input
                  value={editAssignmentTitle}
                  onChange={(e) => setEditAssignmentTitle(e.target.value)}
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full"
                  placeholder="Assignment title"
                />
                <input
                  type="datetime-local"
                  value={editAssignmentDueDate}
                  onChange={(e) => setEditAssignmentDueDate(e.target.value)}
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 w-full"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      await updateAssignment(editAssignmentId, {
                        title: editAssignmentTitle,
                        due_date: new Date(editAssignmentDueDate).toISOString(),
                      });
                      setEditAssignmentId('');
                    }}
                  >
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditAssignmentId('')}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'grades' && (
           <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Component</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Grade</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[1, 2].map(i => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-700 underline underline-offset-4 decoration-primary/20">Quiz {i}</td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-bold text-slate-900">85/100</span>
                        <p className="text-[10px] text-success font-bold uppercase mt-1">Excellent</p>
                      </td>
                      <td className="px-6 py-5 text-right font-medium text-slate-500">10%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        )}
      </div>
    </div>
  );
}
