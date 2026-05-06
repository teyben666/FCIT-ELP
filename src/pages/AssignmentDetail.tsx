import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, FileText, Clock, AlertCircle, CheckCircle2, ChevronLeft, Upload, File, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppData } from '../context/AppDataContext';
import { Button } from '../components/ui/Button';
import { submitAssignment } from '../lib/api';

export default function AssignmentDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const {assignments, refresh} = useAppData();
  const assignment = assignments.find(a => a.id === assignmentId);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  if (!assignment) return <div>Assignment not found</div>;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startUpload = () => {
    setIsSubmitting(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(async () => {
          if (selectedFile && assignmentId) {
            await submitAssignment(assignmentId, {
              files: [
                {
                  name: selectedFile.name,
                  url: `/uploads/${selectedFile.name}`,
                  size_bytes: selectedFile.size,
                },
              ],
            });
            await refresh();
          }
          setIsSubmitting(false);
          setIsSubmitted(true);
          setShowConfirmation(false);
        }, 500);
      }
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Course</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <header>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Assignment</span>
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Clock size={12} />
                Due Tomorrow
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {assignment.title}
            </h1>
          </header>

          <section className="bg-white p-8 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Description
            </h3>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
              <p>{assignment.description}</p>
              <p className="mt-4">Please ensure your submission follows these guidelines:</p>
              <ul className="list-disc ml-5 mt-2 space-y-2">
                <li>Include all source files in a single archive or PDF.</li>
                <li>Write your name and student ID clearly on the first page.</li>
                <li>Cite any external resources used in your research.</li>
              </ul>
            </div>
          </section>

          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
             <AlertCircle className="text-primary shrink-0" />
             <div>
                <h4 className="font-bold text-slate-900">Submission Guidelines</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Your file must be less than <strong>{assignment.max_file_size_mb}MB</strong>. 
                  {assignment.allow_late_submission 
                    ? ` Late submissions are allowed but incur a ${assignment.late_penalty_per_day}% penalty per day.`
                    : " Late submissions will not be accepted."}
                </p>
             </div>
          </section>
        </div>

        {/* Right Column: Submission Widget */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
            <h3 className="font-bold text-lg mb-6">Submission Status</h3>
            
            {isSubmitted ? (
               <div className="text-center py-6">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="font-bold text-xl text-slate-900">Submitted!</h4>
                  <p className="text-slate-500 text-sm mt-2">Received on May 6, 2:30 PM</p>
                  <Button variant="outline" className="w-full mt-6" onClick={() => setIsSubmitted(false)}>
                    Resubmit
                  </Button>
               </div>
            ) : (
              <div className="space-y-6">
                {!selectedFile ? (
                  <label className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                    <InputFile hidden onChange={handleFileChange} />
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                      <Upload size={24} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-700">Click to upload</p>
                      <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-2">Max {assignment.max_file_size_mb}MB</p>
                  </label>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                     <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                         <File size={20} />
                       </div>
                       <div className="overflow-hidden">
                         <p className="text-sm font-bold text-slate-700 truncate">{selectedFile.name}</p>
                         <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                       </div>
                     </div>
                     <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-danger p-1">
                        <X size={18} />
                     </button>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  disabled={!selectedFile}
                  onClick={() => setShowConfirmation(true)}
                >
                  Submit Assignment
                </Button>
                
                <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                     <Calendar size={14} />
                   </div>
                   <div>
                     <p className="text-xs text-slate-400 uppercase font-bold">Deadline</p>
                     <p className="text-sm font-bold text-slate-700">June 1, 23:59</p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowConfirmation(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to submit?</h3>
              <p className="text-slate-500 mb-8">
                You are about to submit <strong>{selectedFile?.name}</strong>. Please ensure this is the final version.
              </p>

              {isSubmitting ? (
                <div className="space-y-4">
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                   </div>
                   <p className="text-center text-sm font-bold text-primary">{uploadProgress}% Uploading...</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowConfirmation(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={startUpload}>Yes, Submit</Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const InputFile = ({ ...props }) => (
  <input type="file" {...props} />
);
