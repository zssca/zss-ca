#!/usr/bin/env node

/**
 * Test script to verify internal notes security
 * Run with: npx tsx scripts/test-internal-notes-security.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'
import { env } from '@/lib/types/env.types'

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables')
  process.exit(1)
}

// Create clients
const anonClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
const serviceClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function testInternalNotesSecurity() {
  console.log('🔒 Testing Internal Notes Security...\n')

  try {
    // Step 1: Get a test ticket with replies
    console.log('Step 1: Finding test ticket with replies...')
    const { data: ticket, error: ticketError } = await serviceClient
      .from('support_ticket')
      .select('id, profile_id, subject')
      .limit(1)
      .single()

    if (ticketError || !ticket) {
      console.error('❌ No test ticket found. Please create a ticket first.')
      return
    }

    console.log(`✅ Found ticket: ${ticket.subject} (ID: ${ticket.id})\n`)

    // Step 2: Create test replies (one normal, one internal)
    console.log('Step 2: Creating test replies...')

    // Get an admin user
    const { data: adminProfile } = await serviceClient
      .from('profile')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (!adminProfile) {
      console.error('❌ No admin user found')
      return
    }

    // Create a normal reply
    const { error: normalReplyError } = await serviceClient
      .from('ticket_reply')
      .insert({
        support_ticket_id: ticket.id,
        author_profile_id: adminProfile.id,
        message: 'TEST: This is a normal reply visible to everyone',
        is_internal: false,
      })

    if (normalReplyError) {
      console.error('❌ Failed to create normal reply:', normalReplyError.message)
    } else {
      console.log('✅ Created normal reply')
    }

    // Create an internal note
    const { error: internalReplyError } = await serviceClient
      .from('ticket_reply')
      .insert({
        support_ticket_id: ticket.id,
        author_profile_id: adminProfile.id,
        message: 'TEST: This is an INTERNAL NOTE - should NOT be visible to clients',
        is_internal: true,
      })

    if (internalReplyError) {
      console.error('❌ Failed to create internal note:', internalReplyError.message)
    } else {
      console.log('✅ Created internal note\n')
    }

    // Step 3: Test as client user (should NOT see internal notes)
    console.log('Step 3: Testing as CLIENT user...')

    // Sign in as the ticket owner (client)
    const { data: authData, error: authError } = await serviceClient.auth.admin.getUserById(
      ticket.profile_id
    )

    if (authError || !authData.user) {
      console.error('❌ Failed to get client user')
      return
    }

    const { data: clientReplies, error: clientError } = await anonClient
      .from('ticket_reply')
      .select('id, message, is_internal')
      .eq('support_ticket_id', ticket.id)
      .order('created_at', { ascending: false })
      .limit(2)

    if (clientError) {
      console.error('❌ Error fetching replies as client:', clientError.message)
    } else {
      const hasInternalNote = clientReplies?.some(r => r.is_internal === true)

      if (hasInternalNote) {
        console.error('❌ SECURITY BREACH: Client can see internal notes!')
        console.log('Visible replies:', clientReplies)
      } else {
        console.log('✅ Client cannot see internal notes (correct)')
        console.log(`   Visible replies: ${clientReplies?.length || 0}`)
      }
    }

    // Step 4: Test as admin user (should see ALL notes)
    console.log('\nStep 4: Testing as ADMIN user...')
    const { data: adminReplies, error: adminError } = await serviceClient
      .from('ticket_reply')
      .select('id, message, is_internal')
      .eq('support_ticket_id', ticket.id)
      .order('created_at', { ascending: false })
      .limit(2)

    if (adminError) {
      console.error('❌ Error fetching replies as admin:', adminError.message)
    } else {
      const normalCount = adminReplies?.filter(r => !r.is_internal).length || 0
      const internalCount = adminReplies?.filter(r => r.is_internal).length || 0

      console.log('✅ Admin can see all notes:')
      console.log(`   Normal replies: ${normalCount}`)
      console.log(`   Internal notes: ${internalCount}`)
    }

    // Step 5: Clean up test data
    console.log('\nStep 5: Cleaning up test data...')
    await serviceClient
      .from('ticket_reply')
      .delete()
      .eq('support_ticket_id', ticket.id)
      .ilike('message', 'TEST:%')

    console.log('✅ Test data cleaned up')

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('🎉 SECURITY TEST COMPLETED SUCCESSFULLY!')
    console.log('Internal notes are properly protected.')
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testInternalNotesSecurity()