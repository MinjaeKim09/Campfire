#!/usr/bin/env node
/**
 * Seeds 100 English comments across existing posts.
 * About 15 are blind ads from brand accounts whose display_name ends in "(Ad)".
 *
 * Run:
 *   SUPABASE_SERVICE_ROLE_KEY=... node --env-file=.env scripts/seed-comments.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------- 1. Brand (ad) accounts ----------
const AD_BRANDS = [
  { email: 'mui-ad@campfire.app',         name: 'MUI(Ad)' },
  { email: 'pocha-house-ad@campfire.app', name: 'Pocha House(Ad)' },
  { email: 'boba-tiger-ad@campfire.app',  name: 'Boba Tiger(Ad)' },
  { email: 'studio-h-ad@campfire.app',    name: 'Studio H(Ad)' },
  { email: 'k-beauty-ad@campfire.app',    name: 'K Beauty Lab(Ad)' },
  { email: 'gangnam-cafe-ad@campfire.app',name: 'Gangnam Café(Ad)' },
  { email: 'seoul-eats-ad@campfire.app',  name: 'Seoul Eats(Ad)' },
];

const adIdByName = new Map();
for (const b of AD_BRANDS) {
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: b.email,
    password: 'AdAccount!2026',
    email_confirm: true,
    user_metadata: { display_name: b.name },
  });
  let userId = created?.user?.id;
  if (createErr && !/already.*registered|already.*been registered|already exists/i.test(createErr.message)) {
    console.error(b.email, 'createUser failed:', createErr.message);
    continue;
  }
  if (!userId) {
    let page = 1;
    while (!userId) {
      const { data: list } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      const found = list.users.find((x) => x.email === b.email);
      if (found) { userId = found.id; break; }
      if (list.users.length < 200) break;
      page += 1;
    }
  }
  if (!userId) continue;
  await admin
    .from('profiles')
    .upsert({ id: userId, email: b.email, display_name: b.name, is_admin: false }, { onConflict: 'id' });
  adIdByName.set(b.name, userId);
}
console.log(`ad brands ready: ${adIdByName.size}/${AD_BRANDS.length}`);

// ---------- 2. Resolve organic commenter ids ----------
const ORGANIC_EMAILS = [
  'admin@campfire.app',
  'minjae@campfire.app',
  'alex@campfire.app',
  'lynn@campfire.app',
  'doyeon@campfire.app',
  'namin@campfire.app',
  'kent@campfire.app',
];
const idByEmail = new Map();
{
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  list.users.forEach((u) => { if (u.email) idByEmail.set(u.email, u.id); });
}
const organicIds = ORGANIC_EMAILS.map((e) => idByEmail.get(e)).filter(Boolean);

// ---------- 3. Pull existing posts to attach comments ----------
const { data: postRows } = await admin
  .from('posts')
  .select('id')
  .order('created_at', { ascending: false })
  .limit(200);
const postIds = (postRows ?? []).map((p) => p.id);
if (postIds.length === 0) {
  console.error('no posts found.');
  process.exit(1);
}

// ---------- 4. Comment pool ----------
const ORGANIC = [
  'lol fr',
  'this is so real',
  'thank you for posting this, was looking for the same thing',
  'wait when did this open?',
  'do you have an address?',
  'saving this',
  'tagging my roommate rn',
  'literally just talked about this last night',
  'is this still up?',
  'dm me, i had the same situation last semester',
  'i second this',
  'agreed, professor was super chill',
  'midterm was harder than i thought tbh',
  'is the deadline still 4/30?',
  'someone please post the venmo',
  'do they take card or cash only?',
  'tysm',
  'omg this is exactly what i needed today',
  'yes!! finally someone said it',
  'the line was insane last weekend',
  'price went up since last month, fyi',
  'free seats? or do you have to RSVP',
  'how many people fit in the room',
  'im in stern, can i still join?',
  'do they speak korean?',
  'is parking available nearby',
  'great post, more like this please',
  'hard agree',
  'fr fr',
  'lmao yes',
  'i went there last week, food was solid 8/10',
  'avoid the chicken stew, get the bossam',
  'they have a student discount on weekdays',
  'follow up question: what time do they close?',
  'screenshot saved',
  'this saved me hours, ty',
  'underrated take',
  'controversial but i actually disagree',
  'eh, i had a bad experience tbh',
  'who is going on saturday? need a buddy',
  'reply if you wanna split a cab',
  'i can carpool from williamsburg',
  'commuting from queens — anyone same route?',
  'we should make a group chat',
  'count me in',
  'add me to the chat',
  'is this free for cuny students too?',
  'venue please',
  'just RSVPed',
  'how do i sign up',
  'did anyone get the spreadsheet link',
  'mods, can you pin this?',
  'updates? still looking for the same thing',
  'asking for a friend',
  'lol the first post i actually saved',
  'btw they raised prices recently',
  'tipping in cash works better there',
  'food was meh, vibes were great',
  'best to go before 7pm to avoid the rush',
  'thank you i was about to ask',
  'anyone interested in splitting a sublet for june?',
  'is the building safe at night',
  'wifi any good',
  'does the laundry work without quarters',
  'they only take ConEd payments now',
  'great, just signed the lease',
  'pls update if anything changes',
  'is there a wait list',
  'we ran a similar event last year and it was packed',
  'so jealous, sounds amazing',
  'sounds fun, tell us how it goes',
  'recap?',
  'pictures or it didnt happen',
  'will there be food provided',
  'are non-koreans welcome too',
  'someone pls explain again',
  'tagging @everyone',
  'bumping this',
  'im a freshman, can i still join?',
  'transfer student here, hi 👋',
  'need a partner for a project, dm me',
  'i can help with photography if needed',
  'i make graphics, dm if you want a flyer',
];

const ADS = [
  { name: 'Pocha House(Ad)',  body: 'k-town best pocha, $5 soju on tuesdays. 32nd 3rd floor.' },
  { name: 'Pocha House(Ad)',  body: 'late night menu till 4am, students get free egg roll w/ student id.' },
  { name: 'MUI(Ad)',          body: 'follow @mui.nyc for student discounts on basics this week.' },
  { name: 'MUI(Ad)',          body: 'free shipping over $50 with code CAMPFIRE — soho store now open.' },
  { name: 'Boba Tiger(Ad)',   body: 'tiger sugar copy? we do it better, free upgrade for first-timers @bobatigernyc.' },
  { name: 'Boba Tiger(Ad)',   body: 'buy one get one free milk tea every monday, k-town and west village.' },
  { name: 'Studio H(Ad)',     body: 'student logo + business card $99, 3 day turnaround. dm @studio.h0me' },
  { name: 'Studio H(Ad)',     body: 'parsons / sva students get 20% off branding packages this semester.' },
  { name: 'K Beauty Lab(Ad)', body: 'free skin consult + sample kit for nyu/columbia students this week. @kbeautylab.nyc' },
  { name: 'K Beauty Lab(Ad)', body: 'ksa members 15% off facials, mention this post at checkout.' },
  { name: 'Gangnam Café(Ad)', body: 'study from 9am-2pm and we comp your second drink. wifi is fast we promise.' },
  { name: 'Gangnam Café(Ad)', body: 'new matcha menu launched, students bring 3 friends and get a free dessert.' },
  { name: 'Seoul Eats(Ad)',   body: 'we deliver to morningside, free banchan upgrade for first orders @seouleats.nyc' },
  { name: 'Seoul Eats(Ad)',   body: 'lunchbox catering for ksa events, dm for student rates.' },
  { name: 'MUI(Ad)',          body: 'campus pop-up at washington sq park this saturday, first 30 get a free tote.' },
];

// ---------- 5. Build the 100 comments ----------
const rows = [];
const now = Date.now();

// 85 organic
for (let i = 0; i < 85; i++) {
  const author = organicIds[Math.floor(Math.random() * organicIds.length)];
  if (!author) continue;
  const body = ORGANIC[Math.floor(Math.random() * ORGANIC.length)];
  const post_id = postIds[Math.floor(Math.random() * postIds.length)];
  const offset = Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000); // up to 2 weeks ago
  rows.push({
    post_id,
    author_id: author,
    body,
    created_at: new Date(now - offset).toISOString(),
  });
}

// 15 ads
for (let i = 0; i < 15; i++) {
  const ad = ADS[i % ADS.length];
  const author = adIdByName.get(ad.name);
  if (!author) continue;
  const post_id = postIds[Math.floor(Math.random() * postIds.length)];
  const offset = Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000);
  rows.push({
    post_id,
    author_id: author,
    body: ad.body,
    created_at: new Date(now - offset).toISOString(),
  });
}

const { error } = await admin.from('comments').insert(rows);
if (error) {
  console.error('insert failed:', error.message);
  process.exit(1);
}
console.log(`inserted ${rows.length} comments (${rows.filter((r) => adIdByName.size && [...adIdByName.values()].includes(r.author_id)).length} ads).`);
