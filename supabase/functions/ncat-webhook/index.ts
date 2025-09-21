// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.log('NCA Toolkit Webhook Handler started!')

Deno.serve(async (request) => {
  try {
    // Log incoming request for debugging
    console.log(`📨 Received ${request.method} request`)
    
    // Only accept POST requests for webhooks
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Parse the incoming webhook payload from NCA Toolkit
    let payload
    try {
      const body = await request.text()
      console.log('📋 Raw request body:', body)
      
      if (!body || body.trim() === '') {
        console.log('⚠️ Empty request body received')
        payload = {}
      } else {
        payload = JSON.parse(body)
        console.log('📋 NCA Webhook payload:', JSON.stringify(payload, null, 2))
      }
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError.message)
      console.log('📋 Raw body that failed to parse:', await request.text())
      return new Response('Invalid JSON payload', { status: 400 })
    }

    // Extract NCA Toolkit job information
    const {
      job_id,
      code,
      message,
      response,
      endpoint,
      pid,
      queue_id,
      run_time,
      queue_time,
      total_time,
      queue_length,
      build_number
    } = payload

    if (!job_id) {
      console.error('❌ Missing job_id in NCA Toolkit webhook payload')
      return new Response('Missing job_id', { status: 400 })
    }

    // Determine job status based on code and message
    if (code === 200 && message === 'success') {
      console.log(`✅ Job ${job_id} completed successfully`)
      console.log(`📄 Result: ${response}`)
      console.log(`🎯 Endpoint: ${endpoint}`)
      console.log(`⏱️ Processing time: ${run_time}s`)
      
      // TODO: Handle successful completion
      // - Update your database
      // - Notify the user
      // - Process the result
      
    } else if (code >= 400) {
      console.log(`❌ Job ${job_id} failed with code ${code}: ${message}`)
      
      // TODO: Handle failure
      // - Update job status
      // - Notify user of failure
      // - Log error details
      
    } else {
      console.log(`⏳ Job ${job_id} status update: ${message}`)
      
      // TODO: Handle progress/status updates
      // - Update job progress
      // - Show status to user
    }

    // Log processing metrics if available
    if (run_time !== undefined) {
      console.log(`📊 Job ${job_id} metrics:`, {
        endpoint,
        run_time: `${run_time}s`,
        queue_time: `${queue_time}s`,
        total_time: `${total_time}s`,
        queue_length,
        build_number
      })
    }

    // Respond to NCA Toolkit that webhook was received
    return new Response(JSON.stringify({ 
      received: true, 
      job_id: job_id,
      processed_at: new Date().toISOString()
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Webhook processing error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})