import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://emsqddntqfglgwfmhres.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtc3FkZG50cWZnbGd3Zm1ocmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTgyMDQsImV4cCI6MjA4ODYzNDIwNH0.gOSVhUQyoyUeRaPMOBOF6ex5NAmggZUQGBNxzxXoFec';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
  const { data, error } = await supabase
    .from('leads')
    .insert([{ name: 'test', email: 'test@example.com', resource: 'research-5' }]);

  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Success:", data);
  }
}

testInsert();
