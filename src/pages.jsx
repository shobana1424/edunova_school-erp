import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Eye, Pencil, Trash2, Plus, Lock, Send, Users, TrendingUp, Award, CheckCircle2, X, Inbox, BookOpen, School, ArrowLeft, AlertTriangle } from 'lucide-react';
import { SUBJECTS, CLASSES, TEACHERS, total, pct, grade, passed, avg, has } from './data';

const COL = ['#0b2447', '#0fb5ae', '#f5a623'];
const tone = (p) => (p >= 50 ? 'ok' : p >= 35 ? 'warn' : 'bad');
const Badge = ({ t, children }) => <span className={'badge ' + t}>{children}</span>;
const Count = ({ v }) => {
  const m = typeof v === 'string' || typeof v === 'number' ? String(v).match(/^(\d+)(.*)$/) : null;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!m) return;
    const end = +m[1]; let raf; const t0 = performance.now();
    const tick = (t) => { const k = Math.min(1, (t - t0) / 900); setN(Math.round(end * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [v]);
  return m ? <>{n}{m[2]}</> : <>{v}</>;
};
const Kpi = ({ icon: I, label, value, sub }) => (
  <div className="kpi"><div className="ki"><I size={22} /></div><div><span>{label}</span><b><Count v={value} /></b>{sub && <small>{sub}</small>}</div></div>
);
const Empty = ({ icon: I = Inbox, title, text }) => <div className="empty"><I size={36} /><h3>{title}</h3><p>{text}</p></div>;
const Mk = ({ v }) => <td className={v !== undefined && v < 35 ? 'low' : ''}>{v ?? '—'}</td>;
export const Modal = ({ title, children, onClose, foot }) => (
  <div className="ov" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}>
    <div className="mh"><h3>{title}</h3><button className="ib" onClick={onClose}><X size={18} /></button></div>
    <div className="mb">{children}</div>{foot && <div className="mf">{foot}</div>}
  </div></div>
);
const Chart = ({ data, keys, h = 260 }) => (
  <ResponsiveContainer width="100%" height={h}>
    <BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip /><Legend />
      {keys.map((k, i) => <Bar key={k} dataKey={k} fill={COL[i]} radius={[6, 6, 0, 0]} />)}</BarChart>
  </ResponsiveContainer>
);

const scored = (c, l = c.students) => l.filter((s) => has(c.marks[s.id]));
const passRate = (c, l) => (l.length ? Math.round((100 * l.filter((s) => passed(c.marks[s.id])).length) / l.length) : 0);
const classStats = (c) => CLASSES.map((k) => { const l = scored(c, c.students.filter((s) => s.cls === k)); return { name: k, Average: avg(l.map((s) => pct(c.marks[s.id]))), 'Pass %': passRate(c, l) }; });
const subjStats = (c, l = scored(c)) => SUBJECTS.map((sub) => ({ name: sub, Average: avg(l.map((s) => c.marks[s.id][sub] ?? 0)), 'Pass %': l.length ? Math.round((100 * l.filter((s) => (c.marks[s.id][sub] ?? 0) >= 35).length) / l.length) : 0 }));

