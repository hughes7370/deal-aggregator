import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  console.log("Received webhook request");
  
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log("Webhook headers:", { svix_id, svix_timestamp, svix_signature });

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

  // Verify the payload with the headers
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

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Handle the webhook
  const eventType = evt.type;
  console.log("Processing webhook event:", eventType);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, primary_email_address_id, ...attributes } = evt.data;
    
    // Find the primary email
    const primaryEmail = email_addresses?.find(
      email => email.id === primary_email_address_id
    )?.email_address;

    console.log("Upserting user to Supabase:", { id, primaryEmail });

    if (!primaryEmail) {
      console.error("No primary email found for user");
      return new Response(JSON.stringify({ error: "No primary email found" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upsert user to Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id,
        email: primaryEmail,
        subscription_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select();

    if (error) {
      console.error('Error upserting user to Supabase:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("Successfully upserted user:", data);
  }

  return new Response(JSON.stringify({ success: true }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
} 