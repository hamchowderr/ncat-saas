'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'
import SupabaseManagerDialog from '@/components/index'
import { Settings, Database } from 'lucide-react'

export default function AdminPage() {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  
  // You'll need to replace this with your actual Supabase project ref
  const projectRef = 'wmntdaxrrzjawjxmsovo' // Your Supabase project ID

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Manage your Supabase backend services including database, authentication, storage, and more.
        </p>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Manager
            </CardTitle>
            <CardDescription>
              Access your Supabase project&apos;s database, authentication, storage, logs, and other backend services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setOpen(true)} 
              className="w-full"
              size="lg"
            >
              <Settings className="mr-2 h-4 w-4" />
              Open Supabase Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>

      <SupabaseManagerDialog
        projectRef={projectRef}
        open={open}
        onOpenChange={setOpen}
        isMobile={isMobile}
      />
    </div>
  )
}
