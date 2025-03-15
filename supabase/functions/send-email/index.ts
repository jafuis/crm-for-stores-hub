
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    console.log(`Para: ${recipients.length} destinatários`);
    
    // In a production environment, here you would integrate with an email sending service
    // like SendGrid, Mailgun, or Amazon SES. For this example, we're simulating success.
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Enviado com sucesso para ${recipients.length} destinatários` 
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
