// Supabase Edge Function: submit-post
//
// This is the trusted, server-side path for creating a guestbook post.
// It is the only place that:
//   - re-validates input (never trusts the client's own validation),
//   - normalizes and moderates the message against the real blocked-word
//     list (which never ships to the browser),
//   - applies basic rate-limiting / duplicate-post protection,
//   - and only then inserts the row, using the service-role key.
//
// The service-role key lives ONLY in this function's environment
// (Supabase sets SUPABASE_SERVICE_ROLE_KEY automatically for every Edge
// Function) and is never exposed to BrowserOS or any other frontend code.
//
// Deploy with:
//   supabase functions deploy submit-post
//
// Flow:
//   request -> validate -> normalize -> moderate -> rate-limit check
//     -> insert -> { post } (200)
//   on any rejection -> { code, message } (4xx), nothing is inserted.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const NAME_MAX = 50;
const MESSAGE_MAX = 500;

// Real moderation list — deliberately only lives server-side. Keep this
// maintained here (or swap for a hosted moderation API — see the comment
// near `moderate()` below) rather than scattering checks elsewhere.
const BLOCKED_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'piss',
  'slut', 'whore', 'nigger', 'nigga', 'faggot', 'retard', 'rape',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function normalize(text: string) {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Local, dependency-free moderation check. Structured as its own function
 * with a stable (allowed: boolean) return shape specifically so it can
 * later be swapped for a call to a hosted moderation provider (e.g. an
 * external content-moderation API) without touching any other part of
 * this function — the request/response contract stays identical.
 */
function moderate(text: string): { allowed: boolean } {
  const normalized = normalize(text);
  const collapsed = normalized.replace(/\s+/g, '');
  const hit = BLOCKED_WORDS.some(
    (word) => normalized.includes(word) || collapsed.includes(word)
  );
  return { allowed: !hit };
}

function validate(name: string, message: string) {
  const trimmedName = name?.trim() ?? '';
  const trimmedMessage = message?.trim() ?? '';

  if (!trimmedName) return { field: 'name', message: 'Please enter your name.' };
  if (trimmedName.length > NAME_MAX) {
    return { field: 'name', message: `Name must be ${NAME_MAX} characters or less.` };
  }
  if (!trimmedMessage) return { field: 'message', message: 'Please enter a message.' };
  if (trimmedMessage.length > MESSAGE_MAX) {
    return { field: 'message', message: `Message must be ${MESSAGE_MAX} characters or less.` };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed.' }, 405);
  }

  let body: { name?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return json({ code: 'BAD_REQUEST', message: 'Invalid request body.' }, 400);
  }

  const name = typeof body.name === 'string' ? body.name : '';
  const message = typeof body.message === 'string' ? body.message : '';

  const validationError = validate(name, message);
  if (validationError) {
    return json({ code: 'VALIDATION_FAILED', message: validationError.message }, 400);
  }

  const trimmedName = name.trim();
  const trimmedMessage = message.trim();

  const { allowed } = moderate(trimmedMessage) as { allowed: boolean };
  const nameModeration = moderate(trimmedName) as { allowed: boolean };
  if (!allowed || !nameModeration.allowed) {
    return json(
      {
        code: 'MODERATION_REJECTED',
        message:
          "This message contains language that isn't allowed. Please revise it and try again.",
      },
      422
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ code: 'SERVER_MISCONFIGURED', message: 'Community is not configured.' }, 500);
  }

  // Service-role client: bypasses RLS, but only from here, server-side.
  const admin = createClient(supabaseUrl, serviceRoleKey);

  // --- Lightweight abuse protection -----------------------------------
  // 1) Duplicate-post guard: identical name+message within the last 30s.
  // 2) Simple rate limit: more than 5 posts from the same name in the
  //    last minute is treated as abuse. Both are best-effort (a public,
  //    anonymous guestbook can't reliably identify unique visitors
  //    without adding friction like accounts/IP capture), and are meant
  //    to catch accidental double-submits and basic spam bursts rather
  //    than a determined attacker — Turnstile/Cloudflare (see README) is
  //    the recommended next layer if this app sees real abuse.
  const now = Date.now();
  const { data: recent, error: recentError } = await admin
    .from('guestbook')
    .select('name, message, created_at')
    .eq('name', trimmedName)
    .gte('created_at', new Date(now - 60_000).toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  if (!recentError && recent) {
    const duplicate = recent.find(
      (row) =>
        row.message === trimmedMessage &&
        now - new Date(row.created_at).getTime() < 30_000
    );
    if (duplicate) {
      return json(
        { code: 'DUPLICATE', message: "You've already posted that message." },
        429
      );
    }
    if (recent.length >= 5) {
      return json(
        { code: 'RATE_LIMITED', message: "You're posting too quickly. Please wait a moment and try again." },
        429
      );
    }
  }

  const { data: inserted, error: insertError } = await admin
    .from('guestbook')
    .insert({ name: trimmedName, message: trimmedMessage })
    .select('id, name, message, created_at')
    .single();

  if (insertError || !inserted) {
    console.error('[submit-post] insert failed:', insertError);
    return json(
      { code: 'INSERT_FAILED', message: "Couldn't post your message. Please try again." },
      500
    );
  }

  return json({ post: inserted }, 200);
});
