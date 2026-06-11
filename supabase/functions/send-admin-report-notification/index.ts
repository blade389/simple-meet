import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminReportNotificationRequest {
  reviewId: string;
  reporterName: string;
  reportedName: string;
  reportReason: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-admin-report-notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewId, reporterName, reportedName, reportReason }: AdminReportNotificationRequest = await req.json();

    console.log("Request data:", { reviewId, reporterName, reportedName, reportReason });

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

    const subject = "FlashMatch - Nuova segnalazione da revisionare";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e11d48; text-align: center;">FlashMatch</h1>
        <h2 style="color: #333;">⚠️ Nuova Segnalazione Utente</h2>
        <p>Un utente ha segnalato un comportamento scorretto dopo un appuntamento.</p>
        
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e11d48;">
          <p style="margin: 0 0 10px 0;"><strong>Segnalante:</strong> ${reporterName}</p>
          <p style="margin: 0 0 10px 0;"><strong>Segnalato:</strong> ${reportedName}</p>
          <p style="margin: 0;"><strong>Motivo:</strong></p>
          <p style="margin: 5px 0 0 0; font-style: italic; color: #666;">"${reportReason}"</p>
        </div>
        
        <p>È necessaria una revisione per decidere l'azione da intraprendere.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://flashmatch.org/admin/user-reviews" 
             style="display: inline-block; background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Vai alle Segnalazioni
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          Questa email è stata inviata automaticamente. Non rispondere a questo messaggio.
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "FlashMatch <noreply@flashmatch.org>",
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
    console.error("Error in send-admin-report-notification function:", error);
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
