import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';

const router = Router();

// GET all emergency contacts (helplines + user contacts)
router.get('/', (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    let sql = 'SELECT * FROM emergency_contacts WHERE is_global_helpline = 1';
    const params: any[] = [];

    if (user_id) {
      sql += ' OR user_id = ?';
      params.push(user_id);
    }

    sql += ' ORDER BY is_global_helpline DESC, name ASC';
    const contacts = queryAll(sql, params);
    res.json({ success: true, data: contacts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST add new personal or helpline contact
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      user_id = null,
      name,
      relationship = 'PERSONAL',
      phone_number,
      category = 'PERSONAL',
      is_global_helpline = false
    } = req.body;

    if (!name || !phone_number) {
      return res.status(400).json({ success: false, error: 'Name and phone number are required' });
    }

    const id = `ec-${Date.now()}`;
    const now = new Date().toISOString();

    execute(
      `INSERT INTO emergency_contacts (id, user_id, name, relationship, phone_number, category, is_global_helpline, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, name, relationship, phone_number, category, is_global_helpline ? 1 : 0, now]
    );

    const created = queryOne('SELECT * FROM emergency_contacts WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
