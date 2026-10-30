import { createClient } from '@supabase/supabase-js';

// Claves puestas directamente para evitar configurar Vercel
const supabaseUrl = "https://cjwsdnddyxioqftxpmog.supabase.co";
const supabaseKey = "sb_publishable_ND_cgDdkm42yeo-MMjiARA_Xts9mRzf";

export const supabase = createClient(supabaseUrl, supabaseKey);