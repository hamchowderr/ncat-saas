'use client'

import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/client'
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js'
import { useEffect, useState, useRef } from 'react'

const supabase = createClient()

export type RealtimeUser = {
  id: string
  name: string
  image: string
}

// Stable empty object to avoid re-renders
const EMPTY_USERS: Record<string, RealtimeUser> = {}

export const useRealtimePresenceRoom = (roomName: string) => {
  const { data: user } = useUser()
  const currentUserName = user?.user_metadata?.full_name ?? '?'
  const currentUserImage = user?.user_metadata?.avatar_url ?? null

  // Store latest values in refs so we can access them without re-running useEffect
  const userNameRef = useRef(currentUserName);
  const userImageRef = useRef(currentUserImage);

  // Always update refs with latest values
  userNameRef.current = currentUserName;
  userImageRef.current = currentUserImage;

  const [users, setUsers] = useState<Record<string, RealtimeUser>>(EMPTY_USERS)
  const prevUsersRef = useRef<Record<string, RealtimeUser>>(EMPTY_USERS)

  useEffect(() => {
    // Don't subscribe if no room name (empty string)
    if (!roomName) return;

    // Cleanup flag to prevent setState after unmount
    let isActive = true;

    const room = supabase.channel(roomName)

    room
      .on('presence', { event: 'sync' }, () => {
        if (!isActive) return; // Don't update state if component unmounted

        const newState = room.presenceState<{ image: string; name: string }>()

        const newUsers = Object.fromEntries(
          Object.entries(newState).map(([key, values]) => [
            key,
            { name: values[0].name, image: values[0].image },
          ])
        ) as Record<string, RealtimeUser>

        // Only update if users actually changed (deep comparison)
        const usersChanged = JSON.stringify(prevUsersRef.current) !== JSON.stringify(newUsers);

        if (usersChanged) {
          prevUsersRef.current = newUsers;
          setUsers(newUsers);
        }
      })
      .subscribe(async (status) => {
        if (!isActive) return; // Don't update state if component unmounted

        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          // Use refs to get the LATEST values without re-running useEffect
          await room.track({
            name: userNameRef.current,
            image: userImageRef.current,
          })
        } else {
          // Only update if not already empty (avoid unnecessary re-renders)
          if (Object.keys(prevUsersRef.current).length > 0) {
            prevUsersRef.current = EMPTY_USERS;
            setUsers(EMPTY_USERS);
          }
        }
      })

    return () => {
      isActive = false; // Mark as inactive BEFORE unsubscribing
      room.unsubscribe()
    }
  }, [roomName]) // Only re-run when roomName changes

  return { users }
}
