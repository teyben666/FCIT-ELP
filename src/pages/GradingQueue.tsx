import React from 'react';
import { 
  Clock, 
  Search, 
  Filter,
  FileText,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getSubmissions, gradeSubmission } from '../lib/api';
import { Submission } from '../types';

export default function GradingQueue() {
  const [search, setSearch] = React.useState('');
  const [items, setItems] = React.useState<Submission[]>([]);

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await getSubmissions();
        if (active) {
          setItems(response);
        }
      } catch {
        if (active) {
          setItems([]);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = items.filter((s) => {
    const text = `${s.student_name || ''} ${s.assignment_title || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Grading Queue</h2>
          <p className="text-slate-500 font-medium mt-1">Review and provide feedback on student submissions.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search students..."
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none w-64 transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <Button variant="outline" className="rounded-2xl h-12 w-12 px-0">
              <Filter size={20} />
           </Button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Submission</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-primary/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.student_name || 'student'}`} alt="" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-800">{s.student_name || 'Unknown Student'}</p>
                          <p className="text-xs text-slate-400 font-medium">B.A. Graphic Design</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 text-slate-600">
                       <FileText size={18} className="text-slate-300" />
                       <p className="text-sm font-medium">{s.files[0]?.name || s.assignment_title || 'Submission file'}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold flex items-center gap-1">
                       <Clock size={10} /> {new Date(s.submitted_at).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {typeof s.grade !== 'number' ? (
                       <span className="bg-warning/10 text-warning text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-warning/10">Pending</span>
                    ) : (
                       <div className="flex flex-col items-center">
                          <span className="bg-success/10 text-success text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-success/10">Graded</span>
                          <p className="text-xs font-bold text-slate-900 mt-1">{s.grade}/100</p>
                       </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button
                      variant={typeof s.grade !== 'number' ? 'primary' : 'outline'}
                      size="sm"
                      className="rounded-xl font-bold"
                      onClick={async () => {
                        await gradeSubmission(s.id, 85, 'Good work, keep improving structure.');
                        const response = await getSubmissions();
                        setItems(response);
                      }}
                    >
                       {typeof s.grade !== 'number' ? 'Grade Now' : 'Edit Grade'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
