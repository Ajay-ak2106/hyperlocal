import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { broadcastEvent } from '../realtime.js';

const router = Router();

// GET all shelters
router.get('/', (req: Request, res: Response) => {
  try {
    const shelters = queryAll('SELECT * FROM shelters ORDER BY name ASC');
    res.json({ success: true, data: shelters });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update shelter occupancy or status
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { current_occupancy, status, change_delta } = req.body;
    const existing = queryOne('SELECT * FROM shelters WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Shelter not found' });
    }

    let newOccupancy = existing.current_occupancy;
    if (change_delta !== undefined) {
      newOccupancy = Math.max(0, newOccupancy + Number(change_delta));
    } else if (current_occupancy !== undefined) {
      newOccupancy = Math.max(0, Number(current_occupancy));
    }

    // Capacity constraint: do not allow occupancy > capacity
    if (newOccupancy > existing.capacity) {
      return res.status(400).json({
        success: false,
        error: `Cannot exceed maximum shelter capacity of ${existing.capacity}`
      });
    }

    // Auto-calculate status if not explicitly overridden
    let newStatus = status;
    if (!newStatus) {
      if (newOccupancy >= existing.capacity) {
        newStatus = 'FULL';
      } else if (newOccupancy >= existing.capacity * 0.8) {
        newStatus = 'LIMITED';
      } else {
        newStatus = 'AVAILABLE';
      }
    }

    const now = new Date().toISOString();
    execute(
      `UPDATE shelters SET current_occupancy = ?, status = ?, updated_at = ? WHERE id = ?`,
      [newOccupancy, newStatus, now, req.params.id]
    );

    const updated = queryOne('SELECT * FROM shelters WHERE id = ?', [req.params.id]);
    broadcastEvent('shelters', 'UPDATE', updated);

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
