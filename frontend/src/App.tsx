import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  AlertCircle, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  ChevronRight,
  Clock,
  ShieldCheck,
  MoreVertical,
  MessageSquare,
  History,
  ArrowRight,
  X,
  User,
  Bell,
  Check,
  Calendar as CalendarIcon,
  FileText,
  Activity,
  FileDown
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuthStore } from './store/authStore';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-zinc-900 text-white shadow-lg' 
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const Badge = ({ children, variant = 'neutral' }: any) => {
  const variants: any = {
    neutral: 'bg-zinc-100 text-zinc-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    info: 'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
};

const FileUpload = ({ onUpload, label }: any) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string, file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</label>
      <input 
        type="file" 
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer"
      />
    </div>
  );
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  'ACTIVE': ['IN_PROGRESS', 'CODING'],
  'IN_PROGRESS': ['ACTIVE', 'CODING', 'COMPLETED', 'BLOCKED'],
  'CODING': ['IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
  'COMPLETED': ['IN_PROGRESS'],
  'BLOCKED': ['ACTIVE', 'IN_PROGRESS', 'CODING']
};

const TaskModal = ({ task, onClose, onStatusChange, token, user, onReportIssue, onEdit, onDelete, onLogWork }: any) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [workLogs, setWorkLogs] = useState([]);
  const isQA = user.role === 'QA';
  const isAdmin = user.role === 'ADMIN';
  const canEditOrDelete = user.id === task.creator_id || user.role === 'PROJECT_MANAGER' || isAdmin;

  useEffect(() => {
    if (task) {
      fetchComments();
      fetchWorkLogs();
    }
  }, [task]);

  const fetchComments = async () => {
    const res = await fetch(`/api/comments/task/${task.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setComments(data);
  };

  const fetchWorkLogs = async () => {
    const res = await fetch(`/api/work-logs?taskId=${task.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setWorkLogs(data);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ target_type: 'TASK', target_id: task.id, content: newComment })
    });
    if (res.ok) {
      setNewComment('');
      fetchComments();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={task.priority === 'CRITICAL' ? 'danger' : 'neutral'}>{task.priority}</Badge>
            <Badge variant="info">{task.type}</Badge>
            <h3 className="text-xl font-bold tracking-tight">{task.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {canEditOrDelete && (
              <>
                <button onClick={() => onEdit(task)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-zinc-900 transition-colors">
                  <Settings size={18} />
                </button>
                <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-rose-600 transition-colors">
                  <LogOut size={18} className="rotate-180" />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <section>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Description</h4>
              <p className="text-zinc-600 leading-relaxed text-sm">{task.description || 'No description provided.'}</p>
            </section>
            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Creator</h4>
                  <p className="text-sm font-semibold">{task.creator_name || 'System'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Assignee</h4>
                  <p className="text-sm font-semibold">{task.assignee_name || 'Unassigned'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Time Tracking</h4>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Estimated: {task.estimated_hours || 0}h</p>
                    <p className="text-sm font-semibold">Logged: {task.actual_hours || 0}h</p>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-zinc-900 h-full transition-all duration-500" 
                        style={{ width: `${Math.min((task.actual_hours / (task.estimated_hours || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <button 
                    onClick={() => onLogWork(task)}
                    className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Clock size={14} /> Log Work
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Start Date</h4>
                  <p className="text-sm font-mono">{task.start_date || 'Not set'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">End Date</h4>
                  <p className="text-sm font-mono">{task.end_date || 'Not set'}</p>
                </div>
              </div>
            </section>
          </div>

          {task.code_snippet && (
            <section>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Code Snippet</h4>
              <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-xs overflow-x-auto font-mono">
                {task.code_snippet}
              </pre>
            </section>
          )}

          {task.attachment_url && (
            <section>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Attachment</h4>
              {task.attachment_type === 'VIDEO' ? (
                <video src={task.attachment_url} controls className="rounded-xl border border-zinc-200 w-full max-h-96" />
              ) : (
                <img src={task.attachment_url} alt="Task attachment" className="rounded-xl border border-zinc-200 w-full max-h-96 object-contain" />
              )}
            </section>
          )}

          {!isQA && (
            <section>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Workflow Transitions</h4>
              <div className="flex flex-wrap gap-2">
                {VALID_TRANSITIONS[task.status]?.map(status => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(task.id, status)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-900 hover:text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    Move to {status.replace('_', ' ')}
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </section>
          )}

          {isQA && task.status === 'COMPLETED' && (
            <section className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-indigo-900">Quality Assurance</h4>
                  <p className="text-xs text-indigo-600">This task is completed. You can report issues if found.</p>
                </div>
                <button 
                  onClick={() => onReportIssue(task)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  Report Issue
                </button>
              </div>
            </section>
          )}

          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Comments</h4>
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all text-sm resize-none h-24"
              />
              <div className="flex justify-end mt-2">
                <button className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-semibold">Post Comment</button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {c.author_name[0]}
                  </div>
                  <div className="flex-1 bg-zinc-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{c.author_name}</span>
                      <span className="text-[10px] text-zinc-400">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-zinc-600">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EditIssueModal = ({ issue, onClose, onUpdate }: any) => {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description || '');
  const [severity, setSeverity] = useState(issue.severity);
  const [attachmentUrl, setAttachmentUrl] = useState(issue.attachment_url || '');
  const [attachmentType, setAttachmentType] = useState(issue.attachment_type || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(issue.id, { title, description, severity, attachment_url: attachmentUrl, attachment_type: attachmentType });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Edit Issue</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Severity</label>
            <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-32 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FileUpload label="Update Attachment" onUpload={(url: string, type: string) => { setAttachmentUrl(url); setAttachmentType(type); }} />
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Attachment URL</label>
              <input value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">Save Changes</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CreateTaskModal = ({ onClose, onCreate, projects, users, userRole, initialProjectId }: any) => {
  const [projectId, setProjectId] = useState(initialProjectId || projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('TASK');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('ACTIVE');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      project_id: projectId,
      title,
      description,
      type,
      priority,
      status,
      code_snippet: codeSnippet,
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      start_date: startDate,
      end_date: endDate,
      estimated_hours: Number(estimatedHours) || 0,
      assignee_id: userRole === 'PROJECT_MANAGER' ? (assigneeId || null) : null
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Create New Task</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Project</label>
              <select 
                required 
                value={projectId} 
                onChange={e => setProjectId(e.target.value)} 
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="">Select a Project</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
            {userRole === 'PROJECT_MANAGER' && (
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Assign To (Developer)</label>
                <select 
                  value={assigneeId} 
                  onChange={e => setAssigneeId(e.target.value)} 
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="">Unassigned</option>
                  {users.filter((u: any) => u.role === 'DEVELOPER' || u.role === 'MOBILE_APP_DEVELOPER').map((u: any) => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900">
                <option value="FEATURE">New Feature</option>
                <option value="TASK">New Task</option>
                <option value="FIX">Fixing</option>
                <option value="ENHANCEMENT">Enhancement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900">
                <option value="ACTIVE">Active</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CODING">Coding</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 col-span-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Estimated Hours</label>
              <input type="number" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" placeholder="e.g. 8" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-24 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Code Snippet (Optional)</label>
            <textarea value={codeSnippet} onChange={e => setCodeSnippet(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-32 font-mono text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FileUpload 
              label="Upload Image or Video" 
              onUpload={(url: string, type: string) => {
                setAttachmentUrl(url);
                setAttachmentType(type);
              }} 
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Or Attachment URL</label>
              <input value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" placeholder="https://example.com/asset" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
              Create Task
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const EditTaskModal = ({ task, onClose, onUpdate, users, userRole }: any) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [type, setType] = useState(task.type);
  const [priority, setPriority] = useState(task.priority);
  const [codeSnippet, setCodeSnippet] = useState(task.code_snippet || '');
  const [attachmentUrl, setAttachmentUrl] = useState(task.attachment_url || '');
  const [attachmentType, setAttachmentType] = useState(task.attachment_type || '');
  const [startDate, setStartDate] = useState(task.start_date || '');
  const [endDate, setEndDate] = useState(task.end_date || '');
  const [assigneeId, setAssigneeId] = useState(task.assignee_id || '');
  const [estimatedHours, setEstimatedHours] = useState(task.estimated_hours || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(task.id, {
      title, description, type, priority, code_snippet: codeSnippet,
      attachment_url: attachmentUrl, attachment_type: attachmentType,
      start_date: startDate, end_date: endDate,
      estimated_hours: Number(estimatedHours) || 0,
      assignee_id: userRole === 'PROJECT_MANAGER' ? (assigneeId || null) : task.assignee_id
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Edit Task</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
            {userRole === 'PROJECT_MANAGER' && (
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Assign To (Developer)</label>
                <select 
                  value={assigneeId} 
                  onChange={e => setAssigneeId(e.target.value)} 
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="">Unassigned</option>
                  {users.filter((u: any) => u.role === 'DEVELOPER' || u.role === 'MOBILE_APP_DEVELOPER').map((u: any) => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900">
                <option value="FEATURE">New Feature</option>
                <option value="TASK">New Task</option>
                <option value="FIX">Fixing</option>
                <option value="ENHANCEMENT">Enhancement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Estimated Hours</label>
              <input type="number" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" placeholder="e.g. 8" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-24 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Code Snippet</label>
            <textarea value={codeSnippet} onChange={e => setCodeSnippet(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-32 font-mono text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FileUpload label="Update Attachment" onUpload={(url: string, type: string) => { setAttachmentUrl(url); setAttachmentType(type); }} />
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Attachment URL</label>
              <input value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">Save Changes</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CreateProjectModal = ({ onClose, onCreate }: any) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [features, setFeatures] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ name, description, start_date: startDate, end_date: endDate, features });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Create New Project</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Project Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" placeholder="Enter project name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Features List (Comma separated)</label>
            <textarea value={features} onChange={e => setFeatures(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-24 resize-none" placeholder="Feature 1, Feature 2, Feature 3..." />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-32 resize-none" placeholder="What is this project about?" />
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">Create Project</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const EditProjectModal = ({ project, onClose, onUpdate }: any) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState(project.status);
  const [startDate, setStartDate] = useState(project.start_date || '');
  const [endDate, setEndDate] = useState(project.end_date || '');
  const [features, setFeatures] = useState(project.features || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(project.id, { name, description, status, start_date: startDate, end_date: endDate, features });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Edit Project</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Project Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900">
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Features List</label>
            <textarea value={features} onChange={e => setFeatures(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-24 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-32 resize-none" />
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">Save Changes</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ProjectDetailsModal = ({ project, onClose }: any) => {
  const features = project.features ? project.features.split(',').map((f: string) => f.trim()) : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-bold text-xl">{project.name[0]}</div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{project.name}</h3>
              <Badge variant="success">{project.status}</Badge>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Start Date</p>
              <p className="font-semibold">{project.start_date || 'Not set'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">End Date</p>
              <p className="font-semibold">{project.end_date || 'Not set'}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Features List</p>
            <div className="flex flex-wrap gap-2">
              {features.length > 0 ? features.map((feature: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-zinc-100 rounded-lg text-sm font-medium text-zinc-700">{feature}</span>
              )) : <p className="text-zinc-500 italic">No features listed</p>}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Description</p>
            <p className="text-zinc-600 leading-relaxed">{project.description || 'No description provided'}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const IssueModal = ({ issue, onClose, onStatusChange, token, user, onEdit, onDelete }: any) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const canUpdateStatus = user.role === 'DEVELOPER' || user.role === 'MOBILE_APP_DEVELOPER' || user.role === 'PROJECT_MANAGER' || user.role === 'QA' || user.role === 'ADMIN';
  const canEditOrDelete = user.id === issue.reporter_id || user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN';

  useEffect(() => {
    if (issue) fetchComments();
  }, [issue]);

  const fetchComments = async () => {
    const res = await fetch(`/api/comments/issue/${issue.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setComments(data);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ target_type: 'ISSUE', target_id: issue.id, content: newComment })
    });
    if (res.ok) {
      setNewComment('');
      fetchComments();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="danger">{issue.severity}</Badge>
            <Badge variant="neutral">{issue.status}</Badge>
            <h3 className="text-xl font-bold tracking-tight">{issue.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {canEditOrDelete && (
              <>
                <button onClick={() => onEdit(issue)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-zinc-900 transition-colors">
                  <Settings size={18} />
                </button>
                <button onClick={() => onDelete(issue.id)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-rose-600 transition-colors">
                  <LogOut size={18} className="rotate-180" />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <section>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Description</h4>
              <p className="text-zinc-600 leading-relaxed text-sm">{issue.description || 'No description provided.'}</p>
            </section>
            <section className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Reporter</h4>
                <p className="text-sm font-semibold">{issue.reporter_name}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Related Task</h4>
                <p className="text-sm font-semibold">{issue.task_title || 'None'}</p>
              </div>
            </section>
          </div>

          {issue.attachment_url && (
            <section>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Attachment</h4>
              {issue.attachment_type === 'VIDEO' ? (
                <video src={issue.attachment_url} controls className="rounded-xl border border-zinc-200 w-full max-h-96" />
              ) : (
                <img src={issue.attachment_url} alt="Issue attachment" className="rounded-xl border border-zinc-200 w-full max-h-96 object-contain" />
              )}
            </section>
          )}

          {canUpdateStatus && (
            <section>
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {['OPEN', 'IN_PROGRESS', 'FIXED', 'CLOSED'].filter(s => s !== issue.status).map(status => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(issue.id, status)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-900 hover:text-white rounded-xl text-sm font-semibold transition-all"
                  >
                    Mark as {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Comments</h4>
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:bg-white outline-none transition-all text-sm resize-none h-24"
              />
              <div className="flex justify-end mt-2">
                <button className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-semibold">Post Comment</button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {c.author_name[0]}
                  </div>
                  <div className="flex-1 bg-zinc-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{c.author_name}</span>
                      <span className="text-[10px] text-zinc-400">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-zinc-600">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProfileView = ({ user, token, onUpdate }: any) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState(user.bio || '');
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          password: password || undefined,
          bio,
          profile_picture: profilePicture
        })
      });
      if (res.ok) {
        onUpdate();
        setPassword('');
        toast.success('Profile updated successfully');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-8 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-zinc-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-zinc-300" />
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
            <FileUpload label="" onUpload={(url: string) => setProfilePicture(url)} />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight mb-1">{user.fullName}</h2>
          <p className="text-zinc-500 font-medium mb-4">{user.role.replace('_', ' ')} • {user.email}</p>
          <div className="flex gap-2">
            <Badge variant="info">Active Member</Badge>
            <Badge variant="neutral">Enterprise Tier</Badge>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold mb-4">Personal Information</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Email Address (Read-only)</label>
            <input value={user.email} disabled className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Role (Read-only)</label>
            <input value={user.role} disabled className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold mb-4">Security & Bio</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-32 resize-none" placeholder="Tell us about yourself..." />
          </div>
          <div className="pt-4">
            <button disabled={isSaving} type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200 disabled:opacity-50">
              {isSaving ? 'Saving Changes...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

const WorkLogModal = ({ task, onClose, onLog }: any) => {
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLog({
      task_id: task.id,
      hours: Number(hours),
      description,
      log_date: logDate
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold tracking-tight">Log Work for #{task.id}</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Hours Spent</label>
            <input required type="number" step="0.5" value={hours} onChange={e => setHours(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" placeholder="e.g. 2.5" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Date</label>
            <input required type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-24 resize-none" placeholder="What did you do?" />
          </div>
          <button type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">Log Work</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const MeetingNoteModal = ({ onClose, onSave, initialDate }: any) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [meetingDate, setMeetingDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content, meeting_date: meetingDate });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold tracking-tight">New Meeting Note</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" placeholder="Meeting Title" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Date</label>
            <input required type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Content</label>
            <textarea required value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-48 resize-none" placeholder="Meeting minutes, action items..." />
          </div>
          <button type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">Save Note</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const DailyActivityModal = ({ onClose, onSave }: any) => {
  const [content, setContent] = useState('');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ content, activity_date: activityDate });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold tracking-tight">Daily Work Activity Log</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Date</label>
            <input required type="date" value={activityDate} onChange={e => setActivityDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">What did you achieve today?</label>
            <textarea required value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-48 resize-none" placeholder="Describe your daily activities, progress, and blockers..." />
          </div>
          <button type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">Submit Daily Log</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ReportIssueModal = ({ task: initialTask, onClose, onReport, token, projects, tasks: allTasks, currentProjectId }: any) => {
  const [selectedProjectId, setSelectedProjectId] = useState(initialTask?.project_id || currentProjectId || projects[0]?.id || '');
  const [selectedTaskId, setSelectedTaskId] = useState(initialTask?.id || '');
  const [title, setTitle] = useState(initialTask ? `Issue in: ${initialTask.title}` : '');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState('');

  const projectTasks = allTasks.filter((t: any) => t.project_id === Number(selectedProjectId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReport({
      project_id: selectedProjectId,
      task_id: selectedTaskId || null,
      title,
      description,
      severity,
      attachment_url: attachmentUrl,
      attachment_type: attachmentType
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Report Issue</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Project</label>
              <select 
                value={selectedProjectId} 
                onChange={e => {
                  setSelectedProjectId(e.target.value);
                  setSelectedTaskId('');
                }}
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900"
                disabled={!!initialTask}
              >
                <option value="">Select Project</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Task (Optional)</label>
              <select 
                value={selectedTaskId} 
                onChange={e => setSelectedTaskId(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900"
                disabled={!!initialTask}
              >
                <option value="">Select Task</option>
                {projectTasks.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Issue Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" placeholder="Brief summary of the issue" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Severity</label>
              <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Description</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 h-32 resize-none" placeholder="Steps to reproduce, expected vs actual result..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FileUpload 
              label="Upload Evidence" 
              onUpload={(url: string, type: string) => {
                setAttachmentUrl(url);
                setAttachmentType(type);
              }} 
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Or Attachment URL</label>
              <input value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900" placeholder="https://example.com/asset" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors">
              Submit Report
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const DailyActivityView = ({ activities, onAddActivity }: any) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daily Activity Logs</h2>
          <p className="text-zinc-500">Track your daily progress and achievements.</p>
        </div>
        <button 
          onClick={onAddActivity}
          className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
        >
          <Plus size={20} /> Log Daily Activity
        </button>
      </div>

      <div className="grid gap-6">
        {activities.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-zinc-200 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
              <Activity size={32} />
            </div>
            <h3 className="text-lg font-bold">No activities logged yet</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">Start logging your daily work to keep track of your progress and share updates with the team.</p>
          </div>
        ) : (
          activities.map((activity: any) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={activity.id} 
              className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold">
                    {activity.user_name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold">{activity.user_name}</h4>
                    <p className="text-xs text-zinc-400 font-mono">{activity.activity_date}</p>
                  </div>
                </div>
                <Badge variant="info">Daily Log</Badge>
              </div>
              <div className="prose prose-zinc max-w-none">
                <p className="text-zinc-600 whitespace-pre-wrap leading-relaxed">{activity.content}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const CalendarView = ({ meetingNotes, onAddNote }: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const notesForSelectedDate = meetingNotes.filter((note: any) => {
    const noteDate = new Date(note.meeting_date).toDateString();
    return noteDate === selectedDate.toDateString();
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meeting Calendar</h2>
          <p className="text-zinc-500">Manage your schedules and meeting notes.</p>
        </div>
        <button 
          onClick={() => onAddNote(selectedDate.toISOString().split('T')[0])}
          className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
        >
          <Plus size={20} /> New Meeting Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <Calendar 
              onChange={(val: any) => setSelectedDate(val)} 
              value={selectedDate}
              className="w-full border-none font-sans"
              tileClassName={({ date }) => {
                const hasNote = meetingNotes.some((n: any) => new Date(n.meeting_date).toDateString() === date.toDateString());
                return hasNote ? 'bg-zinc-900 text-white rounded-full' : '';
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Notes for {selectedDate.toLocaleDateString()}</h3>
            <Badge variant="neutral">{notesForSelectedDate.length} Notes</Badge>
          </div>

          {notesForSelectedDate.length === 0 ? (
            <div className="bg-zinc-50 p-12 rounded-3xl border border-zinc-200 border-dashed text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-zinc-300 border border-zinc-200">
                <FileText size={24} />
              </div>
              <p className="text-zinc-500 text-sm">No meeting notes for this date.</p>
            </div>
          ) : (
            notesForSelectedDate.map((note: any) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={note.id} 
                className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold mb-1">{note.title}</h4>
                    <p className="text-xs text-zinc-400">By {note.author_name} • {new Date(note.created_at).toLocaleTimeString()}</p>
                  </div>
                  <Badge variant="success">Meeting</Badge>
                </div>
                <p className="text-zinc-600 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const KanbanColumn = ({ title, tasks, onTaskClick, onStatusChange, user }: any) => {
  return (
    <div className="flex-1 min-w-[300px] bg-zinc-50/50 rounded-xl p-4 border border-zinc-200/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">{title}</h3>
        <span className="text-[10px] font-mono bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-600">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task: any) => (
          <motion.div
            layoutId={task.id}
            key={task.id}
            className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
          >
            <div className="flex justify-between items-start mb-2">
              <Badge variant={task.priority === 'CRITICAL' ? 'danger' : task.priority === 'HIGH' ? 'warning' : 'neutral'}>
                {task.priority}
              </Badge>
              <div className="flex items-center gap-1">
                {user.role !== 'QA' && (
                  <select 
                    value={task.status} 
                    onChange={(e) => {
                      e.stopPropagation();
                      onStatusChange(task.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-bold bg-zinc-100 border-none rounded px-1 py-0.5 outline-none cursor-pointer hover:bg-zinc-200"
                  >
                    <option key="current" value={task.status}>{task.status.replace('_', ' ')}</option>
                    {VALID_TRANSITIONS[task.status]?.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                )}
                <button onClick={(e) => { e.stopPropagation(); onTaskClick(task); }} className="p-1 hover:bg-zinc-100 rounded">
                  <ArrowRight size={12} className="text-zinc-400" />
                </button>
              </div>
            </div>
            <div onClick={() => onTaskClick(task)}>
              <h4 className="text-sm font-semibold text-zinc-900 mb-1">{task.title}</h4>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{task.description}</p>
              
              {(task.start_date || task.end_date) && (
                <div className="flex items-center gap-3 mb-3 text-[10px] text-zinc-400 font-mono">
                  {task.start_date && <span className="flex items-center gap-1"><Clock size={10} /> {task.start_date}</span>}
                  {task.end_date && <span className="flex items-center gap-1">→ {task.end_date}</span>}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <MessageSquare size={12} className="text-zinc-400" />
                  <span className="text-[10px] text-zinc-400">3</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold border border-white">
                    {task.assignee_name?.[0] || '?'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { user, logout, token, setAuth } = useAuthStore();
  const safeUserName = user?.fullName?.trim() || user?.email || 'User';
  const safeUserInitials = safeUserName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [isRegistering, setIsRegistering] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [reportingTask, setReportingTask] = useState<any>(null);
  const [isEditingTask, setIsEditingTask] = useState<any>(null);
  const [isEditingIssue, setIsEditingIssue] = useState<any>(null);
  const [isEditingProject, setIsEditingProject] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState([]);
  const [dailyActivities, setDailyActivities] = useState([]);
  const [isLoggingWork, setIsLoggingWork] = useState<any>(null);
  const [isAddingMeetingNote, setIsAddingMeetingNote] = useState<any>(null);
  const [isAddingDailyActivity, setIsAddingDailyActivity] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && token) {
      fetchProjects();
      fetchUsers();
      fetchNotifications();
      fetchMeetingNotes();
      fetchDailyActivities();
      if (user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') fetchAuditLogs();

      // Poll for notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;
    const res = await fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setNotifications(data);
    }
  };

  const markNotificationAsRead = async (id: number) => {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchNotifications();
    }
  };

  const clearNotifications = async () => {
    const res = await fetch('/api/notifications/clear', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (currentProjectId) {
      fetchTasks(currentProjectId);
      fetchIssues(currentProjectId);
    }
  }, [currentProjectId]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      setUsers([]);
      return;
    }
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  const fetchProjects = async () => {
    const res = await fetch('/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      setProjects([]);
      return;
    }
    const data = await res.json();
    const projectsData = Array.isArray(data) ? data : [];
    setProjects(projectsData);
    if (projectsData.length > 0 && !currentProjectId) {
      setCurrentProjectId(projectsData[0].id);
    }
  };

  const fetchMeetingNotes = async () => {
    const res = await fetch('/api/meeting-notes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setMeetingNotes(data);
    }
  };

  const fetchDailyActivities = async () => {
    const res = await fetch('/api/daily-activities', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setDailyActivities(data);
    }
  };

  const handleLogWork = async (logData: any) => {
    const res = await fetch('/api/work-logs', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(logData)
    });
    if (res.ok) {
      toast.success('Work logged successfully');
      setIsLoggingWork(null);
      if (currentProjectId) fetchTasks(currentProjectId);
      if (selectedTask) {
        // Update selected task actual hours locally or refetch
        const updatedTask = await (await fetch(`/api/tasks/${selectedTask.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })).json();
        setSelectedTask(updatedTask);
      }
    } else {
      toast.error('Failed to log work');
    }
  };

  const handleSaveMeetingNote = async (noteData: any) => {
    const res = await fetch('/api/meeting-notes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(noteData)
    });
    if (res.ok) {
      toast.success('Meeting note saved');
      setIsAddingMeetingNote(null);
      fetchMeetingNotes();
    } else {
      toast.error('Failed to save meeting note');
    }
  };

  const handleSaveDailyActivity = async (activityData: any) => {
    const res = await fetch('/api/daily-activities', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(activityData)
    });
    if (res.ok) {
      toast.success('Activity logged successfully');
      setIsAddingDailyActivity(false);
      fetchDailyActivities();
    } else {
      toast.error('Failed to log activity');
    }
  };

  const fetchTasks = async (projectId: number) => {
    const res = await fetch(`/api/tasks?projectId=${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      setTasks([]);
      return;
    }
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  };

  const fetchIssues = async (projectId: number) => {
    const res = await fetch(`/api/issues?projectId=${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      setIssues([]);
      return;
    }
    const data = await res.json();
    setIssues(Array.isArray(data) ? data : []);
  };

  const fetchAuditLogs = async () => {
    const res = await fetch('/api/audit', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      setAuditLogs([]);
      return;
    }
    const data = await res.json();
    setAuditLogs(Array.isArray(data) ? data : []);
  };

  const handleUpdateProject = async (projectId: number, projectData: any) => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    });
    if (res.ok) {
      fetchProjects();
      setIsEditingProject(null);
      toast.success('Project updated successfully');
    } else {
      const data = await res.json();
      toast.error(data.message || 'Failed to update project');
    }
  };

  const handleCreateProject = async (projectData: any) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    });
    if (res.ok) {
      setIsCreateProjectOpen(false);
      fetchProjects();
      toast.success('Project created successfully');
    } else {
      const data = await res.json();
      toast.error(data.message || 'Failed to create project');
    }
  };

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAuth(data, token!);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    const res = await fetch(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      setSelectedTask(null);
      if (currentProjectId) fetchTasks(currentProjectId);
      if (user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') fetchAuditLogs();
      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}`);
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to update status");
    }
  };

  const handleUpdateTask = async (taskId: number, taskData: any) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });
    if (res.ok) {
      if (currentProjectId) fetchTasks(currentProjectId);
      setIsEditingTask(null);
      setSelectedTask(null);
      toast.success('Task updated successfully');
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      if (currentProjectId) fetchTasks(currentProjectId);
      setSelectedTask(null);
      toast.success('Task deleted successfully');
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to delete task");
    }
  };

  const handleIssueStatusChange = async (issueId: number, newStatus: string) => {
    const res = await fetch(`/api/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      setSelectedIssue(null);
      if (currentProjectId) fetchIssues(currentProjectId);
      toast.success(`Issue status updated to ${newStatus.replace('_', ' ')}`);
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to update status");
    }
  };

  const handleUpdateIssue = async (issueId: number, issueData: any) => {
    const res = await fetch(`/api/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(issueData)
    });
    if (res.ok) {
      if (currentProjectId) fetchIssues(currentProjectId);
      setIsEditingIssue(null);
      setSelectedIssue(null);
      toast.success('Issue updated successfully');
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to update issue");
    }
  };

  const handleDeleteIssue = async (issueId: number) => {
    if (!confirm("Are you sure you want to delete this issue?")) return;
    const res = await fetch(`/api/issues/${issueId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      if (currentProjectId) fetchIssues(currentProjectId);
      setSelectedIssue(null);
      toast.success('Issue deleted successfully');
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to delete issue");
    }
  };

  const handleCreateTask = async (taskData: any) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });
    if (res.ok) {
      setIsCreateTaskOpen(false);
      if (currentProjectId) fetchTasks(currentProjectId);
      toast.success('Task created successfully');
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to create task");
    }
  };

  const handleReportIssue = async (issueData: any) => {
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...issueData, project_id: issueData.project_id || currentProjectId })
    });
    if (res.ok) {
      setReportingTask(null);
      setSelectedTask(null);
      if (currentProjectId) fetchIssues(currentProjectId);
      toast.success('Issue reported successfully');
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to report issue");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.fullName || data.user.email || 'User'}!`);
    } else {
      const data = await res.json();
      toast.error(data.message || "Login failed. Please check your credentials.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, role })
    });
    if (res.ok) {
      toast.success('Registration successful! Please sign in.');
      setIsRegistering(false); // Redirect to login view
      setPassword(''); // Clear password for security
    } else {
      const data = await res.json();
      toast.error(data.message || "Registration failed");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
        <Toaster position="top-center" richColors />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200 p-8"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-black text-xl italic tracking-tighter">
              KIT
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Kit Project Tool</h1>
          </div>
          <h2 className="text-xl font-semibold mb-2">{isRegistering ? 'Create Account' : 'Welcome back'}</h2>
          <p className="text-zinc-500 text-sm mb-8">{isRegistering ? 'Join the enterprise project management system.' : 'Sign in to manage your enterprise projects.'}</p>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                  >
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="DEVELOPER">Developer</option>
                    <option value="MOBILE_APP_DEVELOPER">Mobile App Developer</option>
                    <option value="QA">QA Engineer</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Email Address</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                placeholder="pm@kit.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Password</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <button className="w-full bg-zinc-900 text-white font-semibold py-3 rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">
              {isRegistering ? 'Register' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-zinc-900">
      <Toaster position="top-right" richColors />
      <aside className="w-64 border-r border-zinc-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-black text-xs italic tracking-tighter">
            KIT
          </div>
          <span className="font-bold text-lg tracking-tight">Kit</span>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Briefcase} label="Projects" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
          <SidebarItem icon={CheckSquare} label={(user.role === 'QA' || user.role === 'ADMIN') ? "All Tasks" : "My Tasks"} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <SidebarItem icon={AlertCircle} label="Issues" active={activeTab === 'issues'} onClick={() => setActiveTab('issues')} />
          <SidebarItem icon={CalendarIcon} label="Calendar" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          <SidebarItem icon={Activity} label="Activity Logs" active={activeTab === 'activities'} onClick={() => setActiveTab('activities')} />
          <SidebarItem icon={User} label="My Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          {(user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') && (
            <SidebarItem icon={History} label="Audit Logs" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">
              {safeUserInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{safeUserName}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 border-b border-zinc-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tasks, issues, or projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-100 border-transparent focus:bg-white focus:ring-2 focus:ring-zinc-900 rounded-xl text-sm transition-all outline-none" 
              />
            </div>
            <div className="flex items-center gap-2 border-l border-zinc-200 pl-6">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Project:</p>
              <select 
                value={currentProjectId || ''} 
                onChange={(e) => setCurrentProjectId(Number(e.target.value))}
                className="bg-transparent font-bold text-sm outline-none cursor-pointer hover:text-zinc-600 transition-colors"
              >
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-zinc-100 rounded-xl transition-colors relative"
              >
                <Bell size={20} className="text-zinc-600" />
                {notifications.some(n => !n.is_read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Notifications</h4>
                      <button onClick={clearNotifications} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors">Clear All</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n: any) => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer relative ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                n.type === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                              }`}>
                                {n.type === 'WARNING' ? <AlertCircle size={16} /> : <Bell size={16} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-900 mb-0.5">{n.title}</p>
                                <p className="text-xs text-zinc-500 leading-snug">{n.message}</p>
                                <p className="text-[10px] text-zinc-400 mt-2 font-mono">{new Date(n.created_at).toLocaleString()}</p>
                              </div>
                              {!n.is_read && (
                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell size={24} className="mx-auto text-zinc-200 mb-2" />
                          <p className="text-xs text-zinc-400">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user.role !== 'QA' && (
              <button 
                onClick={() => setIsCreateTaskOpen(true)}
                className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
              >
                <Plus size={18} />
                <span>Create New</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1">System Overview</h2>
                    <p className="text-zinc-500">Welcome back, {safeUserName}.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Active Projects', value: projects.length, trend: '+2 this month', icon: Briefcase, color: 'text-indigo-600' },
                    { label: 'Open Tasks', value: tasks.length, trend: '12 due today', icon: CheckSquare, color: 'text-emerald-600' },
                    { label: 'QA Issues', value: issues.length, trend: issues.filter((i: any) => i.severity === 'CRITICAL').length + ' critical', icon: AlertCircle, color: 'text-rose-600' },
                    { label: 'Team Velocity', value: '42sp', trend: '+15% vs last sprint', icon: Users, color: 'text-amber-600' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg bg-zinc-50 ${stat.color}`}><stat.icon size={20} /></div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
                      </div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold">Project Kanban: {projects.find((p: any) => p.id === currentProjectId)?.name || 'Loading...'}</h3>
                  </div>
                  <div className="flex gap-6 min-h-[500px]">
                    <KanbanColumn title="Active" tasks={tasks.filter((t: any) => t.status === 'ACTIVE')} onTaskClick={setSelectedTask} onStatusChange={handleStatusChange} user={user} />
                    <KanbanColumn title="In Progress" tasks={tasks.filter((t: any) => t.status === 'IN_PROGRESS')} onTaskClick={setSelectedTask} onStatusChange={handleStatusChange} user={user} />
                    <KanbanColumn title="Coding" tasks={tasks.filter((t: any) => t.status === 'CODING')} onTaskClick={setSelectedTask} onStatusChange={handleStatusChange} user={user} />
                    <KanbanColumn title="Completed" tasks={tasks.filter((t: any) => t.status === 'COMPLETED')} onTaskClick={setSelectedTask} onStatusChange={handleStatusChange} user={user} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-zinc-500">Manage and oversee all enterprise initiatives.</p>
                  </div>
                  {(user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') && (
                    <button 
                      onClick={() => setIsCreateProjectOpen(true)}
                      className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-zinc-200"
                    >
                      New Project
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {projects.map((project: any) => (
                    <div 
                      key={project.id} 
                      onClick={() => setSelectedProject(project)}
                      className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-zinc-900 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-900 font-bold group-hover:bg-zinc-900 group-hover:text-white transition-colors">{project.name[0]}</div>
                          <div>
                            <h3 className="font-bold text-lg">{project.name}</h3>
                            <p className="text-sm text-zinc-500">{project.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                            <Badge variant="success">{project.status}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Created</p>
                            <p className="text-sm font-mono">{new Date(project.created_at).toLocaleDateString()}</p>
                          </div>
                          {(user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingProject(project);
                              }}
                              className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-900 transition-colors"
                            >
                              <Settings size={18} />
                            </button>
                          )}
                          <ChevronRight className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Task List</h2>
                    <p className="text-zinc-500">Manage and track all tasks in a list view.</p>
                  </div>
                  {(user.role === 'PROJECT_MANAGER' || user.role === 'DEVELOPER' || user.role === 'MOBILE_APP_DEVELOPER' || user.role === 'ADMIN') && (
                    <button 
                      onClick={() => setIsCreateTaskOpen(true)}
                      className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-zinc-200 flex items-center gap-2"
                    >
                      <Plus size={18} /> New Task
                    </button>
                  )}
                </div>
                <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Task</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Priority</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Assignee</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Timeline</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {tasks.filter((t: any) => 
                        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((task: any) => (
                        <tr key={task.id} className="hover:bg-zinc-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{task.title}</span>
                              <span className="text-[10px] text-zinc-400 uppercase font-bold">{task.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.role !== 'QA' ? (
                              <select 
                                value={task.status} 
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="text-xs font-bold bg-zinc-100 border-none rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-zinc-200"
                              >
                                <option value={task.status}>{task.status.replace('_', ' ')}</option>
                                {VALID_TRANSITIONS[task.status]?.map((s: string) => (
                                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                ))}
                              </select>
                            ) : (
                              <Badge variant={task.status === 'COMPLETED' ? 'success' : 'neutral'}>{task.status}</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={task.priority === 'CRITICAL' ? 'danger' : task.priority === 'HIGH' ? 'warning' : 'neutral'}>
                              {task.priority}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-zinc-600">{task.assignee_name || 'Unassigned'}</td>
                          <td className="px-6 py-4 text-[10px] font-mono text-zinc-400">
                            {task.start_date || '-'} {task.end_date ? `→ ${task.end_date}` : ''}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setSelectedTask(task)} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors">
                              <ChevronRight size={18} className="text-zinc-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div key="audit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
                <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Action</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Entity</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Performed By</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Details</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4"><Badge variant={log.action === 'CREATE' ? 'success' : 'info'}>{log.action}</Badge></td>
                          <td className="px-6 py-4 text-sm font-semibold">{log.entity_type} #{log.entity_id}</td>
                          <td className="px-6 py-4 text-sm">{log.user_name}</td>
                          <td className="px-6 py-4 text-sm text-zinc-500">{log.details || '-'}</td>
                          <td className="px-6 py-4 text-sm font-mono text-zinc-400">{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'issues' && (
              <motion.div key="issues" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">QA Issues</h2>
                    <p className="text-zinc-500">Track and manage reported defects.</p>
                  </div>
                  {(user.role === 'QA' || user.role === 'ADMIN') && (
                    <button 
                      onClick={() => setReportingTask({})}
                      className="bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-rose-100 flex items-center gap-2"
                    >
                      <Plus size={18} /> Report New Issue
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {issues.filter((i: any) => 
                    i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    i.description?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((issue: any) => (
                    <div 
                      key={issue.id} 
                      onClick={() => setSelectedIssue(issue)}
                      className="bg-white p-6 rounded-2xl border border-zinc-200 hover:border-rose-500 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                            issue.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {issue.severity[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{issue.title}</h3>
                            <p className="text-sm text-zinc-500">Related to: {issue.task_title || 'General'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Severity</p>
                            <Badge variant={issue.severity === 'CRITICAL' ? 'danger' : 'neutral'}>{issue.severity}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                            <Badge variant={issue.status === 'FIXED' ? 'success' : 'warning'}>{issue.status}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Reporter</p>
                            <p className="text-sm font-semibold">{issue.reporter_name}</p>
                          </div>
                          <ChevronRight className="text-zinc-300 group-hover:text-rose-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {issues.length === 0 && (
                    <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                      <AlertCircle className="mx-auto text-zinc-300 mb-4" size={48} />
                      <p className="text-zinc-500 font-medium">No issues reported yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <ProfileView user={user} token={token} onUpdate={fetchUser} />
            )}

            {activeTab === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CalendarView 
                  meetingNotes={meetingNotes} 
                  onAddNote={(date: string) => setIsAddingMeetingNote({ initialDate: date })} 
                />
              </motion.div>
            )}

            {activeTab === 'activities' && (
              <motion.div key="activities" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <DailyActivityView 
                  activities={dailyActivities} 
                  onAddActivity={() => setIsAddingDailyActivity(true)} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selectedTask && (
          <TaskModal 
            key={`task-modal-${selectedTask.id}`}
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
            onStatusChange={handleStatusChange}
            token={token}
            user={user}
            onReportIssue={setReportingTask}
            onEdit={setIsEditingTask}
            onDelete={handleDeleteTask}
            onLogWork={setIsLoggingWork}
          />
        )}

        {isLoggingWork && (
          <WorkLogModal 
            task={isLoggingWork} 
            onClose={() => setIsLoggingWork(null)} 
            onLog={handleLogWork} 
          />
        )}

        {isAddingMeetingNote && (
          <MeetingNoteModal 
            initialDate={isAddingMeetingNote.initialDate}
            onClose={() => setIsAddingMeetingNote(null)} 
            onSave={handleSaveMeetingNote} 
          />
        )}

        {isAddingDailyActivity && (
          <DailyActivityModal 
            onClose={() => setIsAddingDailyActivity(false)} 
            onSave={handleSaveDailyActivity} 
          />
        )}
        {isEditingTask && (
          <EditTaskModal 
            key={`edit-task-modal-${isEditingTask.id}`}
            task={isEditingTask}
            onClose={() => setIsEditingTask(null)}
            onUpdate={handleUpdateTask}
            users={users}
            userRole={user.role}
          />
        )}
        {isCreateTaskOpen && (
          <CreateTaskModal 
            key="create-task-modal"
            onClose={() => setIsCreateTaskOpen(false)}
            onCreate={handleCreateTask}
            projects={projects}
            users={users}
            userRole={user.role}
            initialProjectId={currentProjectId}
          />
        )}
        {isEditingProject && (
          <EditProjectModal 
            key={`edit-project-modal-${isEditingProject.id}`}
            project={isEditingProject}
            onClose={() => setIsEditingProject(null)}
            onUpdate={handleUpdateProject}
          />
        )}
        {isCreateProjectOpen && (
          <CreateProjectModal 
            key="create-project-modal"
            onClose={() => setIsCreateProjectOpen(false)}
            onCreate={handleCreateProject}
          />
        )}
        {selectedProject && (
          <ProjectDetailsModal 
            key={`project-details-modal-${selectedProject.id}`}
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
        {reportingTask && (
          <ReportIssueModal 
            key={`report-issue-modal-${reportingTask.id || 'general'}`}
            task={reportingTask.id ? reportingTask : null}
            onClose={() => setReportingTask(null)}
            onReport={handleReportIssue}
            token={token}
            projects={projects}
            tasks={tasks}
            currentProjectId={currentProjectId}
          />
        )}
        {selectedIssue && (
          <IssueModal 
            key={`issue-modal-${selectedIssue.id}`}
            issue={selectedIssue}
            onClose={() => setSelectedIssue(null)}
            onStatusChange={handleIssueStatusChange}
            token={token}
            user={user}
            onEdit={setIsEditingIssue}
            onDelete={handleDeleteIssue}
          />
        )}
        {isEditingIssue && (
          <EditIssueModal 
            key={`edit-issue-modal-${isEditingIssue.id}`}
            issue={isEditingIssue}
            onClose={() => setIsEditingIssue(null)}
            onUpdate={handleUpdateIssue}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
