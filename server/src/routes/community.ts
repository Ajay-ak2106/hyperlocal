import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { broadcastEvent } from '../realtime.js';

const router = Router();

// GET all community groups
router.get('/groups', (req: Request, res: Response) => {
  try {
    const groups = queryAll('SELECT * FROM community_groups ORDER BY name ASC');
    res.json({ success: true, data: groups });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET community posts
router.get('/posts', (req: Request, res: Response) => {
  try {
    const { community_id } = req.query;
    let sql = 'SELECT * FROM community_posts WHERE 1=1';
    const params: any[] = [];

    if (community_id) {
      sql += ' AND community_id = ?';
      params.push(community_id);
    }

    sql += ' ORDER BY created_at DESC';
    const posts = queryAll(sql, params);
    res.json({ success: true, data: posts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new community feed post
router.post('/posts', (req: Request, res: Response) => {
  try {
    const {
      community_id = 'cg-1',
      author_id,
      author_name = 'Community Member',
      message,
      category = 'UPDATE',
      photo_url = null,
      latitude = null,
      longitude = null,
      is_demo = 0
    } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    const id = `cp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    execute(
      `INSERT INTO community_posts (
        id, community_id, author_id, author_name, message, category,
        photo_url, latitude, longitude, verified, is_demo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        id, community_id, author_id || null, author_name, message,
        category, photo_url, latitude, longitude, is_demo ? 1 : 0, now
      ]
    );

    const created = queryOne('SELECT * FROM community_posts WHERE id = ?', [id]);
    broadcastEvent('community_posts', 'INSERT', created);

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
