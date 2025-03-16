
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Inicializa o cliente Resend com a chave API
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface Recipient {
  email: string;
  name: string;
}

interface EmailRequest {
  from: {
    email: string;
    name: string;
  };
  subject: string;
  content: string;
  recipients: Recipient[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { from, subject, content, recipients } = await req.json() as EmailRequest;
    
    if (!from.email || !subject || !content || !recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Dados obrigatórios faltando. Forneça remetente, assunto, conteúdo e destinatários." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Log the email details for debugging
    console.log("Enviando email:");
    console.log(`De: ${from.name} <${from.email}>`);
    console.log(`Assunto: ${subject}`);
    console.log(`Para: ${recipients.map(r => `${r.name} <${r.email}>`).join(', ')}`);
    
    // Prepare recipients list for Resend
    const to = recipients.map(recipient => recipient.email);
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: `${from.name} <onboarding@resend.dev>`, // Use Resend verified domain (you should replace with your own domain later)
      reply_to: from.email,
      to,
      subject,
      html: content,
    });
    
    if (error) {
      console.error("Erro ao enviar email com Resend:", error);
      throw new Error(`Falha ao enviar e-mail: ${error.message}`);
    }
    
    console.log("Email enviado com sucesso:", data);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email enviado com sucesso para ${recipients.length} destinatários`,
        data
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Erro ao processar solicitação de e-mail:", error);
    
    return new Response(
      JSON.stringify({ error: "Falha ao enviar e-mail. " + error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
