import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminReviewNotificationRequest {
  matchRequestId: string;
  senderName: string;
  receiverName: string;
  isPremium: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-admin-review-notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matchRequestId, senderName, receiverName, isPremium }: AdminReviewNotificationRequest = await req.json();

    console.log("Request data:", { matchRequestId, senderName, receiverName, isPremium });

    // Create Supabase client to get admin users
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all admin user IDs
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw rolesError;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found");
      return new Response(
        JSON.stringify({ message: "No admin users found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${adminRoles.length} admin users`);

    // Get admin emails from auth.users
    const adminEmails: string[] = [];
    for (const adminRole of adminRoles) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(adminRole.user_id);
      if (!userError && userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ message: "No admin emails found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending notification to admins:", adminEmails);

    const subject = "SCOPAMI - Nuova conversazione da revisionare";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e11d48; text-align: center;">SCOPAMI</h1>
        <h2 style="color: #333;">Nuova Revisione Richiesta</h2>
        <p>Una nuova conversazione richiede la tua revisione.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Conversazione tra:</strong></p>
          <p style="margin: 10px 0;">${senderName} → ${receiverName}</p>
          ${isPremium ? '<p style="margin: 0; color: #eab308;"><strong>⭐ Richiesta Premium</strong></p>' : ''}
        </div>
        
        <p>Il tempo per fissare un appuntamento è scaduto senza che sia stato programmato un incontro. È necessaria una revisione per decidere l'azione da intraprendere.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://tdkovomoosffywhajhkj.lovableproject.com/admin/conversation-reviews" 
             style="display: inline-block; background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Vai alle Revisioni
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          Questa email è stata inviata automaticamente. Non rispondere a questo messaggio.
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "SCOPAMI <onboarding@resend.dev>",
      to: adminEmails,
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-review-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
