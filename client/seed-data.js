import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxqwthmvujmtofkscezs.supabase.co';
const supabaseKey = 'sb_publishable_GS6pcwDR7dP9GYbFr6zzEA_q2s88Ydh';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting seed...');

  // 1. Seed Alerts
  const alerts = [
    {
      title: 'Cyclonic Storm Warning',
      message: 'Heavy to very heavy rainfall expected in the next 24 hours. Please stay indoors.',
      severity: 'critical',
      area: 'Chennai Coastal Areas'
    },
    {
      title: 'Water Release from Chembarambakkam',
      message: '500 cusecs of water being released. Low lying areas near Adyar river be on alert.',
      severity: 'warning',
      area: 'Adyar River Banks'
    }
  ];

  for (const alert of alerts) {
    const { error } = await supabase.from('alerts').insert(alert);
    if (error) console.error('Error inserting alert:', error.message);
    else console.log('Inserted alert:', alert.title);
  }

  // 2. Seed more realistic incidents (with random realistic locations near Chennai)
  const incidents = [
    {
      type: 'flood',
      severity: 'high',
      description: 'Water level rising quickly in residential street',
      latitude: 12.9785,
      longitude: 80.2215,
      address: 'Velachery Bypass Road',
      status: 'reported'
    },
    {
      type: 'cyclone',
      severity: 'low',
      description: 'Tree fallen on the road, blocking traffic',
      latitude: 12.9355,
      longitude: 80.2140,
      address: 'Pallikaranai Main Road',
      status: 'verified'
    }
  ];

  for (const incident of incidents) {
    const { error } = await supabase.from('incidents').insert(incident);
    if (error) console.error('Error inserting incident:', error.message);
    else console.log('Inserted incident:', incident.type);
  }

  console.log('Seeding finished!');
}

seed();
