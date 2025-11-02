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

    // Find accepted matches where appointment_deadline has passed and no appointment was created
    const { data: expiredMatches, error: fetchError } = await supabase
      .from('match_requests')
      .select('id, sender_id, receiver_id, is_premium, appointment_deadline')
      .eq('status', 'accepted')
      .eq('chat_status', 'active')
      .lt('appointment_deadline', new Date().toISOString())
      .is('appointment_deadline', 'not.null');

    if (fetchError) {
      console.error('Error fetching expired matches:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredMatches?.length || 0} expired matches to process`);

    for (const match of expiredMatches || []) {
      try {
        // Check if appointment was created
        const { data: appointment } = await supabase
          .from('appointments')
          .select('id')
          .eq('match_request_id', match.id)
          .single();

        // If no appointment was created, block chat and create review
        if (!appointment) {
          console.log(`Processing expired match ${match.id} - no appointment created`);

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

  } catch (error) {
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
