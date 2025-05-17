
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Bunny Storage credentials
const STORAGE_USERNAME = 'poppi';
const STORAGE_PASSWORD = '74addf36-50fe-43a1-835ddfd82044-09ed-407c';
const STORAGE_ZONE = 'poppi'; // Using the same name as the username
const CDN_HOSTNAME = 'poppi.b-cdn.net';

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
    console.log("Received request body:", JSON.stringify(body, null, 2));
    
    const { fileName, fileBase64, title, requestId, fanEmail, creatorName } = body;
    
    // Validate required parameters
    const missingParams = [];
    if (!fileName) missingParams.push('fileName');
    if (!fileBase64) missingParams.push('fileBase64');
    if (!requestId) missingParams.push('requestId'); // We need requestId for the file path
    
    if (missingParams.length > 0) {
      return new Response(JSON.stringify({ 
        error: `Missing required parameters: ${missingParams.join(', ')}`,
        details: 'Make sure to include fileName, fileBase64, and requestId in request body' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract file extension from fileName or default to mp4
    const fileExtension = fileName.split('.').pop() || 'mp4';
    
    // Construct the path for storing in Bunny Storage
    const storagePath = `videos/${requestId}.${fileExtension}`;
    console.log(`Starting upload process for: ${fileName} to path: ${storagePath}`);

    // Extract base64 data and handle both with and without data URI prefix
    let base64Data = fileBase64;
    if (fileBase64.includes(',')) {
      base64Data = fileBase64.split(',')[1];
    }

    // Convert base64 to binary data
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Prepare the basic auth credentials
    const credentials = btoa(`${STORAGE_USERNAME}:${STORAGE_PASSWORD}`);

    // Upload the file to Bunny Storage
    const uploadUrl = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${storagePath}`;
    console.log(`Uploading to: ${uploadUrl}`);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': STORAGE_PASSWORD,
        'Content-Type': 'application/octet-stream',
        'Authorization': `Basic ${credentials}`
      },
      body: bytes
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Failed to upload file:', errorText);
      
      return new Response(JSON.stringify({ 
        error: 'Failed to upload to Bunny.net Storage', 
        details: errorText,
        status: uploadResponse.status,
        statusText: uploadResponse.statusText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate the CDN URL
    const cdnUrl = `https://${CDN_HOSTNAME}/${storagePath}`;
    console.log('Upload complete. CDN URL:', cdnUrl);
    
    // If this is for a specific request, send an email to the fan
    let emailResult = null;
    if (requestId && fanEmail && creatorName) {
      try {
        console.log(`Sending email notification to fan: ${fanEmail}`);
        
        // Call the send-email-notification function
        const emailResponse = await fetch(`${req.url.replace('bunny-upload', 'send-email-notification')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.get('Authorization') || '',
            'ApiKey': req.headers.get('ApiKey') || ''
          },
          body: JSON.stringify({
            fanEmail,
            creatorName,
            videoUrl: cdnUrl,
            requestId
          })
        });
        
        if (!emailResponse.ok) {
          console.error('Error sending email notification:', await emailResponse.text());
          emailResult = {
            success: false,
            error: `Failed to send email notification (status: ${emailResponse.status})`
          };
        } else {
          emailResult = await emailResponse.json();
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        emailResult = {
          success: false,
          error: emailError.message
        };
      }
    }

    // Return success with the video URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        videoUrl: cdnUrl,
        storageUrl: uploadUrl, 
        message: 'Video uploaded successfully to Bunny.net Storage',
        storagePath,
        requestId,
        emailResult
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing request:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