export function Dashboard({ c }) {
  const { role, students, marks } = c;
  const sc = scored(c);
  if (role === 'student') {
    const s = students.find((x) => x.id === c.me.id);
    if (!s) return <Empty title="Record not found" text="Your student record is unavailable." />;
    const m = marks[s.id] || {}; const p = pct(m);
    const peers = sc.filter((x) => x.cls === s.cls).sort((a, b) => pct(marks[b.id]) - pct(marks[a.id]));
    const rank = peers.findIndex((x) => x.id === s.id) + 1;
    return (<>
      <div className="hero"><h1>Welcome, {s.name}</h1><p>Class {s.cls} · Roll No. {s.roll} · Admission ID {s.id}</p></div>
      <div className="kpis"><Kpi icon={TrendingUp} label="Overall %" value={has(m) ? p + '%' : '—'} sub={has(m) ? 'Grade ' + grade(p) : 'Marks pending'} />
        <Kpi icon={Award} label="Class Rank" value={rank || '—'} sub={'of ' + peers.length} />
        <Kpi icon={BookOpen} label="Total Marks" value={total(m) + ' / ' + SUBJECTS.length * 100} />
        <Kpi icon={CheckCircle2} label="Result" value={has(m) ? (passed(m) ? 'Pass' : 'Fail') : 'Pending'} /></div>
      <div className="card"><h3>My subject-wise marks</h3><Chart data={SUBJECTS.map((x) => ({ name: x, Marks: m[x] ?? 0 }))} keys={['Marks']} /></div>
    </>);
  }
  if (role === 'teacher') {
    const t = c.teacher; const mine = students.filter((s) => t.classes.includes(s.cls));
    const pending = mine.filter((s) => marks[s.id]?.[t.subject] === undefined).length;
    return (<>
      <div className="hero"><h1>Good day, {t.name}</h1><p>Subject: {t.subject} · Classes: {t.classes.join(', ')}</p></div>
      <div className="kpis"><Kpi icon={School} label="Assigned Classes" value={t.classes.length} /><Kpi icon={Users} label="My Students" value={mine.length} />
        <Kpi icon={BookOpen} label="Subject" value={t.subject} /><Kpi icon={Pencil} label="Pending Entries" value={pending} sub="marks not yet entered" /></div>
      <div className="card"><div className="ch"><h3>Assigned classes</h3><button className="btn" onClick={() => c.go('marks')}>Open marks entry</button></div>
        <div className="tw"><table><thead><tr><th>Class</th><th>Students</th><th>{t.subject} average</th><th>Pass %</th></tr></thead><tbody>
          {t.classes.map((k) => { const l = mine.filter((s) => s.cls === k && marks[s.id]?.[t.subject] !== undefined); return (
            <tr key={k}><td><b>{k}</b></td><td>{mine.filter((s) => s.cls === k).length}</td><td>{avg(l.map((s) => marks[s.id][t.subject]))}</td><td>{l.length ? Math.round((100 * l.filter((s) => marks[s.id][t.subject] >= 35).length) / l.length) : 0}%</td></tr>); })}
        </tbody></table></div></div>
    </>);
  }
  if (role === 'office') {
    return (<>
      <div className="hero"><h1>Admissions & Records Desk</h1><p>Manage student registrations and records.</p></div>
      <div className="kpis"><Kpi icon={Users} label="Total Students" value={students.length} /><Kpi icon={CheckCircle2} label="Active" value={students.filter((s) => s.status === 'Active').length} />
        <Kpi icon={X} label="Inactive" value={students.filter((s) => s.status !== 'Active').length} /><Kpi icon={School} label="Classes" value={CLASSES.length} /></div>
      <div className="card"><div className="ch"><h3>Recent registrations</h3><div className="row"><button className="btn" onClick={() => c.go('register')}><Plus size={16} /> Register</button><button className="btn ghost" onClick={() => c.go('students')}>All students</button></div></div>
        <div className="tw"><table><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Parent</th><th></th></tr></thead><tbody>
          {[...students].slice(-5).reverse().map((s) => <tr key={s.id}><td>{s.id}</td><td><b>{s.name}</b></td><td>{s.cls}</td><td>{s.parent}</td><td><button className="ib" onClick={() => c.openProfile(s.id)}><Eye size={16} /></button></td></tr>)}
        </tbody></table></div></div>
    </>);
  }
  const top = [...sc].sort((a, b) => pct(marks[b.id]) - pct(marks[a.id])).slice(0, 5);
  const cs = classStats(c); const best = [...cs].sort((a, b) => b.Average - a.Average)[0];
  return (<>
    <div className="hero"><h1>{role === 'principal' ? 'Principal’s Academic Overview' : 'Correspondent’s School Overview'}</h1><p>Term 1 Examination 2026-27 · Read-only analytics</p></div>
    <div className="kpis"><Kpi icon={Users} label="Students" value={students.length} /><Kpi icon={TrendingUp} label="School Average" value={avg(sc.map((s) => pct(marks[s.id]))) + '%'} />
      <Kpi icon={CheckCircle2} label="Overall Pass %" value={passRate(c, sc) + '%'} /><Kpi icon={Award} label="Top Class" value={best?.name} sub={best?.Average + '% avg'} /></div>
    <div className="grid2"><div className="card"><h3>Class-wise performance</h3><Chart data={cs} keys={['Average', 'Pass %']} /></div>
      <div className="card"><h3>Subject-wise performance</h3><Chart data={subjStats(c)} keys={['Average', 'Pass %']} /></div></div>
    <div className="card"><h3>Top performers</h3><div className="tw"><table><thead><tr><th>#</th><th>Student</th><th>Class</th><th>%</th><th>Grade</th></tr></thead><tbody>
      {top.map((s, i) => <tr key={s.id} className="click" onClick={() => c.openProfile(s.id)}><td>{i + 1}</td><td><b>{s.name}</b></td><td>{s.cls}</td><td>{pct(marks[s.id])}%</td><td><Badge t={tone(pct(marks[s.id]))}>{grade(pct(marks[s.id]))}</Badge></td></tr>)}
    </tbody></table></div></div>
  </>);
}

