import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  console.error('Required variables: SUPABASE_URL, SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client for public operations
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create Supabase client with service role for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

// Database connection test
export const testConnection = async () => {
  try {
    const { count, error } = await supabase
      .from('farmers')
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      console.error('Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
};

// Helper function to handle database errors
export const handleDatabaseError = (error, operation = 'database operation') => {
  console.error(`Database error during ${operation}:`, error);
  
  if (error.code === 'PGRST116') {
    return { error: 'Record not found', code: 404 };
  }
  
  if (error.code === '23505') {
    return { error: 'Record already exists', code: 409 };
  }
  
  if (error.code === '23503') {
    return { error: 'Referenced record not found', code: 400 };
  }
  
  return { error: error.message || 'Database operation failed', code: 500 };
};

export default { supabase, supabaseAdmin, testConnection, handleDatabaseError };