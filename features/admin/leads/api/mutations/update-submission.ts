'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateContactSubmissionStatus(
  submissionId: string,
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed_lost'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profile')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Update the submission
    const updateData: {
      status: string
      updated_at: string
      contacted_at?: string
      converted_at?: string
    } = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Set timestamps based on status
    if (status === 'contacted' && !updateData.contacted_at) {
      updateData.contacted_at = new Date().toISOString()
    } else if (status === 'converted') {
      updateData.converted_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('contact_submission')
      .update(updateData)
      .eq('id', submissionId)

    if (error) {
      console.error('Failed to update submission status:', error)
      return { success: false, error: 'Failed to update status' }
    }

    revalidatePath('/admin/leads')
    return { success: true }
  } catch (error) {
    console.error('Error updating submission status:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function assignContactSubmission(
  submissionId: string,
  assignedToId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profile')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('contact_submission')
      .update({
        assigned_to: assignedToId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    if (error) {
      console.error('Failed to assign submission:', error)
      return { success: false, error: 'Failed to assign submission' }
    }

    revalidatePath('/admin/leads')
    return { success: true }
  } catch (error) {
    console.error('Error assigning submission:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteContactSubmission(
  submissionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profile')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Soft delete
    const { error } = await supabase
      .from('contact_submission')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    if (error) {
      console.error('Failed to delete submission:', error)
      return { success: false, error: 'Failed to delete submission' }
    }

    revalidatePath('/admin/leads')
    return { success: true }
  } catch (error) {
    console.error('Error deleting submission:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
