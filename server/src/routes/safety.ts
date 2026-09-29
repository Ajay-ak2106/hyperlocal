import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { broadcastEvent } from '../realtime.js';

const router = Router();

// GET safety check-in statistics & records
router.get('/', (req: Request, res: Response) => {
  try {
    const { community_id } = req.query;

    let countSql = 'SELECT status, COUNT(*) as count FROM safety_checkins WHERE 1=1';
    let checkinsSql = 'SELECT * FROM safety_checkins WHERE 1=1';
    const params: any[] = [];

    if (community_id) {
      countSql += ' AND community_id = ?';
      checkinsSql += ' AND community_id = ?';
      params.push(community_id);
    }

    countSql += ' GROUP BY status';
    checkinsSql += ' ORDER BY updated_at DESC';

    const statusCounts = queryAll(countSql, params);
    const checkins = queryAll(checkinsSql, params);

    // Build real database aggregation map
    const summary = {
      SAFE: 0,
      NEED_HELP: 0,
      EMERGENCY: 0,
      NO_RESPONSE: 0,
      TOTAL: 0
    };

    for (const row of statusCounts) {
      const statusKey = row.status as keyof typeof summary;
      if (summary[statusKey] !== undefined) {
        summary[statusKey] = Number(row.count);
      }
      summary.TOTAL += Number(row.count);
    }

    res.json({
      success: true,
      data: {
        summary,
        checkins
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST submit or update a safety check-in
router.post('/checkin', (req: Request, res: Response) => {
  try {
    const {
      user_id = 'user-citizen-1',
      user_name = 'Citizen',
      user_phone = '+91 98765 43210',
      community_id = 'cg-1',
      status = 'SAFE',
      note = '',
      area = 'Velachery',
      latitude = 12.9780,
      longitude = 80.2210,
      is_demo = 0
    } = req.body;

    if (!['SAFE', 'NEED_HELP', 'EMERGENCY', 'NO_RESPONSE'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid safety status' });
    }

    const now = new Date().toISOString();
    // Check if user already checked in
    const existing = queryOne('SELECT * FROM safety_checkins WHERE user_id = ?', [user_id]);

    let id: string;
    if (existing) {
      id = existing.id;
      execute(
        `UPDATE safety_checkins SET
          status = ?, note = ?, area = ?, latitude = ?, longitude = ?, updated_at = ?
         WHERE id = ?`,
        [status, note, area, latitude, longitude, now, id]
      );
    } else {
      id = `sc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      execute(
        `INSERT INTO safety_checkins (
          id, user_id, user_name, user_phone, community_id, status, note,
          area, latitude, longitude, is_demo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, user_id, user_name, user_phone, community_id, status, note,
          area, latitude, longitude, is_demo ? 1 : 0, now, now
        ]
      );
    }

    const updatedCheckin = queryOne('SELECT * FROM safety_checkins WHERE id = ?', [id]);

    // Query fresh database counts
    const statusCounts = queryAll('SELECT status, COUNT(*) as count FROM safety_checkins GROUP BY status');
    const summary = { SAFE: 0, NEED_HELP: 0, EMERGENCY: 0, NO_RESPONSE: 0, TOTAL: 0 };
    for (const row of statusCounts) {
      const k = row.status as keyof typeof summary;
      if (summary[k] !== undefined) summary[k] = Number(row.count);
      summary.TOTAL += Number(row.count);
    }

    // Realtime broadcast with updated summary
    broadcastEvent('safety_checkins', 'UPDATE', {
      checkin: updatedCheckin,
      summary
    });

    res.json({
      success: true,
      data: {
        checkin: updatedCheckin,
        summary
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST trigger community "ARE YOU SAFE?" poll by coordinator
router.post('/trigger-poll', (req: Request, res: Response) => {
  try {
    const { community_id = 'cg-1', area = 'Velachery' } = req.body;
    const now = new Date().toISOString();

    const notifId = `notif-${Date.now()}`;
    execute(
      `INSERT INTO notifications (id, user_id, title, message, type, related_entity_id, is_read, created_at)
       VALUES (?, NULL, '🚨 ARE YOU SAFE? Community Safety Check', ?, 'SAFETY_REQUEST', ?, 0, ?)`,
      [notifId, `Community coordinator requested a safety check-in for residents in ${area}. Please tap your status.`, community_id, now]
    );

    broadcastEvent('notifications', 'INSERT', {
      id: notifId,
      title: '🚨 ARE YOU SAFE? Community Safety Check',
      message: `Safety check-in initiated for ${area}. Tap your status now.`,
      type: 'SAFETY_REQUEST',
      created_at: now
    });

    res.json({ success: true, message: 'Safety check poll dispatched' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
