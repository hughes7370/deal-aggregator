import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Get the headers
    const headersList = headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occurred -- no svix headers', {
        status: 400
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create a new SVIX instance with your secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occurred', {
        status: 400
      });
    }

    // Handle the webhook
    const eventType = evt.type;
    
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, ...attributes } = evt.data;
      
      const email = email_addresses[0]?.email_address;
      
      if (!email) {
        return new Response('No email found', { status: 400 });
      }

      try {
        // First, create/update the user in the users table
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: id,
            email: email,
            first_name: first_name || null,
            last_name: last_name || null,
            subscription_tier: 'free',
            subscription_status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (userError) {
          console.error('Error upserting user:', userError);
          return new Response('Error updating user', { status: 500 });
        }

        // Then, create/update user preferences
        const { error: prefError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: id,
            email: email,
            created_at: new Date().toISOString(),
            min_price: 0,
            max_price: 1000000,
            industries: [],
            alert_frequency: 'daily'
          }, {
            onConflict: 'user_id'
          });

        if (prefError) {
          console.error('Error upserting preferences:', prefError);
          return new Response('Error updating preferences', { status: 500 });
        }

        return new Response('User and preferences updated', { status: 200 });
      } catch (error) {
        console.error('Error in database operations:', error);
        return new Response('Database error', { status: 500 });
      }
    }

    return new Response('', { status: 200 });
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 