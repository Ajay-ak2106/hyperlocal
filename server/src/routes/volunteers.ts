import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { broadcastEvent } from '../realtime.js';

const router = Router();

// GET all volunteers
router.get('/', (req: Request, res: Response) => {
  try {
    const volunteers = queryAll('SELECT * FROM volunteers ORDER BY created_at DESC');
    const skills = queryAll('SELECT * FROM volunteer_skills');

    // Attach skills
    const volunteersWithSkills = volunteers.map(v => {
      const vSkills = skills.filter(s => s.volunteer_id === v.id).map(s => s.skill_name);
      return {
        ...v,
        skills: vSkills
      };
    });

    res.json({ success: true, data: volunteersWithSkills });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST register volunteer
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      id = `vol-${Date.now()}`,
      full_name,
      phone,
      area,
      latitude = 12.9780,
      longitude = 80.2210,
      emergency_contact = '',
      has_vehicle = false,
      vehicle_type = '',
      skills = []
    } = req.body;

    if (!full_name || !phone || !area) {
      return res.status(400).json({ success: false, error: 'Full name, phone, and area are required' });
    }

    const now = new Date().toISOString();

    // Check if user exists in users table
    const existingUser = queryOne('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      execute(
        `INSERT INTO users (id, email, role, created_at, updated_at) VALUES (?, ?, 'VOLUNTEER', ?, ?)`,
        [id, `${phone.replace(/\D/g, '')}@volunteer.nammarescue.org`, now, now]
      );
    }

    // Insert volunteer record
    execute(
      `INSERT INTO volunteers (
        id, full_name, phone, area, latitude, longitude, availability_status,
        emergency_contact, has_vehicle, vehicle_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE', ?, ?, ?, ?, ?)`,
      [
        id, full_name, phone, area, latitude, longitude,
        emergency_contact, has_vehicle ? 1 : 0, vehicle_type, now, now
      ]
    );

    // Insert skills
    if (Array.isArray(skills)) {
      for (const skill of skills) {
        execute(
          `INSERT INTO volunteer_skills (id, volunteer_id, skill_name, created_at)
           VALUES (?, ?, ?, ?)`,
          [`vs-${Date.now()}-${Math.floor(Math.random() * 10000)}`, id, skill, now]
        );
      }
    }

    const created = queryOne('SELECT * FROM volunteers WHERE id = ?', [id]);
    broadcastEvent('volunteers', 'INSERT', { ...created, skills });

    res.status(201).json({ success: true, data: { ...created, skills } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST match volunteers for a request
router.post('/match', (req: Request, res: Response) => {
  try {
    const { category, area, latitude, longitude } = req.body;

    const volunteers = queryAll('SELECT * FROM volunteers WHERE availability_status = "AVAILABLE"');
    const skills = queryAll('SELECT * FROM volunteer_skills');

    // Rule-based qualification matching
    const requiredSkillsMap: Record<string, string[]> = {
      RESCUE: ['FLOOD RESCUE', 'SWIMMING', 'BOAT OPERATION'],
      MEDICAL: ['MEDICAL', 'CPR', 'FIRST AID'],
      AMBULANCE: ['MEDICAL', 'DRIVING', 'FIRST AID'],
      FOOD: ['FOOD DISTRIBUTION', 'LOGISTICS', 'DRIVING'],
      WATER: ['LOGISTICS', 'DRIVING'],
      ELDERLY: ['FIRST AID', 'ELDER CARE', 'COMMUNICATION'],
      DISABILITY: ['FIRST AID', 'LOGISTICS']
    };

    const targetSkills = requiredSkillsMap[category] || [];

    const scoredVolunteers = volunteers.map(v => {
      const vSkills = skills.filter(s => s.volunteer_id === v.id).map(s => s.skill_name);
      let matchScore = 0;

      // Area match
      if (v.area && area && v.area.toLowerCase() === area.toLowerCase()) {
        matchScore += 40;
      }

      // Skill match
      const matchingSkills = vSkills.filter(s => targetSkills.includes(s));
      matchScore += matchingSkills.length * 20;

      // Distance estimation if lat/lng available
      let distanceKm = 5;
      if (latitude && longitude && v.latitude && v.longitude) {
        const dLat = (v.latitude - latitude) * 111;
        const dLng = (v.longitude - longitude) * 111;
        distanceKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
        if (distanceKm < 3) matchScore += 30;
        else if (distanceKm < 7) matchScore += 15;
      }

      return {
        ...v,
        skills: vSkills,
        distanceKm,
        matchScore,
        isHighRiskQualified: category === 'RESCUE' ? vSkills.some(s => ['FLOOD RESCUE', 'SWIMMING', 'BOAT OPERATION'].includes(s)) : true
      };
    });

    // Sort by match score descending
    scoredVolunteers.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: scoredVolunteers.slice(0, 10),
      safety_advisory: category === 'RESCUE'
        ? '⚠️ High Risk Operation: Only assign volunteers certified in Swimming, Flood Rescue, or Boat Operations.'
        : null
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
