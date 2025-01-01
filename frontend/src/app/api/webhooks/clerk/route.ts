import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Get the headers
    const headersList = await headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing webhook headers:', { svix_id, svix_timestamp, svix_signature });
      return new Response('Error occurred -- no svix headers', {
        status: 400
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

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
    console.log('Processing webhook event type:', eventType);
    
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, created_at } = evt.data;
      
      const email = email_addresses[0]?.email_address;
      
      if (!email) {
        console.error('No email found in webhook data');
        return new Response('No email found', { status: 400 });
      }

      console.log('Processing user data:', { id, email });

      try {
        // First check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        console.log('Existing user check:', existingUser);

        // First, create/update the user in the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .upsert({
            id,
            email,
            subscription_tier: 'free',
            subscription_status: 'active',
            created_at: new Date(created_at).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
          .select();

        if (userError) {
          console.error('Error upserting user:', userError);
          return new Response(`Error updating user: ${userError.message}`, { status: 500 });
        }

        console.log('Successfully created/updated user:', userData);

        // Then, create/update user preferences
        const { data: prefData, error: prefError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: id,
            email,
            created_at: new Date(created_at).toISOString(),
            min_price: 0,
            max_price: 1000000,
            industries: [],
            alert_frequency: 'daily'
          }, {
            onConflict: 'user_id'
          })
          .select();

        if (prefError) {
          console.error('Error upserting preferences:', prefError);
          return new Response(`Error updating preferences: ${prefError.message}`, { status: 500 });
        }

        console.log('Successfully created/updated preferences:', prefData);

        return new Response(JSON.stringify({ 
          message: 'User and preferences updated',
          user: userData,
          preferences: prefData
        }), { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error in database operations:', error);
        return new Response(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
      }
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return new Response(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 