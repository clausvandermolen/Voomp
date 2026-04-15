import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://viynlmmlvjuuzlbschum.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeW5sbW1sdmp1dXpsYnNjaHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODc5MTksImV4cCI6MjA5MTE2MzkxOX0.OCUVviRWytbsor1plD8SF0PqlS7F-3TG5QPxHEJtBtY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
