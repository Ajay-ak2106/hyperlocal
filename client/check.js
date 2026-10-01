import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxqwthmvujmtofkscezs.supabase.co';
const supabaseKey = 'sb_publishable_GS6pcwDR7dP9GYbFr6zzEA_q2s88Ydh';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('incidents').select('*');
  console.log(data);
}
check();
