import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { broadcastEvent } from '../realtime.js';

const router = Router();

// GET campaigns & recent donations
router.get('/', (req: Request, res: Response) => {
  try {
    const campaigns = queryAll('SELECT * FROM fund_campaigns ORDER BY created_at DESC');
    const donations = queryAll('SELECT * FROM donations ORDER BY created_at DESC LIMIT 20');
    res.json({
      success: true,
      data: {
        campaigns,
        donations,
        disclaimer: 'DEMO PAYMENT MODE: For hackathon evaluation only. No real money or card data is processed.'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST make demo donation
router.post('/donate', (req: Request, res: Response) => {
  try {
    const {
      campaign_id = 'camp-1',
      donor_name = 'Kind Citizen',
      donor_email = 'donor@demo.org',
      amount = 500
    } = req.body;

    const donationAmount = Number(amount);
    if (!donationAmount || donationAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid donation amount is required' });
    }

    const campaign = queryOne('SELECT * FROM fund_campaigns WHERE id = ?', [campaign_id]);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const now = new Date().toISOString();
    const txnRef = `TXN_DEMO_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
    const donId = `don-${Date.now()}`;

    // 1. Insert donation record
    execute(
      `INSERT INTO donations (id, campaign_id, donor_name, donor_email, amount, payment_mode, transaction_ref, created_at)
       VALUES (?, ?, ?, ?, ?, 'DEMO_PAYMENT_MODE', ?, ?)`,
      [donId, campaign_id, donor_name, donor_email, donationAmount, txnRef, now]
    );

    // 2. Update campaign totals in database
    const newCollected = Number(campaign.collected_amount) + donationAmount;
    const newDonors = Number(campaign.donor_count) + 1;

    execute(
      `UPDATE fund_campaigns SET collected_amount = ?, donor_count = ? WHERE id = ?`,
      [newCollected, newDonors, campaign_id]
    );

    const updatedCampaign = queryOne('SELECT * FROM fund_campaigns WHERE id = ?', [campaign_id]);
    const donationRecord = queryOne('SELECT * FROM donations WHERE id = ?', [donId]);

    // Broadcast update
    broadcastEvent('fund_campaigns', 'UPDATE', {
      campaign: updatedCampaign,
      recentDonation: donationRecord
    });

    res.status(201).json({
      success: true,
      data: {
        donation: donationRecord,
        campaign: updatedCampaign,
        message: 'Thank you! Demo donation recorded in database successfully.'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
