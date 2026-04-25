#!/usr/bin/env node
/**
 * Creates the admin user via the Supabase service_role key.
 * Run with:
 *   SUPABASE_SERVICE_ROLE_KEY=... node --env-file=.env scripts/create-admin.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@campfire.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Campfire!Admin2026';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
  user_metadata: { display_name: 'Campfire Admin' },
});

let userId = created?.user?.id;

if (createError) {
  if (!/already.*registered|already.*been registered|already exists/i.test(createError.message)) {
    console.error('createUser failed:', createError.message);
    process.exit(1);
  }
  console.log('admin user already exists; reusing.');
}

if (!userId) {
  let page = 1;
  while (!userId) {
    const { data: list, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error('listUsers failed:', error.message);
      process.exit(1);
    }
    const found = list.users.find((u) => u.email === ADMIN_EMAIL);
    if (found) {
      userId = found.id;
      break;
    }
    if (list.users.length < 200) break;
    page += 1;
  }
}

if (!userId) {
  console.error('could not resolve admin user id');
  process.exit(1);
}

const { error: upsertError } = await admin
  .from('profiles')
  .upsert(
    { id: userId, email: ADMIN_EMAIL, display_name: 'Campfire Admin', is_admin: true },
    { onConflict: 'id' }
  );

if (upsertError) {
  console.error('profile upsert failed:', upsertError.message);
  process.exit(1);
}

console.log('admin ready:');
console.log('  email   :', ADMIN_EMAIL);
console.log('  password:', ADMIN_PASSWORD);
console.log('  user_id :', userId);
