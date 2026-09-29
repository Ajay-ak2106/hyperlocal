import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../database.js';
import { broadcastEvent } from '../realtime.js';

const router = Router();

// GET all incidents
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, type, area } = req.query;
    let sql = 'SELECT * FROM incidents WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (area) {
      sql += ' AND area = ?';
      params.push(area);
    }

    sql += ' ORDER BY created_at DESC';
    const incidents = queryAll(sql, params);
    res.json({ success: true, data: incidents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single incident
router.get('/:id', (req: Request, res: Response) => {
  try {
    const incident = queryOne('SELECT * FROM incidents WHERE id = ?', [req.params.id]);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, data: incident });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST report new incident
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      reporter_id,
      reporter_name = 'Citizen Reporter',
      reporter_phone = '',
      type = 'EMERGENCY',
      severity = 'HIGH',
      description,
      area = 'Chennai Local',
      latitude = 12.9780,
      longitude = 80.2210,
      number_affected = 1,
      photo_url = null,
      audio_url = null,
      is_demo = 0
    } = req.body;

    if (!description) {
      return res.status(400).json({ success: false, error: 'Description is required' });
    }

    const id = `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    execute(
      `INSERT INTO incidents (
        id, reporter_id, reporter_name, reporter_phone, type, severity, description,
        area, latitude, longitude, status, verification_status, number_affected,
        photo_url, audio_url, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REPORTED', 'UNVERIFIED', ?, ?, ?, ?, ?, ?)`,
      [
        id, reporter_id || null, reporter_name, reporter_phone, type, severity, description,
        area, latitude, longitude, number_affected,
        photo_url, audio_url, is_demo ? 1 : 0, now, now
      ]
    );

    const createdIncident = queryOne('SELECT * FROM incidents WHERE id = ?', [id]);

    // Broadcast Realtime Event
    broadcastEvent('incidents', 'INSERT', createdIncident);

    // Create Notification for Coordinators & Volunteers
    const notifId = `notif-${Date.now()}`;
    execute(
      `INSERT INTO notifications (id, user_id, title, message, type, related_entity_id, is_read, created_at)
       VALUES (?, NULL, ?, ?, 'DISASTER_ALERT', ?, 0, ?)`,
      [notifId, `🚨 New ${type} Alert in ${area}`, description.substring(0, 100), id, now]
    );
    broadcastEvent('notifications', 'INSERT', {
      id: notifId,
      title: `🚨 New ${type} Alert in ${area}`,
      message: description.substring(0, 100),
      type: 'DISASTER_ALERT',
      created_at: now
    });

    res.status(201).json({ success: true, data: createdIncident });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update status or verify incident
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { status, verification_status, verified_by, verification_notes } = req.body;
    const existing = queryOne('SELECT * FROM incidents WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const now = new Date().toISOString();
    const newStatus = status || existing.status;
    const newVerification = verification_status || existing.verification_status;
    const verifiedAt = verification_status ? now : existing.verified_at;

    execute(
      `UPDATE incidents SET
        status = ?,
        verification_status = ?,
        verified_by = ?,
        verified_at = ?,
        verification_notes = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        newStatus,
        newVerification,
        verified_by || existing.verified_by,
        verifiedAt,
        verification_notes || existing.verification_notes,
        now,
        req.params.id
      ]
    );

    // Audit log
    execute(
      `INSERT INTO audit_logs (id, user_id, action, table_name, record_id, details, created_at)
       VALUES (?, ?, 'UPDATE_INCIDENT_STATUS', 'incidents', ?, ?, ?)`,
      [`audit-${Date.now()}`, verified_by || 'admin', req.params.id, JSON.stringify({ newStatus, newVerification }), now]
    );

    const updated = queryOne('SELECT * FROM incidents WHERE id = ?', [req.params.id]);
    broadcastEvent('incidents', 'UPDATE', updated);

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
