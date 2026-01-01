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

    const now = new Date();

    console.log('Processing expired review deadlines...');

    // Find completed appointments where review deadline has passed
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, match_request_id, review_deadline')
      .eq('status', 'completed')
      .not('review_deadline', 'is', null)
      .lte('review_deadline', now.toISOString());

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${appointments?.length || 0} appointments with expired review deadlines`);

    let closedCount = 0;

    for (const appointment of appointments || []) {
      // Update match request chat_status to 'closed'
      const { error: updateMatchError } = await supabase
        .from('match_requests')
        .update({ chat_status: 'closed' })
        .eq('id', appointment.match_request_id);

      if (updateMatchError) {
        console.error(`Error closing match request ${appointment.match_request_id}:`, updateMatchError);
        continue;
      }

      // Delete the appointment since review period is over
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointment.id);

      if (deleteError) {
        console.error(`Error deleting appointment ${appointment.id}:`, deleteError);
      } else {
        console.log(`Closed chat and deleted appointment ${appointment.id}`);
        closedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: appointments?.length || 0,
        closed: closedCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in process-expired-reviews:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
