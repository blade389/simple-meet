import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify cron secret for security
    const cronSecret = req.headers.get('x-cron-secret');
    if (cronSecret !== Deno.env.get('CRON_SECRET')) {
      console.error('Unauthorized: Invalid cron secret');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour for testing (was 24 hours)

    // Find appointments that passed 1 hour ago and need review deadline
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, appointment_date, match_request_id')
      .eq('status', 'scheduled')
      .lte('appointment_date', oneHourAgo.toISOString())
      .is('review_deadline', null);

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${appointments?.length || 0} appointments to process`);

    // Update appointments to completed and set review deadline
    for (const appointment of appointments || []) {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'completed',
          review_deadline: oneHourFromNow.toISOString(),
        })
        .eq('id', appointment.id);

      if (updateError) {
        console.error(`Error updating appointment ${appointment.id}:`, updateError);
      } else {
        console.log(`Processed appointment ${appointment.id}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: appointments?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in process-completed-appointments:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
