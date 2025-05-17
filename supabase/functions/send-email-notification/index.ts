
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// For now, we'll mock the email sending since we don't have a specific email provider set up
// In a real implementation, you would use SendGrid, Resend, or another email service
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the request body
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { fanEmail, creatorName, videoUrl, requestId } = body;
    
    if (!fanEmail || !videoUrl) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters', 
        details: 'fanEmail and videoUrl are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Sending email notification to ${fanEmail} for request ${requestId}`);
    
    // In a real implementation, you would send an actual email here using SendGrid/Resend/etc
    // For now, we'll just log the notification details and return a success response
    
    console.log({
      to: fanEmail,
      subject: `${creatorName} has responded to your request!`,
      body: `
        Hi there!
        
        Great news! ${creatorName} has just uploaded a video response to your request.
        
        You can watch it here: ${videoUrl}
        
        Thanks for using our platform!
      `
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email notification sent to ${fanEmail}`,
        requestId,
        videoUrl
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending email notification:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
