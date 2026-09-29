import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { broadcastEvent } from '../realtime.js';

const router = Router();

// GET all assistance requests
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, category, area } = req.query;
    let sql = 'SELECT * FROM assistance_requests WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (area) {
      sql += ' AND area = ?';
      params.push(area);
    }

    sql += ' ORDER BY created_at DESC';
    const requests = queryAll(sql, params);
    res.json({ success: true, data: requests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new assistance request
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      citizen_id = 'user-citizen-1',
      citizen_name = 'Citizen in Need',
      citizen_phone = '+91 98765 43210',
      category = 'MEDICAL',
      severity = 'CRITICAL',
      description,
      area = 'Velachery',
      latitude = 12.9780,
      longitude = 80.2210,
      photo_url = null,
      audio_url = null,
      is_demo = 0
    } = req.body;

    if (!description) {
      return res.status(400).json({ success: false, error: 'Description of help needed is required' });
    }

    const id = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    execute(
      `INSERT INTO assistance_requests (
        id, citizen_id, citizen_name, citizen_phone, category, severity,
        description, area, latitude, longitude, status, photo_url, audio_url,
        is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)`,
      [
        id, citizen_id, citizen_name, citizen_phone, category, severity,
        description, area, latitude, longitude, photo_url, audio_url,
        is_demo ? 1 : 0, now, now
      ]
    );

    const created = queryOne('SELECT * FROM assistance_requests WHERE id = ?', [id]);
    broadcastEvent('assistance_requests', 'INSERT', created);

    // Create incident marker as well for the map if severity is high or rescue
    const incId = `inc-help-${Date.now()}`;
    execute(
      `INSERT INTO incidents (
        id, reporter_id, reporter_name, reporter_phone, type, severity, description,
        area, latitude, longitude, status, verification_status, number_affected,
        is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'EMERGENCY', ?, ?, ?, ?, ?, 'ACTIVE', 'UNDER_VERIFICATION', 1, ?, ?, ?)`,
      [
        incId, citizen_id, citizen_name, citizen_phone, severity,
        `[HELP REQUEST: ${category}] ${description}`, area, latitude, longitude,
        is_demo ? 1 : 0, now, now
      ]
    );
    const mapIncident = queryOne('SELECT * FROM incidents WHERE id = ?', [incId]);
    broadcastEvent('incidents', 'INSERT', mapIncident);

    // Also send broadcast notification
    const notifId = `notif-${Date.now()}`;
    execute(
      `INSERT INTO notifications (id, user_id, title, message, type, related_entity_id, is_read, created_at)
       VALUES (?, NULL, ?, ?, 'ASSISTANCE_UPDATE', ?, 0, ?)`,
      [notifId, `🆘 New Help Request: ${category} in ${area}`, description, id, now]
    );
    broadcastEvent('notifications', 'INSERT', {
      id: notifId,
      title: `🆘 New Help Request: ${category} in ${area}`,
      message: description,
      type: 'ASSISTANCE_UPDATE',
      created_at: now
    });

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST volunteer accepts request
router.post('/:id/accept', (req: Request, res: Response) => {
  try {
    const {
      volunteer_id = 'user-vol-1',
      volunteer_name = 'Senthil Kumar (Volunteer)',
      volunteer_phone = '+91 98840 99887'
    } = req.body;

    const existing = queryOne('SELECT * FROM assistance_requests WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Assistance request not found' });
    }

    const now = new Date().toISOString();

    // Update assistance request
    execute(
      `UPDATE assistance_requests SET
        status = 'ACCEPTED',
        assigned_volunteer_id = ?,
        assigned_volunteer_name = ?,
        assigned_volunteer_phone = ?,
        updated_at = ?
      WHERE id = ?`,
      [volunteer_id, volunteer_name, volunteer_phone, now, req.params.id]
    );

    // Insert volunteer assignment
    const assignId = `assign-${Date.now()}`;
    execute(
      `INSERT INTO volunteer_assignments (id, assistance_request_id, volunteer_id, status, safety_acknowledged, created_at, updated_at)
       VALUES (?, ?, ?, 'ASSIGNED', 1, ?, ?)`,
      [assignId, req.params.id, volunteer_id, now, now]
    );

    // Create Notification specifically for citizen
    const notifId = `notif-${Date.now()}`;
    execute(
      `INSERT INTO notifications (id, user_id, title, message, type, related_entity_id, is_read, created_at)
       VALUES (?, ?, 'Volunteer Assigned', ?, 'ASSISTANCE_UPDATE', ?, 0, ?)`,
      [notifId, existing.citizen_id, `${volunteer_name} has accepted your request and is coordinating assistance.`, req.params.id, now]
    );

    const updated = queryOne('SELECT * FROM assistance_requests WHERE id = ?', [req.params.id]);
    broadcastEvent('assistance_requests', 'UPDATE', updated);
    broadcastEvent('notifications', 'INSERT', {
      id: notifId,
      user_id: existing.citizen_id,
      title: 'Volunteer Assigned',
      message: `${volunteer_name} has accepted your request.`,
      type: 'ASSISTANCE_UPDATE',
      created_at: now
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST volunteer or admin updates status (IN_PROGRESS, COMPLETED, CANCELLED)
router.post('/:id/status', (req: Request, res: Response) => {
  try {
    const { status, note } = req.body;
    if (!['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const existing = queryOne('SELECT * FROM assistance_requests WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const now = new Date().toISOString();
    execute(
      `UPDATE assistance_requests SET status = ?, updated_at = ? WHERE id = ?`,
      [status, now, req.params.id]
    );

    // Log update
    execute(
      `INSERT INTO audit_logs (id, user_id, action, table_name, record_id, details, created_at)
       VALUES (?, 'volunteer-action', 'UPDATE_ASSISTANCE_STATUS', 'assistance_requests', ?, ?, ?)`,
      [`audit-${Date.now()}`, req.params.id, JSON.stringify({ status, note }), now]
    );

    const updated = queryOne('SELECT * FROM assistance_requests WHERE id = ?', [req.params.id]);
    broadcastEvent('assistance_requests', 'UPDATE', updated);

    // Notify citizen
    const message = status === 'IN_PROGRESS'
      ? 'Help is on the way! Your volunteer is actively responding.'
      : status === 'COMPLETED'
      ? 'Your assistance request has been marked completed. Stay safe!'
      : `Request status updated to ${status}`;

    const notifId = `notif-${Date.now()}`;
    execute(
      `INSERT INTO notifications (id, user_id, title, message, type, related_entity_id, is_read, created_at)
       VALUES (?, ?, ?, ?, 'ASSISTANCE_UPDATE', ?, 0, ?)`,
      [notifId, existing.citizen_id, `Assistance: ${status}`, message, req.params.id, now]
    );
    broadcastEvent('notifications', 'INSERT', {
      id: notifId,
      user_id: existing.citizen_id,
      title: `Assistance: ${status}`,
      message,
      type: 'ASSISTANCE_UPDATE',
      created_at: now
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
