import { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, FileText, PenLine, UserPlus, Users, Bell, User, LogOut, Menu, GraduationCap, ChevronDown, ShieldCheck, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { STUDENTS0, MARKS0, NOTES0, TEACHERS } from './data';
import { Dashboard, Reports, Results, MarksEntry, Students, Register, Profile, Notifications } from './pages.jsx';

const ROLES = {
  correspondent: { label: 'Correspondent', desc: 'View school-wide reports and charts; raise questions through notifications. No editing or deletion of reports.', user: 'Dr. R. Venkatesh', icon: ShieldCheck },
  principal: { label: 'School Principal', desc: 'View student, class and teacher reports; raise questions without changing the reports.', user: 'Mrs. S. Lakshmi', icon: GraduationCap },
  teacher: { label: 'Teachers', desc: 'Enter and update marks only for assigned students and subjects.', user: TEACHERS[0].name, icon: BookOpen },
  office: { label: 'Office Workers', desc: 'Add, read, update and delete student details using authorised accounts.', user: 'Mr. Arun Kumar', icon: Users },
  student: { label: 'Students', desc: 'View own subject-wise marks, overall progress charts and examination reports.', user: STUDENTS0[0].name, icon: BarChart3 },
};
const NAV = {
  correspondent: ['dashboard', 'reports', 'results', 'profile', 'notifications'],
  principal: ['dashboard', 'reports', 'results', 'profile', 'notifications'],
  teacher: ['dashboard', 'marks', 'results', 'notifications'],
  office: ['dashboard', 'students', 'register', 'profile', 'notifications'],
  student: ['dashboard', 'profile', 'results'],
};
const ITEMS = {
  dashboard: ['Dashboard', LayoutDashboard], reports: ['Academic Reports', BarChart3], results: ['Exam Results', FileText],
  marks: ['Marks Entry', PenLine], students: ['Students', Users], register: ['Register Student', UserPlus],
  profile: ['My Profile', User], notifications: ['Notifications & Queries', Bell],
};

export default function App() {
  const [role, setRole] = useState(null);
  const [pick, setPick] = useState('principal');
  const [page, setPage] = useState('dashboard');
  const [students, setStudents] = useState(STUDENTS0);
  const [marks, setMarks] = useState(MARKS0);
  const [notes, setNotes] = useState(NOTES0);
  const [selId, setSelId] = useState(null);
  const [side, setSide] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast, setToastS] = useState(null);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToastS(null), 3200); return () => clearTimeout(t); } }, [toast]);
  const say = (msg, type = 'ok') => setToastS({ msg, type });

  if (!role) {
    return (
      <div className="login">
        <i className="blob b1" /><i className="blob b2" /><i className="blob b3" />
        <div className="lcard">
          <div className="brand big"><GraduationCap size={38} /><div><h1>EduNova School ERP</h1><p>Academic Management & Reporting System</p></div></div>
          <h2>Role-based platforms</h2>
          <div className="roles">
            {Object.entries(ROLES).map(([k, r]) => { const I = r.icon; return (
              <button key={k} className={'role ' + (pick === k ? 'on' : '')} onClick={() => setPick(k)}><I size={26} /><b>{r.label}</b><span>{r.desc}</span></button>
            ); })}
          </div>
          <button className="btn big" onClick={() => { setRole(pick); setPage('dashboard'); setSelId(null); }}>Enter demo as {ROLES[pick].label}</button>
          <p className="note"><ShieldCheck size={14} /> Demo only: permissions are enforced in the frontend and are not secure without backend authorization.</p>
        </div>
      </div>
    );
  }

  const me = role === 'student' ? STUDENTS0[0] : null;
  const teacher = TEACHERS[0];
  const go = (p) => { if (NAV[role].includes(p)) { setPage(p); setSide(false); window.scrollTo(0, 0); } };
  const openProfile = (id) => { setSelId(id); go('profile'); };
  const visible = notes.filter((n) => n.from === role || n.to === role);
  const unread = visible.filter((n) => n.to === role && n.status === 'Open').length;
  const c = { role, me, teacher, students, setStudents, marks, setMarks, notes, setNotes, visible, selId, go, openProfile, say };
  const side_items = NAV[role].filter((p) => p !== 'profile' || role === 'student');
  const allowed = NAV[role].includes(page);

  return (
    <div className="app">
      <aside className={'side ' + (side ? 'open' : '')}>
        <div className="brand"><GraduationCap size={28} /><div><b>EduNova</b><span>School ERP</span></div></div>
        <nav>
          {side_items.map((p) => { const [l, I] = ITEMS[p]; return (
            <button key={p} className={page === p ? 'on' : ''} onClick={() => go(p)}><I size={18} />{l}{p === 'notifications' && unread > 0 && <em>{unread}</em>}</button>
          ); })}
        </nav>
        <div className="sfoot"><span className="pill">{ROLES[role].label}</span><button onClick={() => setRole(null)}><LogOut size={16} /> Switch role</button></div>
      </aside>
      {side && <div className="scrim" onClick={() => setSide(false)} />}
      <main>
        <header className="top">
          <button className="ib mob" onClick={() => setSide(true)}><Menu size={22} /></button>
          <h2>{ITEMS[page]?.[0] === 'My Profile' && role !== 'student' ? 'Student Profile' : ITEMS[page]?.[0]}</h2>
          <div className="tr">
            <span className="term">Term 1 · 2026-27</span>
            {NAV[role].includes('notifications') && <button className="ib bell" onClick={() => go('notifications')}><Bell size={20} />{unread > 0 && <em>{unread}</em>}</button>}
            <div className="pm">
              <button className="pbtn" onClick={() => setMenu(!menu)}><span className="av">{ROLES[role].user[0]}</span><span className="pn"><b>{ROLES[role].user}</b><small>{ROLES[role].label}</small></span><ChevronDown size={16} /></button>
              {menu && <div className="drop"><div><b>{ROLES[role].user}</b><small>{ROLES[role].label}</small></div>
                {role === 'student' && <button onClick={() => { setMenu(false); go('profile'); }}><User size={15} /> My Profile</button>}
                <button onClick={() => { setMenu(false); setRole(null); }}><LogOut size={15} /> Switch role / Logout</button></div>}
            </div>
          </div>
        </header>
        <section key={page + (selId || '')} className="content" onClick={() => menu && setMenu(false)}>
          {!allowed ? <div className="empty"><AlertCircle size={36} /><h3>Access denied</h3><p>Your role cannot open this page (frontend demo rule).</p></div> : <>
            {page === 'dashboard' && <Dashboard c={c} />}
            {page === 'reports' && <Reports c={c} />}
            {page === 'results' && <Results c={c} />}
            {page === 'marks' && <MarksEntry c={c} />}
            {page === 'students' && <Students c={c} />}
            {page === 'register' && <Register c={c} />}
            {page === 'profile' && <Profile c={c} />}
            {page === 'notifications' && <Notifications c={c} />}
          </>}
        </section>
      </main>
      {toast && <div className={'toast ' + toast.type}>{toast.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}{toast.msg}</div>}
    </div>
  );
}
