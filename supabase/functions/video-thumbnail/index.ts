import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const NCAT_API_URL = Deno.env.get('NCAT_API_URL')
const NCAT_API_KEY = Deno.env.get('NCAT_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface VideoThumbnailRequest {
  video_url: string
  second?: number
  webhook_url?: string
  id?: string
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Authorization required', { status: 401 })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response('Invalid authentication', { status: 401 })
    }

    const body: VideoThumbnailRequest = await req.json()

    // Validate required parameters
    if (!body.video_url || typeof body.video_url !== 'string') {
      return new Response('video_url is required', { status: 400 })
    }

    // Validate optional parameters
    if (body.second !== undefined && (typeof body.second !== 'number' || body.second < 0)) {
      return new Response('second must be a non-negative number', { status: 400 })
    }

    const ncatPayload = {
      video_url: body.video_url,
      second: body.second || 0,
      webhook_url: body.webhook_url || `${SUPABASE_URL}/functions/v1/ncat-webhook`,
      id: body.id || `video-thumbnail-${Date.now()}`
    }

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/video/thumbnail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NCAT_API_KEY!
      },
      body: JSON.stringify(ncatPayload)
    })

    if (!ncatResponse.ok) {
      const errorText = await ncatResponse.text()
      console.error('NCAT API error:', errorText)
      return new Response('Failed to generate video thumbnail', { status: 500 })
    }

    const ncatResult = await ncatResponse.json()

    // Create job record with NCAT job ID for tracking
    if (ncatResult.job_id) {
      await supabase.from('jobs').insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        custom_id: body.id || `video-thumbnail-${Date.now()}`,
        processing_status: 'processing'
      })
    }

    return new Response(JSON.stringify({
      success: true,
      job_id: ncatResult.job_id,
      message: 'Video thumbnail generation started successfully',
      response: ncatResult.response,
      queue_length: ncatResult.queue_length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Video thumbnail error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})