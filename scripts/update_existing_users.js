import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const nameMappings = {
  'hugesco@gmail.com': 'Hugo Escobar',
  'hugoescobarleon@gmail.com': 'Hugo Escobar',
  'verticetester@gmail.com': 'Vértice Tester',
  'prueba2026@gmail.com': 'Prueba 2026',
  'huntereg2023@gmail.com': 'Hunter EG',
  'geescobar@elvallecolegio.edu.gt': 'G. Escobar'
};

async function updateProfiles() {
  console.log("Starting correction of existing user names...");
  
  for (const [email, realName] of Object.entries(nameMappings)) {
    console.log(`Updating ${email} -> ${realName}...`);
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: realName })
      .eq('email', email)
      .select();
      
    if (error) {
      console.error(`Error updating ${email}:`, error.message);
    } else {
      console.log(`Successfully updated ${email}!`, data);
    }
  }
  
  console.log("All existing user names successfully corrected.");
}

updateProfiles();
