/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sgpro-super-secret-key-2026';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize SQLite Database
const dbPath = process.env.VERCEL ? ':memory:' : path.join(process.cwd(), 'database.db');
const db = new sqlite3.Database(dbPath);

// Create promise wrappers
const runDb = (query: string, params: any[] = []): Promise<{ id: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        console.error('Database run error:', err, 'Query:', query);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

const getDb = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error('Database get error:', err, 'Query:', query);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allDb = (query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Database all error:', err, 'Query:', query);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Initialize tables on startup
async function initDatabase() {
  try {
    // 1. Users Table
    await runDb(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'User',
        employee_id TEXT UNIQUE,
        mobile_number TEXT,
        address TEXT,
        joining_date TEXT,
        department TEXT,
        designation TEXT,
        profile_photo TEXT,
        is_active INTEGER DEFAULT 1,
        is_banned INTEGER DEFAULT 0
      )
    `);

    // 2. Attendance Table
    await runDb(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        site_name TEXT NOT NULL,
        shift TEXT NOT NULL,
        reporting_time TEXT NOT NULL,
        remarks TEXT,
        verified INTEGER DEFAULT 0,
        verified_by TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Duty Reports Table
    await runDb(`
       CREATE TABLE IF NOT EXISTS duty_reports (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         site_name TEXT NOT NULL,
         guard_id INTEGER NOT NULL,
         shift_time TEXT NOT NULL,
         duty_status TEXT NOT NULL,
         incident_details TEXT DEFAULT '',
         remarks TEXT,
         date_time TEXT NOT NULL,
         FOREIGN KEY (guard_id) REFERENCES users(id) ON DELETE CASCADE
       )
    `);

    // 4. Incidents Table
    await runDb(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_type TEXT NOT NULL,
        incident_date TEXT NOT NULL,
        incident_time TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        witness_details TEXT,
        photo TEXT,
        status TEXT NOT NULL DEFAULT 'Open'
      )
    `);

    // 5. Leave Requests Table
    await runDb(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        emergency_contact TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        remarks TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 6. Visitors Table
    await runDb(`
      CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_name TEXT NOT NULL,
        mobile_number TEXT NOT NULL,
        purpose TEXT NOT NULL,
        person_to_meet TEXT NOT NULL,
        entry_time TEXT NOT NULL,
        exit_time TEXT NOT NULL DEFAULT '',
        visitor_photo TEXT,
        site_name TEXT NOT NULL
      )
    `);

    // 7. Notifications Table
    await runDb(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, -- 0 for public broadcast
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `);

    // 8. Documents Table
    await runDb(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        file_data TEXT NOT NULL, -- Base64 encoded
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 9. Sites Table
    await runDb(`
      CREATE TABLE IF NOT EXISTS sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_name TEXT UNIQUE NOT NULL,
        site_address TEXT NOT NULL,
        site_manager TEXT,
        contact_number TEXT
      )
    `);

    // 10. Activity Logs Table
    await runDb(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);

    // 11. Login Logs Table
    await runDb(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        ip_address TEXT,
        device_name TEXT,
        login_time TEXT,
        browser TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Seed default sites if none exist
    const siteCount = await getDb(`SELECT COUNT(*) as count FROM sites`);
    if (siteCount.count === 0) {
      await runDb(`INSERT INTO sites (site_name, site_address, site_manager, contact_number) VALUES (?, ?, ?, ?)`, [
        'Metro HQ Tower', '77 Financial District, Sector 4', 'Sanjay Mishra', '+91 98765 43210'
      ]);
      await runDb(`INSERT INTO sites (site_name, site_address, site_manager, contact_number) VALUES (?, ?, ?, ?)`, [
        'Global Tech Park', 'Bhubaneswar Infocity Phase II', 'Rajesh Patra', '+91 89012 34567'
      ]);
      await runDb(`INSERT INTO sites (site_name, site_address, site_manager, contact_number) VALUES (?, ?, ?, ?)`, [
        'Amazon Logistics Hub', 'National Highway 16, Cuttack', 'Anjan Das', '+91 76543 21098'
      ]);
    }

    // Seed default users if none exist
    const userCount = await getDb(`SELECT COUNT(*) as count FROM users`);
    if (userCount.count === 0) {
      console.log('Seeding default users...');
      const superadminPassword = await bcrypt.hash('superadmin123', 10);
      const adminPassword = await bcrypt.hash('admin123', 10);
      const supervisorPassword = await bcrypt.hash('supervisor123', 10);
      const guardPassword = await bcrypt.hash('guard123', 10);
      const userPassword = await bcrypt.hash('user123', 10);

      // Super Admin
      await runDb(`
        INSERT INTO users (full_name, email, password, role, employee_id, mobile_number, address, joining_date, department, designation, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, ['Super Admin', 'superadmin@sgpro.com', superadminPassword, 'Super Admin', 'EMP-001', '+91 99999 00001', 'Admin Command Center, BBSR', '2026-01-01', 'Operations', 'Super Commander']);

      // Admin
      await runDb(`
        INSERT INTO users (full_name, email, password, role, employee_id, mobile_number, address, joining_date, department, designation, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, ['Admin Desk', 'admin@sgpro.com', adminPassword, 'Admin', 'EMP-002', '+91 99999 00002', 'Head Office Tower B', '2026-01-10', 'Human Resources', 'Security Operations Manager']);

      // Supervisor
      await runDb(`
        INSERT INTO users (full_name, email, password, role, employee_id, mobile_number, address, joining_date, department, designation, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, ['Bikash R. Patel', 'supervisor@sgpro.com', supervisorPassword, 'Supervisor', 'EMP-003', '+91 99999 00003', 'Sector 5, Bhubaneswar', '2026-02-01', 'Field Services', 'Operations Supervisor']);

      // Guard
      await runDb(`
        INSERT INTO users (full_name, email, password, role, employee_id, mobile_number, address, joining_date, department, designation, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, ['Ramesh Kumar Shahu', 'guard@sgpro.com', guardPassword, 'Security Guard', 'EMP-101', '+91 99999 00101', 'Cuttack Link Rd, Odisha', '2026-02-15', 'On-Site Security', 'First-Class Armed Guard']);

      // Regular User
      await runDb(`
        INSERT INTO users (full_name, email, password, role, employee_id, mobile_number, address, joining_date, department, designation, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, ['John Doe', 'user@sgpro.com', userPassword, 'User', 'EMP-501', '+91 99999 11111', 'Laxmi Sagar, BBSR', '2026-03-01', 'Corporate staff', 'Office Executive']);

      console.log('Seeding finished successfully.');
    }
  } catch (error) {
    console.error('Database Setup Failure:', error);
  }
}

initDatabase();

// Authentication middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Auth token required' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Log actions utility
async function logActivity(userId: number | null, action: string, details: string) {
  try {
    const timestamp = new Date().toISOString();
    await runDb(`
      INSERT INTO activity_logs (user_id, action, details, timestamp)
      VALUES (?, ?, ?, ?)
    `, [userId, action, details, timestamp]);
  } catch (err) {
    console.error('Logging action failed:', err);
  }
}

// ==================================================
// AUTHENTICATION ROUTES
// ==================================================

// Registration
app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, password, role, mobile_number, address, joining_date, department, designation } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }

  try {
    // Check if user already exists
    const existing = await getDb('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role || 'User';
    const employee_id = 'EMP-' + Math.floor(100 + Math.random() * 900);
    const joinDate = joining_date || new Date().toISOString().split('T')[0];

    const result = await runDb(`
      INSERT INTO users (full_name, email, password, role, employee_id, mobile_number, address, joining_date, department, designation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [full_name, email, hashedPassword, assignedRole, employee_id, mobile_number || '', address || '', joinDate, department || 'General', designation || 'Officer']);

    const userObj = { id: result.id, full_name, email, role: assignedRole, employee_id };
    await logActivity(result.id, 'User Registered', `${full_name} registered as user with ID ${employee_id}`);

    res.status(201).json({ message: 'User registered successfully', user: userObj });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userObj = await getDb('SELECT * FROM users WHERE email = ?', [email]);
    if (!userObj) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (userObj.is_banned === 1) {
      return res.status(403).json({ error: 'Your account has been banned. Contact Supervisor.' });
    }

    const validPassword = await bcrypt.compare(password, userObj.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Record login log
    const ip = req.ip || '127.0.0.1';
    const activeTime = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';
    const device = userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Computer';

    await runDb(`
      INSERT INTO login_logs (user_id, ip_address, device_name, login_time, browser)
      VALUES (?, ?, ?, ?, ?)
    `, [userObj.id, ip, device, activeTime, userAgent]);

    await logActivity(userObj.id, 'User Logged In', `Successfully authenticated from ${device}`);

    // Create JWT
    const token = jwt.sign(
      { id: userObj.id, email: userObj.email, role: userObj.role, name: userObj.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Delete password row before return
    const { password: _, ...safeUser } = userObj;

    res.json({ token, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mock/Simulated Google OAuth single sign-on redirect endpoint
app.get('/api/auth/google/url', (req, res) => {
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const consentUrl = `${req.protocol}://${req.get('host')}/api/auth/google/consent?redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.json({ url: consentUrl });
});

// Direct interactive Google Login screen representation inside popup iframe helper
app.get('/api/auth/google/consent', (req, res) => {
  const { redirect_uri } = req.query;
  const userEmail = 'bindhanibikash71@gmail.com'; // Injected automatically from user profile
  
  // HTML display for Google OAuth
  res.send(`
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign in with Google - SG Pro</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-100 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full border border-gray-200">
          <div class="text-center mb-6">
            <div class="flex justify-center mb-3">
              <svg class="h-10 w-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.74-.08-1.302-.178-1.859l-10.615-.31z" />
              </svg>
            </div>
            <h1 class="text-xl font-bold text-gray-800">Sign in with Google</h1>
            <p class="text-gray-500 text-sm mt-1">to continue to Safety Guard Pro</p>
          </div>
          
          <div class="border border-gray-300 rounded-lg p-4 mb-6 hover:bg-gray-50 cursor-pointer transition" 
               onclick="window.location.href='${redirect_uri}?email=${encodeURIComponent(userEmail)}&name=Bikash%20Bindhani'">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                B
              </div>
              <div>
                <p class="font-medium text-gray-800 text-sm">Bikash Bindhani</p>
                <p class="text-gray-500 text-xs">${userEmail}</p>
              </div>
            </div>
          </div>

          <div class="text-center text-xs text-gray-500">
            By continuing, Google will share your name, email address, language preference, and profile picture with Safety Guard Pro.
          </div>
        </div>
      </body>
    </html>
  `);
});

// OAuth Callback handler with JWT delivery
app.get('/api/auth/google/callback', async (req, res) => {
  const { email, name } = req.query;
  const userEmail = (email as string) || 'bindhanibikash71@gmail.com';
  const fullName = (name as string) || 'Bikash Bindhani';

  try {
    let userObj = await getDb('SELECT * FROM users WHERE email = ?', [userEmail]);
    
    if (!userObj) {
      // Create user
      const defaultPassword = await bcrypt.hash('google-oauth-password-hash-2026', 10);
      const employee_id = 'EMP-G' + Math.floor(100 + Math.random() * 900);
      
      const insert = await runDb(`
        INSERT INTO users (full_name, email, password, role, employee_id, joining_date, is_active)
        VALUES (?, ?, ?, 'User', ?, ?, 1)
      `, [fullName, userEmail, defaultPassword, employee_id, new Date().toISOString().split('T')[0]]);
      
      userObj = await getDb('SELECT * FROM users WHERE id = ?', [insert.id]);
    }

    if (userObj.is_banned === 1) {
      return res.send(`
        <html>
          <body>
            <script>
              alert("Your account is suspended. Contact supervisor.");
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    // Issue Token
    const token = jwt.sign(
      { id: userObj.id, email: userObj.email, role: userObj.role, name: userObj.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = userObj;

    // Send success script that alerts standard login
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                token: '${token}', 
                user: ${JSON.stringify(safeUser)} 
              }, '*');
              window.close();
            } else {
              window.location.href = '/?token=${token}';
            }
          </script>
          <p class="p-8 text-center text-gray-600">Google SSO Authentication successful! Closing popup window...</p>
        </body>
      </html>
    `);

    await logActivity(userObj.id, 'Google Login Success', 'Logged via Google SSO single sign-on');
  } catch (error: any) {
    res.status(500).send(`Authentication error: ${error.message}`);
  }
});

// Forgot & Reset Password
app.post('/api/auth/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await getDb('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ error: 'No user registered with this email address' });

    await logActivity(user.id, 'Forgot Password Triggered', `Requested password recovery link for ${email}`);
    res.json({ message: 'Reset link generated successfully. Reset password right now inside the app.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/reset', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Values required' });

  try {
    const user = await getDb('SELECT id, full_name FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ error: 'No user exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await runDb('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    await logActivity(user.id, 'Reset Password Success', `Created new password key secure hash.`);
    res.json({ message: 'Password recovery successful! Password changed.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Self-Profile API
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const userObj = await getDb('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!userObj) return res.status(404).json({ error: 'User profile not found' });
    const { password: _, ...safeUser } = userObj;
    res.json(safeUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile API (With Base64 Photo Option)
app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
  const { full_name, mobile_number, address, department, designation, profile_photo } = req.body;
  
  try {
    let updateFields = 'full_name = ?, mobile_number = ?, address = ?, department = ?, designation = ?';
    let params = [full_name || '', mobile_number || '', address || '', department || '', designation || ''];

    if (profile_photo) {
      updateFields += ', profile_photo = ?';
      params.push(profile_photo);
    }

    params.push(req.user.id);

    await runDb(`UPDATE users SET ${updateFields} WHERE id = ?`, params);
    const updatedUser = await getDb('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const { password: _, ...safeUser } = updatedUser;

    await logActivity(req.user.id, 'Profile Updated', 'User modified individual profile fields & directory data');
    res.json({ message: 'Profile details saved', user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// ATTENDANCE MANAGEMENT
// ==================================================

app.get('/api/attendance', authenticateToken, async (req: any, res) => {
  try {
    let query = `
      SELECT a.*, u.full_name, u.employee_id, u.mobile_number 
      FROM attendance a
      JOIN users u ON a.user_id = u.id
    `;
    let params: any[] = [];
    
    // Non-admins can only see their own logs
    if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin' && req.user.role !== 'Supervisor') {
      query += ` WHERE a.user_id = ? `;
      params.push(req.user.id);
    }

    query += ` ORDER BY a.id DESC`;
    const records = await allDb(query, params);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance', authenticateToken, async (req: any, res) => {
  const { site_name, shift, remarks } = req.body;
  if (!site_name || !shift) {
    return res.status(400).json({ error: 'Site name and Shift selection are required' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Prevent duplicated register for same site/date/shift
    const exists = await getDb('SELECT id FROM attendance WHERE user_id = ? AND date = ? AND shift = ?', [
      req.user.id, today, shift
    ]);

    if (exists) {
      return res.status(400).json({ error: 'You already marked attendance for this shift today' });
    }

    const result = await runDb(`
      INSERT INTO attendance (user_id, date, site_name, shift, reporting_time, remarks, verified)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [req.user.id, today, site_name, shift, timeNow, remarks || '']);

    await logActivity(req.user.id, 'Marked Attendance', `Logged check-in for ${site_name} on ${shift} shift`);

    // Notify administrators
    await runDb(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      VALUES (0, 'New Check-In registered', 'Guard ${req.user.name} logged in at ${site_name} (${shift})', 'attendance', ?)
    `, [new Date().toISOString()]);

    res.status(201).json({ message: 'Attendance registered successfully', id: result.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/attendance/:id/verify', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin' && req.user.role !== 'Supervisor') {
    return res.status(403).json({ error: 'Access denied: Requires administration validation' });
  }

  const { id } = req.params;
  const { verified } = req.body; // 1 or 0

  try {
    await runDb('UPDATE attendance SET verified = ?, verified_by = ? WHERE id = ?', [
      verified ? 1 : 0, req.user.name, id
    ]);

    const record = await getDb('SELECT a.*, u.full_name FROM attendance a JOIN users u ON a.user_id = u.id WHERE a.id = ?', [id]);
    
    await logActivity(req.user.id, 'Verified Attendance', `Admin confirmed attendance record #${id} of ${record?.full_name}`);
    
    if (record) {
      await runDb(`
        INSERT INTO notifications (user_id, title, message, type, created_at)
        VALUES (?, 'Attendance verified', 'Your roster item on ${record.date} at ${record.site_name} has been approved.', 'attendance', ?)
      `, [record.user_id, new Date().toISOString()]);
    }

    res.json({ message: 'Attendance status saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// DUTY REPORT MANAGEMENT
// ==================================================

app.get('/api/duty-reports', authenticateToken, async (req: any, res) => {
  try {
    let query = `
      SELECT r.*, u.full_name as guard_name, u.employee_id
      FROM duty_reports r
      JOIN users u ON r.guard_id = u.id
    `;
    let params: any[] = [];

    if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin' && req.user.role !== 'Supervisor') {
      query += ` WHERE r.guard_id = ?`;
      params.push(req.user.id);
    }

    query += ` ORDER BY r.id DESC`;
    const reports = await allDb(query, params);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/duty-reports', authenticateToken, async (req: any, res) => {
  const { site_name, shift_time, duty_status, incident_details, remarks } = req.body;
  
  if (!site_name || !shift_time || !duty_status) {
    return res.status(400).json({ error: 'Site, Shift timing, and Status details are required' });
  }

  try {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0,19);
    await runDb(`
      INSERT INTO duty_reports (site_name, guard_id, shift_time, duty_status, incident_details, remarks, date_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [site_name, req.user.id, shift_time, duty_status, incident_details || '', remarks || '', timestamp]);

    await logActivity(req.user.id, 'Duty Report Filed', `Submitted duty log for site ${site_name}`);

    // If there is an incident inside duty report, write it to incident table automatically
    if (duty_status === 'Incident Occurred' && incident_details) {
      await runDb(`
        INSERT INTO incidents (incident_type, incident_date, incident_time, location, description, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'Reported from Duty Log', 
        timestamp.split(' ')[0], 
        timestamp.split(' ')[1].substring(0,5), 
        site_name, 
        incident_details, 
        'Open'
      ]);
    }

    res.status(201).json({ message: 'Duty report filed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/duty-reports/:id', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin' && req.user.role !== 'Supervisor') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    await runDb('DELETE FROM duty_reports WHERE id = ?', [req.params.id]);
    res.json({ message: 'Roster report item deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// LEAVE MANAGEMENT
// ==================================================

app.get('/api/leaves', authenticateToken, async (req: any, res) => {
  try {
    let query = `
      SELECT l.*, u.full_name as employee_name, u.employee_id
      FROM leave_requests l
      JOIN users u ON l.user_id = u.id
    `;
    let params: any[] = [];

    if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin' && req.user.role !== 'Supervisor') {
      query += ` WHERE l.user_id = ? `;
      params.push(req.user.id);
    }

    query += ` ORDER BY l.id DESC`;
    const leaves = await allDb(query, params);
    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leaves', authenticateToken, async (req: any, res) => {
  const { reason, start_date, end_date, emergency_contact } = req.body;
  if (!reason || !start_date || !end_date || !emergency_contact) {
    return res.status(400).json({ error: 'All parameters must be specified.' });
  }

  try {
    await runDb(`
      INSERT INTO leave_requests (user_id, reason, start_date, end_date, emergency_contact, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `, [req.user.id, reason, start_date, end_date, emergency_contact]);

    await logActivity(req.user.id, 'Leave Requested', `Applied for absence request from ${start_date} to ${end_date}`);

    await runDb(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      VALUES (0, 'New Leave Application', 'Staff ${req.user.name} applied for leave which is pending approval.', 'leave', ?)
    `, [new Date().toISOString()]);

    res.status(201).json({ message: 'Absence application received successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leaves/:id/status', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin' && req.user.role !== 'Supervisor') {
    return res.status(403).json({ error: 'Administrator clearance required.' });
  }

  const { id } = req.params;
  const { status, remarks } = req.body; // Approved / Rejected

  try {
    await runDb('UPDATE leave_requests SET status = ?, remarks = ? WHERE id = ?', [status, remarks || '', id]);
    
    const request = await getDb('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (request) {
      await runDb(`
        INSERT INTO notifications (user_id, title, message, type, created_at)
        VALUES (?, 'Leave Request Status Update', 'Your leave request has been ${status}. Remarks: ${remarks || "None"}', 'leave', ?)
      `, [request.user_id, new Date().toISOString()]);
    }

    await logActivity(req.user.id, `Leave ${status}`, `Roster Manager ${status} leave petition ID #${id}`);
    res.json({ message: `Leave status has been changed to ${status}.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// SALARY MANAGEMENT
// ==================================================

app.get('/api/salaries/stats', authenticateToken, async (req: any, res) => {
  // Let's compute salary simulated historical files dynamically based on attendance!
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Get list of targets
    let query = 'SELECT id, full_name, employee_id, designation, joining_date FROM users';
    let params: any[] = [];
    if (userRole !== 'Admin' && userRole !== 'Super Admin') {
      query += ' WHERE id = ?';
      params.push(userId);
    }
    const employees = await allDb(query, params);

    const payrolls = [];

    for (const emp of employees) {
      // Get count of completed verified attendances for current employee
      const attData = await getDb(`
        SELECT COUNT(*) as total_days,
               SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as present_days
        FROM attendance
        WHERE user_id = ?
      `, [emp.id]);

      // Simple calculation: base standard monthly rate (rupees/USD) e.g., default rate standard
      const basePay = emp.designation.includes('Commander') ? 45000 : emp.designation.includes('Supervisor') ? 32000 : 21000;
      const registeredDutyDays = attData.present_days || 0;
      // Synthesize default days (e.g., if no logs exist, mock realistic 22 active days minimum for dashboard demo)
      const mockDays = registeredDutyDays > 0 ? registeredDutyDays : 23;
      
      const overtimeMockHours = 12; // Standard monthly summary
      const hourlyOvertimeRate = 150;
      
      const baseSalaryEarned = Math.round((basePay / 26) * mockDays);
      const overtimeEarned = overtimeMockHours * hourlyOvertimeRate;
      const totalSalary = baseSalaryEarned + overtimeEarned;

      payrolls.push({
        id: emp.id,
        employee_name: emp.full_name,
        employee_id: emp.employee_id,
        designation: emp.designation,
        monthly_salary: basePay,
        duty_days: 26,
        present_days: mockDays,
        overtime_hours: overtimeMockHours,
        earned_salary: baseSalaryEarned,
        overtime_pay: overtimeEarned,
        net_payable: totalSalary,
        month: 'June 2026'
      });
    }

    res.json(payrolls);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// INCIDENT REPORT SYSTEM
// ==================================================

app.get('/api/incidents', authenticateToken, async (req: any, res) => {
  try {
    const incidents = await allDb('SELECT * FROM incidents ORDER BY id DESC');
    res.json(incidents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/incidents', authenticateToken, async (req: any, res) => {
  const { incident_type, incident_date, incident_time, location, description, witness_details, photo } = req.body;
  if (!incident_type || !incident_date || !incident_time || !location || !description) {
    return res.status(400).json({ error: 'Primary incident parameters are required.' });
  }

  try {
    const result = await runDb(`
      INSERT INTO incidents (incident_type, incident_date, incident_time, location, description, witness_details, photo, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Open')
    `, [incident_type, incident_date, incident_time, location, description, witness_details || '', photo || '']);

    await logActivity(req.user.id, 'Logged Incident', `Created Incident Ticket #${result.id} [${incident_type}] at ${location}`);

    // Broadcast report and highlight critical alert status
    await runDb(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      VALUES (0, 'ALERT: Incident Logged', 'A critical incident event has been filed: ${incident_type} at ${location}', 'incident', ?)
    `, [new Date().toISOString()]);

    res.status(201).json({ message: 'Emergency event recorded.', id: result.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/incidents/:id/status', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin' && req.user.role !== 'Supervisor') {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const { id } = req.params;
  const { status } = req.body; // Open / In-Progress / Resolved

  try {
    await runDb('UPDATE incidents SET status = ? WHERE id = ?', [status, id]);
    await logActivity(req.user.id, 'Incident Updated', `Ticket #${id} status changed to ${status}`);
    res.json({ message: 'Incident state saved.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// VISITOR MANAGEMENT
// ==================================================

app.get('/api/visitors', authenticateToken, async (req: any, res) => {
  try {
    const visitors = await allDb('SELECT * FROM visitors ORDER BY id DESC');
    res.json(visitors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/visitors', authenticateToken, async (req: any, res) => {
  const { visitor_name, mobile_number, purpose, person_to_meet, site_name, visitor_photo } = req.body;
  if (!visitor_name || !mobile_number || !purpose || !person_to_meet || !site_name) {
    return res.status(400).json({ error: 'Visitor parameters incorrect.' });
  }

  try {
    const timeNow = new Date().toISOString().replace('T', ' ').substring(0,16);
    const result = await runDb(`
      INSERT INTO visitors (visitor_name, mobile_number, purpose, person_to_meet, entry_time, visitor_photo, site_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [visitor_name, mobile_number, purpose, person_to_meet, timeNow, visitor_photo || '', site_name]);

    await logActivity(req.user.id, 'Registered Visitor', `Visitor ${visitor_name} checked-in at ${site_name}`);
    res.status(201).json({ message: 'Visitor entry validated.', id: result.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/visitors/:id/exit', authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  try {
    const timeNow = new Date().toISOString().replace('T', ' ').substring(0,16);
    await runDb('UPDATE visitors SET exit_time = ? WHERE id = ?', [timeNow, id]);
    
    const vObj = await getDb('SELECT visitor_name FROM visitors WHERE id = ?', [id]);
    await logActivity(req.user.id, 'Logged Visitor Out', `Visitor ${vObj?.visitor_name || id} cleared for checkout`);

    res.json({ message: 'Visitor checked out successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// SITE MANAGEMENT
// ==================================================

app.get('/api/sites', authenticateToken, async (req: any, res) => {
  try {
    const sites = await allDb('SELECT * FROM sites ORDER BY site_name');
    res.json(sites);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sites', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Clearance level instructions rejected.' });
  }

  const { site_name, site_address, site_manager, contact_number } = req.body;
  if (!site_name || !site_address) {
    return res.status(400).json({ error: 'Site name and address parameters are mandatory' });
  }

  try {
    await runDb(`
      INSERT INTO sites (site_name, site_address, site_manager, contact_number)
      VALUES (?, ?, ?, ?)
    `, [site_name, site_address, site_manager || '', contact_number || '']);

    await logActivity(req.user.id, 'Created Site Hub', `Added station post: ${site_name}`);
    res.status(201).json({ message: 'Station post created.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/sites/:id', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  try {
    await runDb('DELETE FROM sites WHERE id = ?', [req.params.id]);
    res.json({ message: 'Station post cleared.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// DOCUMENT MANAGEMENT
// ==================================================

app.get('/api/documents', authenticateToken, async (req: any, res) => {
  try {
    let query = `
      SELECT d.*, u.full_name as employee_name
      FROM documents d
      JOIN users u ON d.user_id = u.id
    `;
    let params: any[] = [];

    if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
      query += ' WHERE d.user_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY d.id DESC';
    const docs = await allDb(query, params);
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/documents', authenticateToken, async (req: any, res) => {
  const { title, type, file_data } = req.body;
  if (!title || !type || !file_data) {
    return res.status(400).json({ error: 'Document constraints invalid.' });
  }

  try {
    const stampNow = new Date().toISOString().split('T')[0];
    await runDb(`
      INSERT INTO documents (user_id, title, type, file_data, uploaded_at)
      VALUES (?, ?, ?, ?, ?)
    `, [req.user.id, title, type, file_data, stampNow]);

    await logActivity(req.user.id, 'Uploaded Document', `Stored safety index ticket document: "${title}"`);
    res.status(201).json({ message: 'License index document registered successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// NOTIFICATIONS SYSTEM
// ==================================================

app.get('/api/notifications', authenticateToken, async (req: any, res) => {
  try {
    // Return notifications sent directly to user, or global broadcasts (userId = 0)
    const notifications = await allDb(`
      SELECT * FROM notifications 
      WHERE user_id = ? OR user_id = 0 
      ORDER BY id DESC LIMIT 40
    `, [req.user.id]);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/read', authenticateToken, async (req: any, res) => {
  try {
    await runDb(`UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id = 0`, [req.user.id]);
    res.json({ message: 'Flag logs marked as read.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/announce', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin' && req.user.role !== 'Supervisor') {
    return res.status(403).json({ error: 'Permission level insufficient' });
  }

  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Enter title and announcement details.' });
  }

  try {
    await runDb(`
      INSERT INTO notifications (user_id, title, message, type, created_at)
      VALUES (0, ?, ?, 'announcement', ?)
    `, [title, message, new Date().toISOString()]);

    await logActivity(req.user.id, 'Announcement Published', `Made alert broadcast notice: "${title}"`);
    res.status(201).json({ message: 'Roster directive broadcast recorded.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// ADMIN & SUPER ADMIN EXCLUSIVE UTILITIES
// ==================================================

// Read logs
app.get('/api/logs/activity', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Super Admin' && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'System administration clearance required' });
  }

  try {
    const logs = await allDb(`
      SELECT l.*, u.full_name, u.email, u.role
      FROM activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.id DESC LIMIT 100
    `);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/logs/login', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Super Admin' && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'System administration clearance required' });
  }

  try {
    const logs = await allDb(`
      SELECT l.*, u.full_name, u.email, u.role
      FROM login_logs l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.id DESC LIMIT 100
    `);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Manage Directory
app.get('/api/users', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin' && req.user.role !== 'Supervisor') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const users = await allDb('SELECT id, full_name, email, role, employee_id, mobile_number, address, joining_date, department, designation, is_active, is_banned FROM users ORDER BY full_name');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/role', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Super Admin clearance mandatory to assign roles' });
  }

  const { id } = req.params;
  const { role } = req.body;

  try {
    await runDb('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    
    const userToAssign = await getDb('SELECT full_name FROM users WHERE id = ?', [id]);
    await logActivity(req.user.id, 'Modified User Role', `Assigned level ${role} to staff ${userToAssign?.full_name || id}`);

    res.json({ message: 'Staff role reassigned successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/suspend', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Role access restricted.' });
  }

  const { id } = req.params;
  const { is_banned } = req.body; // 1 or 0

  try {
    await runDb('UPDATE users SET is_banned = ? WHERE id = ?', [is_banned ? 1 : 0, id]);
    
    const userToMod = await getDb('SELECT full_name FROM users WHERE id = ?', [id]);
    await logActivity(req.user.id, is_banned ? 'Banned User' : 'Unbanned User', `Security clearance for ${userToMod?.full_name || id} updated (ban_status: ${is_banned})`);

    res.json({ message: is_banned ? 'User security access banned.' : 'User security access restored.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Super Admin' && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Operational clearance level insufficient to delete profiles.' });
  }

  try {
    await runDb('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User profile deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Database Backups and Restore simulated routines
app.post('/api/system/backup', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Super Admin') return res.status(403).json({ error: 'Super Admin clearance required.' });
  
  try {
    const backupName = `backup_database_${Date.now()}.db`;
    const backupFolder = process.env.VERCEL ? '/tmp/backups' : path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder);
    }

    fs.copyFileSync(dbPath, path.join(backupFolder, backupName));
    await logActivity(req.user.id, 'System Backup Triggered', `Wrote local relational image backup checkpoint: ${backupName}`);
    res.json({ message: `Relational image check wrote successfully: ${backupName}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================================
// VITE CLIENT INTEGRATION
// ==================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Note: Vercel handles static files on its own edge network.
    // This is for local production server runs.
    if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Bind exclusively if not running inside Vercel serverless platform
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Three Star Security Solutions] Security Server booted on http://localhost:${PORT}`);
    });
  }
}

startServer();

// Export the Express API for Vercel Serverless Functions
export default app;