export function Reports({ c }) {
  const [tab, setTab] = useState('class'); const [q, setQ] = useState(''); const [cl, setCl] = useState('All'); const [sj, setSj] = useState('All');
  const tabs = [['class', 'Class-wise'], ['student', 'Student-wise'], ['subject', 'Subject-wise'], ...(c.role === 'principal' ? [['teacher', 'Teacher-wise']] : [])];
  const cs = classStats(c);
  const list = scored(c).filter((s) => (cl === 'All' || s.cls === cl) && s.name.toLowerCase().includes(q.toLowerCase()));
  return (<>
    <div className="tabs">{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
    <p className="ro"><Lock size={14} /> Reports are read-only for your role.</p>
    {tab === 'class' && <div className="card"><h3>Class-wise report</h3><Chart data={cs} keys={['Average', 'Pass %']} />
      <div className="tw"><table><thead><tr><th>Class</th><th>Students</th><th>Average %</th><th>Pass %</th></tr></thead><tbody>
        {cs.map((r) => <tr key={r.name}><td><b>{r.name}</b></td><td>{c.students.filter((s) => s.cls === r.name).length}</td><td>{r.Average}</td><td>{r['Pass %']}%</td></tr>)}</tbody></table></div></div>}
    {tab === 'student' && <div className="card"><div className="bar"><div className="search"><Search size={16} /><input placeholder="Search student…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <select value={cl} onChange={(e) => setCl(e.target.value)}><option>All</option>{CLASSES.map((k) => <option key={k}>{k}</option>)}</select></div>
      {list.length === 0 ? <Empty title="No students found" text="Try a different search or class filter." /> :
        <div className="tw"><table><thead><tr><th>Student</th><th>Class</th><th>Total</th><th>%</th><th>Grade</th><th></th></tr></thead><tbody>
          {list.map((s) => <tr key={s.id}><td><b>{s.name}</b></td><td>{s.cls}</td><td>{total(c.marks[s.id])}</td><td>{pct(c.marks[s.id])}%</td><td><Badge t={tone(pct(c.marks[s.id]))}>{grade(pct(c.marks[s.id]))}</Badge></td><td><button className="ib" onClick={() => c.openProfile(s.id)}><Eye size={16} /></button></td></tr>)}</tbody></table></div>}</div>}
    {tab === 'subject' && <div className="card"><div className="bar"><select value={cl} onChange={(e) => setCl(e.target.value)}><option>All</option>{CLASSES.map((k) => <option key={k}>{k}</option>)}</select>
      <select value={sj} onChange={(e) => setSj(e.target.value)}><option>All</option>{SUBJECTS.map((k) => <option key={k}>{k}</option>)}</select></div>
      <Chart data={subjStats(c, scored(c).filter((s) => cl === 'All' || s.cls === cl)).filter((r) => sj === 'All' || r.name === sj)} keys={['Average', 'Pass %']} /></div>}
    {tab === 'teacher' && <div className="card"><h3>Teacher-wise results</h3><div className="tw"><table><thead><tr><th>Teacher</th><th>Subject</th><th>Classes</th><th>Average</th><th>Pass %</th></tr></thead><tbody>
      {TEACHERS.map((t) => { const l = scored(c, c.students.filter((s) => t.classes.includes(s.cls))); return (
        <tr key={t.id}><td><b>{t.name}</b></td><td>{t.subject}</td><td>{t.classes.join(', ')}</td><td>{avg(l.map((s) => c.marks[s.id][t.subject] ?? 0))}</td><td>{l.length ? Math.round((100 * l.filter((s) => (c.marks[s.id][t.subject] ?? 0) >= 35).length) / l.length) : 0}%</td></tr>); })}</tbody></table></div></div>}
  </>);
}

export function Results({ c }) {
  const [q, setQ] = useState(''); const [cl, setCl] = useState('All'); const [rs, setRs] = useState('All');
  const own = c.role === 'student'; const canView = ['correspondent', 'principal', 'office'].includes(c.role);
  const list = c.students.filter((s) => (!own || s.id === c.me.id) && (cl === 'All' || s.cls === cl) && s.name.toLowerCase().includes(q.toLowerCase()) && (rs === 'All' || (has(c.marks[s.id]) && (rs === 'Pass') === passed(c.marks[s.id]))));
  return (
    <div className="card"><div className="ch"><h3>Term 1 Examination Results</h3></div>
      {!own && <div className="bar"><div className="search"><Search size={16} /><input placeholder="Search student…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select value={cl} onChange={(e) => setCl(e.target.value)}><option value="All">All classes</option>{CLASSES.map((k) => <option key={k}>{k}</option>)}</select>
        <select value={rs} onChange={(e) => setRs(e.target.value)}><option value="All">All results</option><option>Pass</option><option>Fail</option></select></div>}
      {list.length === 0 ? <Empty title="No results" text="No examination records match your filters." /> :
        <div className="tw"><table><thead><tr><th>Student</th><th>Class</th>{SUBJECTS.map((x) => <th key={x}>{x}</th>)}<th>Total</th><th>%</th><th>Grade</th><th>Result</th>{canView && <th></th>}</tr></thead><tbody>
          {list.map((s) => { const m = c.marks[s.id]; const h = has(m); return (
            <tr key={s.id}><td><b>{s.name}</b></td><td>{s.cls}</td>{SUBJECTS.map((x) => <Mk key={x} v={m?.[x]} />)}<td>{h ? total(m) : '—'}</td><td>{h ? pct(m) + '%' : '—'}</td>
              <td>{h ? <Badge t={tone(pct(m))}>{grade(pct(m))}</Badge> : '—'}</td><td>{h ? <Badge t={passed(m) ? 'ok' : 'bad'}>{passed(m) ? 'Pass' : 'Fail'}</Badge> : <Badge t="info">Pending</Badge>}</td>
              {canView && <td><button className="ib" onClick={() => c.openProfile(s.id)}><Eye size={16} /></button></td>}</tr>); })}</tbody></table></div>}
    </div>
  );
}

export function MarksEntry({ c }) {
  const t = c.teacher;
  const [cls, setCls] = useState(t.classes[0]); const [sub, setSub] = useState(t.subject);
  const [draft, setDraft] = useState({}); const [err, setErr] = useState({}); const [confirm, setConfirm] = useState(false);
  const can = (k, s) => t.classes.includes(k) && t.subject === s;
  const list = c.students.filter((s) => s.cls === cls && s.status === 'Active');
  const val = (s) => draft[s.id] ?? c.marks[s.id]?.[sub] ?? '';
  const validate = () => {
    const e = {};
    Object.entries(draft).forEach(([id, v]) => { if (v === '' || !/^\d+$/.test(String(v)) || +v > 100) e[id] = 'Enter 0–100'; });
    setErr(e);
    if (Object.keys(draft).length === 0) { c.say('No changes to save.', 'err'); return; }
    if (Object.keys(e).length) { c.say('Fix invalid marks before saving.', 'err'); return; }
    setConfirm(true);
  };
  const save = () => {
    if (!can(cls, sub)) { c.say('Not authorised to edit these marks.', 'err'); setConfirm(false); return; }
    c.setMarks((m) => { const n = { ...m }; Object.entries(draft).forEach(([id, v]) => { n[id] = { ...(n[id] || {}), [sub]: +v }; }); return n; });
    c.say(`${Object.keys(draft).length} mark(s) saved for ${cls} · ${sub}.`); setDraft({}); setConfirm(false);
  };
  return (
    <div className="card"><div className="ch"><h3>Enter / update marks</h3><Badge t="info">{t.name}</Badge></div>
      <div className="bar"><label>Class<select value={cls} onChange={(e) => { setCls(e.target.value); setDraft({}); setErr({}); }}>{CLASSES.map((k) => <option key={k} value={k} disabled={!t.classes.includes(k)}>{k}{t.classes.includes(k) ? '' : ' (not assigned)'}</option>)}</select></label>
        <label>Subject<select value={sub} onChange={(e) => { setSub(e.target.value); setDraft({}); }}>{SUBJECTS.map((k) => <option key={k} value={k} disabled={k !== t.subject}>{k}{k === t.subject ? '' : ' (not assigned)'}</option>)}</select></label></div>
      {!can(cls, sub) ? <Empty icon={Lock} title="Not authorised" text="You can only edit marks for your assigned classes and subject." /> :
        list.length === 0 ? <Empty title="No students" text="No active students in this class." /> :
          <div className="tw"><table><thead><tr><th>Roll</th><th>Student</th><th>{sub} marks (0–100)</th></tr></thead><tbody>
            {list.map((s) => <tr key={s.id}><td>{s.roll}</td><td><b>{s.name}</b></td><td><input className={'mi ' + (err[s.id] ? 'bad' : '')} inputMode="numeric" value={val(s)} onChange={(e) => setDraft({ ...draft, [s.id]: e.target.value })} />{err[s.id] && <small className="er">{err[s.id]}</small>}</td></tr>)}
          </tbody></table></div>}
      <div className="row end"><button className="btn ghost" onClick={() => { setDraft({}); setErr({}); }}>Reset</button><button className="btn" onClick={validate}>Save marks</button></div>
      {confirm && <Modal title="Confirm save" onClose={() => setConfirm(false)} foot={<><button className="btn ghost" onClick={() => setConfirm(false)}>Cancel</button><button className="btn" onClick={save}>Confirm & save</button></>}>
        <p>Save {Object.keys(draft).length} updated mark(s) for <b>{cls}</b> in <b>{sub}</b>?</p></Modal>}
    </div>
  );
}

function StudentForm({ init, onSave, onCancel, label }) {
  const [f, setF] = useState(init || { name: '', cls: '', dob: '', parent: '', phone: '', email: '', status: 'Active' });
  const [e, setE] = useState({});
  const set = (k) => (ev) => setF({ ...f, [k]: ev.target.value });
  const submit = () => {
    const n = {};
    if (f.name.trim().length < 3) n.name = 'Full name is required (min 3 characters)';
    if (!f.cls) n.cls = 'Select a class';
    if (!f.dob) n.dob = 'Date of birth is required';
    if (!f.parent.trim()) n.parent = 'Parent / guardian is required';
    if (!/^\d{10}$/.test(f.phone)) n.phone = 'Enter a 10-digit phone number';
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) n.email = 'Enter a valid email';
    setE(n); if (!Object.keys(n).length) onSave({ ...f, name: f.name.trim(), parent: f.parent.trim() });
  };
  const fld = (k, l, p = {}) => (
    <label>{l}<input value={f[k]} onChange={set(k)} className={e[k] ? 'bad' : ''} {...p} />{e[k] && <small className="er">{e[k]}</small>}</label>
  );
  return (<div className="form">
    {fld('name', 'Full name *', { placeholder: 'e.g. Ananya Krishnan' })}
    <label>Class *<select value={f.cls} onChange={set('cls')} className={e.cls ? 'bad' : ''}><option value="">Select class</option>{CLASSES.map((k) => <option key={k}>{k}</option>)}</select>{e.cls && <small className="er">{e.cls}</small>}</label>
    {fld('dob', 'Date of birth *', { type: 'date' })}{fld('parent', 'Parent / guardian *')}{fld('phone', 'Phone *', { maxLength: 10 })}{fld('email', 'Email')}
    <label>Status<select value={f.status} onChange={set('status')}><option>Active</option><option>Inactive</option></select></label>
    <div className="row end full">{onCancel && <button className="btn ghost" onClick={onCancel}>Cancel</button>}<button className="btn" onClick={submit}>{label}</button></div>
  </div>);
}

