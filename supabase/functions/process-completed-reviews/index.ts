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

    console.log('Checking for completed appointments with both reviews...');

    // Find completed appointments
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, female_user_id, male_user_id')
      .eq('status', 'completed');

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${appointments?.length || 0} completed appointments to check`);

    let deletedCount = 0;

    for (const appointment of appointments || []) {
      // Check if both users have left reviews
      const { data: reviews, error: reviewError } = await supabase
        .from('reviews')
        .select('id, reviewer_id')
        .eq('appointment_id', appointment.id);

      if (reviewError) {
        console.error(`Error fetching reviews for appointment ${appointment.id}:`, reviewError);
        continue;
      }

      const reviewerIds = reviews?.map(r => r.reviewer_id) || [];
      const hasFemaleReview = reviewerIds.includes(appointment.female_user_id);
      const hasMaleReview = reviewerIds.includes(appointment.male_user_id);

      // If both have reviewed, delete the appointment
      if (hasFemaleReview && hasMaleReview) {
        const { error: deleteError } = await supabase
          .from('appointments')
          .delete()
          .eq('id', appointment.id);

        if (deleteError) {
          console.error(`Error deleting appointment ${appointment.id}:`, deleteError);
        } else {
          console.log(`Deleted appointment ${appointment.id} - both users have reviewed`);
          deletedCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: appointments?.length || 0,
        deleted: deletedCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in process-completed-reviews:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
