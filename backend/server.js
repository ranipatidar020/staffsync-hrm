import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Employee from './src/models/Employee.js';
import Leave from './src/models/Leave.js';
import Attendance from './src/models/Attendance.js';
import Announcement from './src/models/Announcement.js';
import seedIfEmpty from './src/seed.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Same-origin in production (frontend is served by this server), so CORS only matters for local dev / split hosting.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || ['http://localhost:5173'] }));
app.use(express.json());

const wrap = (fn, okStatus = 200, failStatus = 500) => async (req, res) => {
  try {
    res.status(okStatus).json(await fn(req));
  } catch (e) {
    const msg = e.code === 11000 ? 'An employee with this email already exists' : e.message;
    res.status(e.code === 11000 || e.name === 'ValidationError' || e.name === 'CastError' ? 400 : failStatus).json({ message: msg });
  }
};
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'StaffSync API', db: mongoose.connection.readyState === 1 }));

// Employees
app.get('/api/employees', wrap(() => Employee.find().sort({ createdAt: -1 })));
app.post('/api/employees', wrap((req) => Employee.create(pick(req.body, ['name', 'email', 'role', 'department', 'status'])), 201));

// Leaves
app.get('/api/leaves', wrap(() => Leave.find().sort({ createdAt: -1 }).populate('employee', 'name email')));
app.post('/api/leaves', wrap(async (req) => {
  const l = await Leave.create(pick(req.body, ['employee', 'type', 'startDate', 'endDate', 'reason']));
  return l.populate('employee', 'name email');
}, 201));
app.patch('/api/leaves/:id/status', async (req, res) => {
  if (!['Pending', 'Approved', 'Rejected'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const x = await Leave.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!x) return res.status(404).json({ message: 'Leave request not found' });
    res.json(x);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Attendance
app.get('/api/attendance', wrap(() => Attendance.find().sort({ date: -1 }).populate('employee', 'name email department')));
app.post('/api/attendance', wrap((req) => Attendance.create(pick(req.body, ['employee', 'date', 'checkIn', 'checkOut', 'status'])), 201));

// Announcements
app.get('/api/announcements', wrap(() => Announcement.find().sort({ publishedAt: -1 })));
app.post('/api/announcements', wrap((req) => Announcement.create(pick(req.body, ['title', 'message', 'audience'])), 201));

app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));

// Serve the built React app (frontend/dist) when it exists
const dist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const port = process.env.PORT || 5000;
try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync');
  console.log('MongoDB connected');
  await seedIfEmpty();
  app.listen(port, () => console.log(`StaffSync running on port ${port}`));
} catch (e) {
  console.error('MongoDB connection failed:', e.message);
  process.exit(1);
}