export function Register({ c }) {
  const [k, setK] = useState(0);
  return (
    <div className="card"><h3>New student registration</h3>
      <StudentForm key={k} label="Register student" onSave={(f) => {
        const id = 'S' + (Math.max(100, ...c.students.map((s) => +s.id.slice(1))) + 1);
        c.setStudents([...c.students, { ...f, id, roll: c.students.filter((s) => s.cls === f.cls).length + 1 }]);
        c.say(`${f.name} registered with ID ${id}.`); setK(k + 1);
      }} />
    </div>
  );
}

export function Students({ c }) {
  const [q, setQ] = useState(''); const [cl, setCl] = useState('All'); const [st, setSt] = useState('All'); const [edit, setEdit] = useState(null); const [del, setDel] = useState(null);
  const list = c.students.filter((s) => (cl === 'All' || s.cls === cl) && (st === 'All' || s.status === st) && (s.name + s.id).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="card"><div className="ch"><h3>Student records ({list.length})</h3><button className="btn" onClick={() => c.go('register')}><Plus size={16} /> New student</button></div>
      <div className="bar"><div className="search"><Search size={16} /><input placeholder="Search by name or ID…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select value={cl} onChange={(e) => setCl(e.target.value)}><option value="All">All classes</option>{CLASSES.map((k) => <option key={k}>{k}</option>)}</select>
        <select value={st} onChange={(e) => setSt(e.target.value)}><option value="All">All status</option><option>Active</option><option>Inactive</option></select></div>
      {list.length === 0 ? <Empty title="No students found" text="Adjust filters or register a new student." /> :
        <div className="tw"><table><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Parent</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {list.map((s) => <tr key={s.id}><td>{s.id}</td><td><b>{s.name}</b></td><td>{s.cls}</td><td>{s.parent}</td><td>{s.phone}</td><td><Badge t={s.status === 'Active' ? 'ok' : 'warn'}>{s.status}</Badge></td>
            <td className="acts"><button className="ib" title="View" onClick={() => c.openProfile(s.id)}><Eye size={16} /></button><button className="ib" title="Edit" onClick={() => setEdit(s)}><Pencil size={16} /></button><button className="ib dng" title="Delete" onClick={() => setDel(s)}><Trash2 size={16} /></button></td></tr>)}
        </tbody></table></div>}
      {edit && <Modal title={'Edit ' + edit.id} onClose={() => setEdit(null)}><StudentForm init={edit} label="Update student" onCancel={() => setEdit(null)} onSave={(f) => { c.setStudents(c.students.map((s) => (s.id === edit.id ? { ...s, ...f } : s))); c.say('Student record updated.'); setEdit(null); }} /></Modal>}
      {del && <Modal title="Delete student" onClose={() => setDel(null)} foot={<><button className="btn ghost" onClick={() => setDel(null)}>Cancel</button><button className="btn danger" onClick={() => { c.setStudents(c.students.filter((s) => s.id !== del.id)); c.say(`${del.name} deleted.`); setDel(null); }}>Delete</button></>}>
        <p className="warnp"><AlertTriangle size={18} /> Permanently delete <b>{del.name}</b> ({del.id})? This cannot be undone.</p></Modal>}
    </div>
  );
}

