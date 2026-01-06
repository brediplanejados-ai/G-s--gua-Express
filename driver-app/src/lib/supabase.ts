import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzmxfhreazjyjdxkcyzo.supabase.co';
const supabaseAnonKey = 'sb_publishable_fWRczDAx-pMJTzibvPOCDw_MJ12U77H';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
