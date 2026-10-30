import Employee from './models/Employee.js';
import Leave from './models/Leave.js';
import Attendance from './models/Attendance.js';
import Announcement from './models/Announcement.js';

// Inserts demo data only when the employees collection is empty.
export default async function seedIfEmpty() {
  if (process.env.SEED_DEMO === 'false') return;
  if ((await Employee.estimatedDocumentCount()) > 0) return;

  const people = await Employee.insertMany([
    { name: 'Aarav Sharma', email: 'aarav@staffsync.com', role: 'Product Designer', department: 'Design' },
    { name: 'Priya Verma', email: 'priya@staffsync.com', role: 'Frontend Developer', department: 'Engineering' },
    { name: 'Kabir Patel', email: 'kabir@staffsync.com', role: 'HR Executive', department: 'Human Resources', status: 'On leave' },
    { name: 'Ananya Singh', email: 'ananya@staffsync.com', role: 'Marketing Lead', department: 'Marketing' },
    { name: 'Rohan Mehta', email: 'rohan@staffsync.com', role: 'Backend Developer', department: 'Engineering' },
  ]);
  const by = (n) => people.find((p) => p.name === n)._id;
  const day = (offset) => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() + offset); return d; };

  await Leave.insertMany([
    { employee: by('Kabir Patel'), type: 'Casual leave', startDate: day(1), endDate: day(2), reason: 'Family function' },
    { employee: by('Ananya Singh'), type: 'Sick leave', startDate: day(3), endDate: day(3), reason: 'Fever' },
    { employee: by('Priya Verma'), type: 'Annual leave', startDate: day(7), endDate: day(9), status: 'Approved', reason: 'Vacation' },
  ]);
  await Attendance.insertMany(
    people.map((p) => ({ employee: p._id, date: day(0), status: p.status === 'On leave' ? 'On leave' : 'Present', checkIn: new Date() }))
  );
  await Announcement.insertMany([
    { title: 'Quarterly town hall', message: 'Join us for company updates and a Q&A with leadership.' },
    { title: 'Open enrollment is coming', message: 'Review your benefits options before the enrollment window closes.' },
  ]);
  console.log('Seeded demo data');
}