export function Profile({ c }) {
  const id = c.role === 'student' ? c.me.id : c.selId;
  const s = c.students.find((x) => x.id === id);
  if (!s) return <Empty icon={Users} title="No student selected" text="Open a student from the student list or reports." />;
  const m = c.marks[s.id] || {}; const p = pct(m);
  return (<>
    {c.role !== 'student' && <button className="btn ghost back" onClick={() => c.go(c.role === 'office' ? 'students' : 'reports')}><ArrowLeft size={16} /> Back</button>}
    <div className="card prof"><div className="avl">{s.name[0]}</div><div><h2>{s.name}</h2><p>{s.id} · Class {s.cls} · Roll {s.roll}</p><Badge t={s.status === 'Active' ? 'ok' : 'warn'}>{s.status}</Badge></div></div>
    <div className="grid2"><div className="card"><h3>Personal details</h3><dl className="dl">
      <dt>Date of birth</dt><dd>{s.dob}</dd><dt>Parent / guardian</dt><dd>{s.parent}</dd><dt>Phone</dt><dd>{s.phone}</dd><dt>Email</dt><dd>{s.email || '—'}</dd></dl></div>
      <div className="card"><h3>Overall performance</h3>{has(m) ? <div className="ov2"><b>{p}%</b><Badge t={tone(p)}>Grade {grade(p)}</Badge><Badge t={passed(m) ? 'ok' : 'bad'}>{passed(m) ? 'Pass' : 'Fail'}</Badge><small>Total {total(m)} / {SUBJECTS.length * 100}</small></div> : <Empty title="Marks pending" text="No marks entered yet." />}</div></div>
    <div className="card"><h3>Subject-wise marks · Term 1</h3>{SUBJECTS.map((x) => <div className="sb" key={x}><span>{x}</span><div className="trk"><i style={{ width: (m[x] ?? 0) + '%', background: (m[x] ?? 0) < 35 ? '#e5484d' : '' }} /></div><b>{m[x] ?? '—'}</b></div>)}</div>
  </>);
}

