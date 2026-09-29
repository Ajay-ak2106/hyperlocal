import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { broadcastEvent } from '../realtime.js';

const router = Router();

// GET notifications
router.get('/', (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    let sql = 'SELECT * FROM notifications WHERE 1=1';
    const params: any[] = [];

    if (user_id) {
      sql += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(user_id);
    }

    sql += ' ORDER BY created_at DESC LIMIT 50';
    const notifications = queryAll(sql, params);
    res.json({ success: true, data: notifications });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH mark notification as read
router.patch('/:id/read', (req: Request, res: Response) => {
  try {
    execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    const updated = queryOne('SELECT * FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST mark all as read
router.post('/read-all', (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    if (user_id) {
      execute('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL', [user_id]);
    } else {
      execute('UPDATE notifications SET is_read = 1');
    }
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
