import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://emsqddntqfglgwfmhres.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtc3FkZG50cWZnbGd3Zm1ocmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTgyMDQsImV4cCI6MjA4ODYzNDIwNH0.gOSVhUQyoyUeRaPMOBOF6ex5NAmggZUQGBNxzxXoFec';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkColumns() {
  const candidates = [
    'id', 'role', 'field_of_study', 'tried_research', 'biggest_challenge',
    'google_search', 'email', 'created_at',
    // possible for interests
    'research_interests', 'why_interested', 'motivation', 'reasons',
    // possible for outcome
    'desired_outcome', 'primary_outcome', 'goal', 'priority',
    // possible for book_wish
    'book_feedback', 'wish', 'book_sentence', 'sentence_completion',
    // possible for follow_up
    'wants_followup', 'followup_interest', 'contact_ok', 'open_to_chat',
    // other common
    'name', 'response', 'notes', 'source', 'utm_source',
  ];

  console.log('Checking columns on book_survey:');
  for (const col of candidates) {
    const { error } = await supabase
      .from('book_survey')
      .select(col)
      .limit(0);
    
    if (!error) {
      console.log(`  ✓ ${col}`);
    }
  }
}

checkColumns();
