import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the root
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  console.log("Checking user: verticetester@gmail.com");
  
  // 1. Get profile
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'verticetester@gmail.com')
    .single();
    
  if (profileErr || !profile) {
    console.error("Profile not found or error:", profileErr);
    return;
  }
  
  console.log("Found Profile:", { id: profile.id, code: profile.collector_code });
  
  // 2. Get stickers
  const { data: stickers, error: stickersErr } = await supabase
    .from('user_stickers')
    .select('*')
    .eq('user_id', profile.id);
    
  if (stickersErr) {
    console.error("Error fetching stickers:", stickersErr);
    return;
  }
  
  console.log(`Found ${stickers?.length || 0} stickers saved in the database.`);
  if (stickers && stickers.length > 0) {
    console.log("Sample of stickers:", stickers.slice(0, 3));
  }
}

checkUser();
