import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
// Try multiple possible key names based on common conventions and UI truncation
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.SUPABASE_SERVICE_KEY || 
                    process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase credentials missing (URL or Service Role Key).');
  console.log('Available Env Vars (Masked):', Object.keys(process.env).filter(k => k.startsWith('SUPABASE')));
} else {
  console.log('Supabase client initialized.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Immediate check on boot
async function checkConnection() {
    if (!supabaseUrl || !supabaseKey) return;
    try {
        const { data, error, count } = await supabase.from('categories').select('*', { count: 'exact', head: true });
        if (error) {
            console.error('Supabase RLS/Connection Issue:', error.message);
            if (error.message.includes('row-level security')) {
                console.warn('ACTION REQUIRED: Disable RLS for "categories" or add a policy for Service Role.');
            }
        } else {
            console.log('Supabase Online. Category Count:', count);
        }
    } catch (err) {
        console.error('Supabase Boot Check Error:', err.message);
    }
}

checkConnection();
