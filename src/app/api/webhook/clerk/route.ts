import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  
  // Log environment variables (excluding sensitive values)
  console.log('Environment check:', {
    hasWebhookSecret: !!WEBHOOK_SECRET,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
  }

  // Initialize Supabase with service role key for admin access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    console.log('Webhook: Creating new user:', evt.data);
    
    try {
      // Create user in Supabase
      const { id, email_addresses, created_at } = evt.data;
      const primaryEmail = email_addresses[0]?.email_address;

      console.log('Creating user with data:', {
        id,
        email: primaryEmail,
        created_at
      });

      // First, check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('Error checking existing user:', checkError);
      }

      if (existingUser) {
        console.log('User already exists:', existingUser);
        return new Response('User already exists', { status: 200 });
      }

      // Create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: id,
          email: primaryEmail,
          subscription_tier: 'free',
          subscription_status: 'active',
          created_at: new Date(created_at).toISOString(),
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user:', userError);
        return new Response(JSON.stringify({ error: userError }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('User created successfully:', userData);

      // Create default preferences
      const { data: prefData, error: prefError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: id,
          min_price: 0,
          max_price: 10000000,
          industries: ['All'],
          newsletter_frequency: 'weekly'
        })
        .select()
        .single();

      if (prefError) {
        console.error('Error creating preferences:', prefError);
        return new Response(JSON.stringify({ error: prefError }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('Preferences created successfully:', prefData);

      return new Response(JSON.stringify({ success: true, user: userData, preferences: prefData }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Unexpected error in webhook handler:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Webhook processed', { status: 200 });
} 