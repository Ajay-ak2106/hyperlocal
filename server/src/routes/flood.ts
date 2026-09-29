import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { broadcastEvent } from '../realtime.js';

const router = Router();

// GET all flood reports
router.get('/', (req: Request, res: Response) => {
  try {
    const reports = queryAll('SELECT * FROM flood_reports ORDER BY created_at DESC');
    res.json({ success: true, data: reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST dedicated flood report
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      reporter_id,
      reporter_name = 'Citizen Reporter',
      condition = 'WATER_ON_ROAD',
      description = '',
      area = 'Velachery',
      latitude = 12.9780,
      longitude = 80.2210,
      photo_url = null,
      audio_url = null,
      is_demo = 0
    } = req.body;

    // Automated heuristic AI estimation based on condition
    let water_level_estimate = 'AI ESTIMATE: Ankle Level (< 1.0 ft)';
    let severity = 'LOW';

    if (condition === 'WATER_ON_ROAD') {
      water_level_estimate = 'AI ESTIMATE: Ankle Level (0.5 - 1.0 ft)';
      severity = 'LOW';
    } else if (condition === 'FLOODED_STREET') {
      water_level_estimate = 'AI ESTIMATE: Knee Level (1.5 - 2.5 ft)';
      severity = 'MEDIUM';
    } else if (condition === 'VEHICLES_AFFECTED' || condition === 'ROAD_BLOCKED') {
      water_level_estimate = 'AI ESTIMATE: Knee to Waist Level (2.0 - 3.5 ft)';
      severity = 'HIGH';
    } else if (condition === 'WATER_ENTERING_HOUSE') {
      water_level_estimate = 'AI ESTIMATE: Waist Level (3.0 - 4.0 ft)';
      severity = 'HIGH';
    } else if (condition === 'DANGEROUS_WATER_LEVEL') {
      water_level_estimate = 'AI ESTIMATE: Chest Level / Submerged (> 4.5 ft)';
      severity = 'CRITICAL';
    }

    const id = `fl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    // 1. Insert into flood_reports
    execute(
      `INSERT INTO flood_reports (
        id, reporter_id, reporter_name, condition, water_level_estimate,
        description, area, latitude, longitude, photo_url, audio_url,
        status, is_demo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, reporter_id || null, reporter_name, condition, water_level_estimate,
        description, area, latitude, longitude, photo_url, audio_url,
        'ACTIVE', is_demo ? 1 : 0, now
      ]
    );

    const createdReport = queryOne('SELECT * FROM flood_reports WHERE id = ?', [id]);
    broadcastEvent('flood_reports', 'INSERT', createdReport);

    // 2. Also create an incident marker so it displays on map & alert queues
    const incId = `inc-fl-${Date.now()}`;
    const incDesc = `[Flood Report: ${condition.replace(/_/g, ' ')}] ${water_level_estimate}. ${description || 'Flooding reported in area.'}`;
    execute(
      `INSERT INTO incidents (
        id, reporter_id, reporter_name, type, severity, description,
        area, latitude, longitude, status, verification_status,
        number_affected, photo_url, audio_url, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        incId, reporter_id || null, reporter_name, 'FLOOD', severity, incDesc,
        area, latitude, longitude, 'ACTIVE', 'UNDER_VERIFICATION',
        10, photo_url, audio_url, is_demo ? 1 : 0, now, now
      ]
    );

    const createdIncident = queryOne('SELECT * FROM incidents WHERE id = ?', [incId]);
    broadcastEvent('incidents', 'INSERT', createdIncident);

    res.status(201).json({
      success: true,
      data: {
        flood_report: createdReport,
        incident: createdIncident
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
