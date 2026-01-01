import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing appointment deadlines...');

    // Find accepted matches where appointment_deadline has passed
    // We'll check for appointments separately to ensure we only process those without appointments
    const { data: potentialExpiredMatches, error: fetchError } = await supabase
      .from('match_requests')
      .select('id, sender_id, receiver_id, is_premium, appointment_deadline')
      .eq('status', 'accepted')
      .eq('chat_status', 'active')
      .lt('appointment_deadline', new Date().toISOString())
      .not('appointment_deadline', 'is', null);

    // Filter out matches that have appointments
    const expiredMatches: typeof potentialExpiredMatches = [];
    
    for (const match of potentialExpiredMatches || []) {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('id')
        .eq('match_request_id', match.id)
        .maybeSingle();
      
      // Only include matches WITHOUT any appointment
      if (!appointment) {
        expiredMatches.push(match);
      } else {
        console.log(`Skipping match ${match.id} - appointment exists`);
      }
    }

    if (fetchError) {
      console.error('Error fetching expired matches:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredMatches?.length || 0} expired matches to process`);

    for (const match of expiredMatches || []) {
      try {
        console.log(`Processing expired match ${match.id} - no appointment created`);

        // Get profile names for the notification
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', match.sender_id)
          .single();

        const { data: receiverProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', match.receiver_id)
          .single();

        // Update match request to blocked/under_review
        const { error: updateError } = await supabase
          .from('match_requests')
          .update({ 
            chat_status: 'under_review',
            updated_at: new Date().toISOString()
          })
          .eq('id', match.id);

        if (updateError) {
          console.error(`Error updating match ${match.id}:`, updateError);
          continue;
        }

        // Create conversation review for admin
        const { error: reviewError } = await supabase
          .from('conversation_reviews')
          .insert({
            match_request_id: match.id,
            created_at: new Date().toISOString()
          });

        if (reviewError) {
          console.error(`Error creating review for match ${match.id}:`, reviewError);
        } else {
          console.log(`Successfully created review for match ${match.id}`);

          // Send email notification to admin
          try {
            const notificationResponse = await fetch(
              `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-admin-review-notification`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                },
                body: JSON.stringify({
                  matchRequestId: match.id,
                  senderName: senderProfile?.full_name || 'Utente',
                  receiverName: receiverProfile?.full_name || 'Utente',
                  isPremium: match.is_premium || false,
                }),
              }
            );

            if (!notificationResponse.ok) {
              console.error('Error sending admin notification:', await notificationResponse.text());
            } else {
              console.log('Admin notification sent successfully');
            }
          } catch (notifError) {
            console.error('Error sending admin notification:', notifError);
          }
        }
      } catch (error) {
        console.error(`Error processing match ${match.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: expiredMatches?.length || 0 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error processing appointment deadlines:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
