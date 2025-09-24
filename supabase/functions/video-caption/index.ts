import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const NCAT_API_URL = Deno.env.get('NCAT_API_URL')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface VideoCaptionRequest {
  video_url: string
  subtitle_url?: string
  font_size?: number
  font_color?: string
  position?: string
  custom_id?: string
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

    const body: VideoCaptionRequest = await req.json()

    if (!body.video_url || typeof body.video_url !== 'string') {
      return new Response('video_url is required', { status: 400 })
    }

    if (body.font_size !== undefined && (typeof body.font_size !== 'number' || body.font_size < 8 || body.font_size > 72)) {
      return new Response('font_size must be between 8 and 72', { status: 400 })
    }

    const validPositions = ['top', 'bottom', 'center']
    if (body.position !== undefined && !validPositions.includes(body.position)) {
      return new Response('position must be one of: top, bottom, center', { status: 400 })
    }

    const ncatPayload = {
      video_url: body.video_url,
      subtitle_url: body.subtitle_url,
      font_size: body.font_size,
      font_color: body.font_color,
      position: body.position,
      webhook_url: `${SUPABASE_URL}/functions/v1/ncat-webhook`,
      id: body.custom_id || `video-caption-${Date.now()}`
    }

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/video/caption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ncatPayload)
    })

    if (!ncatResponse.ok) {
      const errorText = await ncatResponse.text()
      console.error('NCAT API error:', errorText)
      return new Response('Failed to add captions to video', { status: 500 })
    }

    const ncatResult = await ncatResponse.json()

    if (ncatResult.job_id) {
      await supabase.from('jobs').insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        custom_id: body.custom_id || `video-caption-${Date.now()}`,
        processing_status: 'processing'
      })
    }

    return new Response(JSON.stringify({
      success: true,
      nca_job_id: ncatResult.job_id,
      message: 'Video captioning started successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Video caption error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})