export function Notifications({ c }) {
  const { role, visible, notes, setNotes, say } = c;
  const canRaise = ['correspondent', 'principal'].includes(role);
  const targets = ['correspondent', 'principal', 'teacher'].filter((r) => r !== role);
  const [to, setTo] = useState(targets[0]); const [text, setText] = useState(''); const [er, setEr] = useState(''); const [f, setF] = useState('All'); const [rep, setRep] = useState({});
  const raise = () => {
    if (text.trim().length < 10) { setEr('Please enter at least 10 characters.'); return; }
    setNotes([{ id: Date.now(), from: role, to, text: text.trim(), time: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), status: 'Open', reply: '' }, ...notes]);
    setText(''); setEr(''); say('Question raised successfully.');
  };
  const answer = (n) => {
    if (!(rep[n.id] || '').trim()) { say('Type a reply first.', 'err'); return; }
    setNotes(notes.map((x) => (x.id === n.id ? { ...x, status: 'Answered', reply: rep[n.id].trim() } : x))); say('Reply sent.');
  };
  const list = visible.filter((n) => f === 'All' || n.status === f);
  return (<>
    {canRaise && <div className="card"><h3>Raise a question</h3><div className="bar"><label>To<select value={to} onChange={(e) => setTo(e.target.value)}>{targets.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}</select></label></div>
      <textarea className={er ? 'bad' : ''} rows={3} placeholder="Type your question about academic performance…" value={text} onChange={(e) => setText(e.target.value)} />{er && <small className="er">{er}</small>}
      <div className="row end"><button className="btn" onClick={raise}><Send size={15} /> Send question</button></div></div>}
    <div className="card"><div className="ch"><h3>Notifications & queries</h3><div className="tabs sm">{['All', 'Open', 'Answered'].map((k) => <button key={k} className={f === k ? 'on' : ''} onClick={() => setF(k)}>{k}</button>)}</div></div>
      {list.length === 0 ? <Empty title="No notifications" text="Queries addressed to or raised by you will appear here." /> :
        list.map((n) => <div className="note-i" key={n.id}><div className="ch"><b>{n.from} → {n.to}</b><Badge t={n.status === 'Open' ? 'warn' : 'ok'}>{n.status}</Badge></div>
          <p>{n.text}</p><small>{n.time}</small>
          {n.reply && <div className="reply"><b>Reply:</b> {n.reply}</div>}
          {n.to === role && n.status === 'Open' && <div className="row"><input className="grow" placeholder="Write a reply…" value={rep[n.id] || ''} onChange={(e) => setRep({ ...rep, [n.id]: e.target.value })} /><button className="btn" onClick={() => answer(n)}>Reply</button></div>}</div>)}
    </div>
  </>);
}
