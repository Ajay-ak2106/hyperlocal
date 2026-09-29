import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';

const router = Router();

// POST demo quick switch (Citizen, Volunteer, Coordinator, Admin)
router.post('/demo-switch', (req: Request, res: Response) => {
  try {
    const { role = 'CITIZEN', id } = req.body;

    let targetId = id;
    if (!targetId) {
      if (role === 'CITIZEN') targetId = 'user-citizen-1';
      else if (role === 'VOLUNTEER') targetId = 'user-vol-1';
      else if (role === 'ADMIN') targetId = 'user-admin-1';
      else if (role === 'COMMUNITY_COORDINATOR') targetId = 'user-citizen-3';
      else targetId = 'user-citizen-1';
    }

    const user = queryOne('SELECT * FROM users WHERE id = ?', [targetId]);
    const profile = queryOne('SELECT * FROM profiles WHERE id = ?', [targetId]);
    const volunteer = queryOne('SELECT * FROM volunteers WHERE id = ?', [targetId]);
    let skills: string[] = [];

    if (volunteer) {
      const skillsRows = queryAll('SELECT skill_name FROM volunteer_skills WHERE volunteer_id = ?', [targetId]);
      skills = skillsRows.map(s => s.skill_name);
    }

    res.json({
      success: true,
      data: {
        user,
        profile,
        volunteer: volunteer ? { ...volunteer, skills } : null,
        token: `demo-token-${targetId}`
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = queryOne('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'No account found with this email. Try Demo Login or Sign Up.' });
    }

    const profile = queryOne('SELECT * FROM profiles WHERE id = ?', [user.id]);
    const volunteer = queryOne('SELECT * FROM volunteers WHERE id = ?', [user.id]);

    res.json({
      success: true,
      data: {
        user,
        profile,
        volunteer,
        token: `auth-token-${user.id}`
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST signup
router.post('/signup', (req: Request, res: Response) => {
  try {
    const {
      email,
      name,
      mobile_number,
      area = 'Velachery',
      city = 'Chennai',
      district = 'Chennai',
      role = 'CITIZEN',
      preferred_language = 'ta'
    } = req.body;

    if (!email || !name || !mobile_number) {
      return res.status(400).json({ success: false, error: 'Email, name, and mobile number are required' });
    }

    const existing = queryOne('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const id = `user-${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Create user
    execute(
      `INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [id, email.trim().toLowerCase(), role, now, now]
    );

    // 2. Create profile
    execute(
      `INSERT INTO profiles (id, name, mobile_number, area, city, district, preferred_language, is_setup_completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, name, mobile_number, area, city, district, preferred_language, now, now]
    );

    // 3. If volunteer, create volunteer record
    if (role === 'VOLUNTEER') {
      execute(
        `INSERT INTO volunteers (id, full_name, phone, area, latitude, longitude, availability_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 12.9780, 80.2210, 'AVAILABLE', ?, ?)`,
        [id, name, mobile_number, area, now, now]
      );
    }

    const user = queryOne('SELECT * FROM users WHERE id = ?', [id]);
    const profile = queryOne('SELECT * FROM profiles WHERE id = ?', [id]);
    const volunteer = role === 'VOLUNTEER' ? queryOne('SELECT * FROM volunteers WHERE id = ?', [id]) : null;

    res.status(201).json({
      success: true,
      data: {
        user,
        profile,
        volunteer,
        token: `auth-token-${id}`
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET current user profile
router.get('/me', (req: Request, res: Response) => {
  try {
    const { user_id = 'user-citizen-1' } = req.query;
    const user = queryOne('SELECT * FROM users WHERE id = ?', [user_id]);
    const profile = queryOne('SELECT * FROM profiles WHERE id = ?', [user_id]);
    const volunteer = queryOne('SELECT * FROM volunteers WHERE id = ?', [user_id]);

    res.json({
      success: true,
      data: { user, profile, volunteer }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update profile
router.put('/profile', (req: Request, res: Response) => {
  try {
    const { user_id, name, mobile_number, area, city, district, preferred_language } = req.body;
    if (!user_id) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const now = new Date().toISOString();
    execute(
      `UPDATE profiles SET
        name = COALESCE(?, name),
        mobile_number = COALESCE(?, mobile_number),
        area = COALESCE(?, area),
        city = COALESCE(?, city),
        district = COALESCE(?, district),
        preferred_language = COALESCE(?, preferred_language),
        updated_at = ?
       WHERE id = ?`,
      [name, mobile_number, area, city, district, preferred_language, now, user_id]
    );

    const updatedProfile = queryOne('SELECT * FROM profiles WHERE id = ?', [user_id]);
    res.json({ success: true, data: updatedProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
