import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { broadcastEvent } from '../realtime.js';

const router = Router();

// GET all resources
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, area, status } = req.query;
    let sql = 'SELECT * FROM resources WHERE 1=1';
    const params: any[] = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (area) {
      sql += ' AND area = ?';
      params.push(area);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';
    const resources = queryAll(sql, params);
    res.json({ success: true, data: resources });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST add new resource
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      provider_name,
      provider_phone,
      category,
      name,
      quantity = 1,
      unit = 'units',
      area,
      latitude = 12.9780,
      longitude = 80.2210,
      delivery_mode = 'PICKUP_OR_DELIVERY',
      is_demo = 0
    } = req.body;

    if (!provider_name || !name || !category || !area) {
      return res.status(400).json({ success: false, error: 'Provider name, item name, category, and area are required' });
    }

    const id = `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    execute(
      `INSERT INTO resources (
        id, provider_name, provider_phone, category, name, quantity, unit,
        area, latitude, longitude, delivery_mode, status, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?, ?, ?)`,
      [
        id, provider_name, provider_phone || '', category, name, quantity, unit,
        area, latitude, longitude, delivery_mode, is_demo ? 1 : 0, now, now
      ]
    );

    const created = queryOne('SELECT * FROM resources WHERE id = ?', [id]);
    broadcastEvent('resources', 'INSERT', created);

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update resource quantity or status
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { quantity, status } = req.body;
    const existing = queryOne('SELECT * FROM resources WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    const now = new Date().toISOString();
    const newQty = quantity !== undefined ? Number(quantity) : existing.quantity;
    let newStatus = status || existing.status;

    if (newQty <= 0) {
      newStatus = 'DEPLETED';
    } else if (newQty < 10 && newStatus === 'AVAILABLE') {
      newStatus = 'LOW_STOCK';
    }

    execute(
      `UPDATE resources SET quantity = ?, status = ?, updated_at = ? WHERE id = ?`,
      [newQty, newStatus, now, req.params.id]
    );

    const updated = queryOne('SELECT * FROM resources WHERE id = ?', [req.params.id]);
    broadcastEvent('resources', 'UPDATE', updated);

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
