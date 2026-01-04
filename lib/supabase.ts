import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tacphsytydcfugczcjfu.supabase.co';
const supabaseAnonKey = 'sb_publishable_wv84jEE3lHu0HgxgdUAqng_y0AOUiSR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
