export const SUBJECTS = ['Tamil', 'English', 'Maths', 'Science', 'Social'];
export const CLASSES = ['8-A', '8-B', '9-A'];
export const TEACHERS = [
  { id: 't1', name: 'Mrs. Kavitha R', subject: 'Maths', classes: ['8-A', '8-B'] },
  { id: 't2', name: 'Mr. Suresh M', subject: 'Science', classes: ['8-A', '9-A'] },
  { id: 't3', name: 'Ms. Anitha P', subject: 'English', classes: ['8-B', '9-A'] },
];
const N = ['Aarav Kumar', 'Divya Lakshmi', 'Harini Sri', 'Karthik Raja', 'Meena Priya', 'Nithin Raj', 'Pooja Devi', 'Rahul Varma', 'Sneha Iyer', 'Tharun Kumar', 'Vishnu Prasad', 'Yamini Rao'];
export const STUDENTS0 = N.map((name, i) => ({
  id: 'S' + (101 + i), name, cls: CLASSES[i % 3], roll: Math.floor(i / 3) + 1,
  dob: `2012-0${1 + (i % 9)}-1${i % 9}`, parent: 'Mr. ' + name.split(' ')[1] + ' Sr',
  phone: '98430' + (10000 + i * 137), email: name.split(' ')[0].toLowerCase() + '@mail.com',
  status: i === 9 ? 'Inactive' : 'Active',
}));
export const MARKS0 = {};
STUDENTS0.forEach((s, i) => {
  MARKS0[s.id] = {};
  SUBJECTS.forEach((sub, j) => { MARKS0[s.id][sub] = 30 + ((i * 17 + j * 29 + 7) % 66); });
});
export const NOTES0 = [
  { id: 1, from: 'correspondent', to: 'principal', text: 'Why did Class 9-A Science average drop compared to last term?', time: '18 Oct 2026, 10:20', status: 'Open', reply: '' },
  { id: 2, from: 'principal', to: 'teacher', text: 'Please complete Term 1 marks entry for 8-B by Friday.', time: '17 Oct 2026, 15:05', status: 'Answered', reply: 'Marks for 8-B will be updated by Thursday.' },
];
export const has = (m) => SUBJECTS.some((s) => m?.[s] !== undefined);
export const total = (m = {}) => SUBJECTS.reduce((a, s) => a + (m[s] ?? 0), 0);
export const pct = (m) => Math.round(total(m) / SUBJECTS.length);
export const grade = (p) => (p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B+' : p >= 60 ? 'B' : p >= 50 ? 'C' : p >= 35 ? 'D' : 'F');
export const passed = (m) => SUBJECTS.every((s) => (m?.[s] ?? 0) >= 35);
export const avg = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
