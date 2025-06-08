// src/services/supabase.js
/**
 * Supabase Service Module
 * @module supabase
 * @description This module handles the Supabase client and database service functions.
 * It includes methods to fetch cities, zonings, zones, typologies, documents, comments, and ratings.
 * It also provides real-time subscriptions for comments and ratings.
 * It integrates with Supabase for user authentication and profile management.
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-02): Initial version with database service functions.
 */

import { createClient } from '@supabase/supabase-js'

// TODO: Change to production URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_DEV
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_DEV

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export const dbService = {
  // Cities operations
  async getCities() {
    try {
      const { data, error } = await supabase.from('cities').select('*').order('name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching cities:', error)
      return { success: false, error: error.message }
    }
  },

  // Zonings operations
  async getZonings(cityId) {
    try {
      const { data, error } = await supabase
        .from('zonings')
        .select('*')
        .eq('city_Id', cityId)
        .order('name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching zonings:', error)
      return { success: false, error: error.message }
    }
  },

  // Zones operations
  async getZones(zoningId) {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('zoning_id', zoningId)
        .order('name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching zones:', error)
      return { success: false, error: error.message }
    }
  },

  // Typologies operations
  async getTypologies() {
    try {
      const { data, error } = await supabase.from('typologies').select('*').order('name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching typologies:', error)
      return { success: false, error: error.message }
    }
  },

  // Document operations
  async getDocument(params) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(
          `
            *,
            city:cities(name),
            zoning:zonings(name),
            zone:zones(name)
          `,
        )
        .match(params)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching document:', error)
      return { success: false, error: error.message }
    }
  },

  async searchDocuments(searchParams) {
    try {
      let query = supabase.from('documents').select(`
            *,
            city:cities(name),
            zoning:zonings(name),
            zone:zones(name)
          `)

      // Add filters based on search params
      if (searchParams.city_id) {
        query = query.eq('city_id', searchParams.city_id)
      }
      if (searchParams.zoning_id) {
        query = query.eq('zoning_id', searchParams.zoning_id)
      }
      if (searchParams.zone_id) {
        query = query.eq('zone_id', searchParams.zone_id)
      }
      if (searchParams.search_text) {
        query = query.ilike('content', `%${searchParams.search_text}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error searching documents:', error)
      return { success: false, error: error.message }
    }
  },

  // Comments operations
  async getComments(documentId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(
          `
            *,
            user:auth.users(email, raw_user_meta_data)
          `,
        )
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching comments:', error)
      return { success: false, error: error.message }
    }
  },

  async addComment(documentId, content) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('comments')
        .insert({
          document_id: documentId,
          content,
          user_id: user.id,
        })
        .select(
          `
            *,
            user:auth.users(email, raw_user_meta_data)
          `,
        )
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error adding comment:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteComment(commentId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id) // Users can only delete their own comments

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error: error.message }
    }
  },

  // Ratings operations
  async toggleRating(documentId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if rating exists
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .single()

      if (existingRating) {
        // Remove rating
        const { error } = await supabase.from('ratings').delete().eq('id', existingRating.id)

        if (error) throw error
        return { success: true, rated: false }
      } else {
        // Add rating
        const { error } = await supabase.from('ratings').insert({
          document_id: documentId,
          user_id: user.id,
        })

        if (error) throw error
        return { success: true, rated: true }
      }
    } catch (error) {
      console.error('Error toggling rating:', error)
      return { success: false, error: error.message }
    }
  },

  async getRatingStatus(documentId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Get total count
      const { count: totalRatings, error: countError } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId)

      if (countError) throw countError

      let isRated = false
      if (user) {
        // Check if current user rated
        const { data: userRating, error: RatingError } = await supabase
          .from('ratings')
          .select('id')
          .eq('document_id', documentId)
          .eq('user_id', user.id)
          .single()

        if (ratingError && ratingError.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          throw ratingError
        }

        isRated = !!userRating
      }

      return {
        success: true,
        data: {
          count: totalRatings || 0,
          isRated,
        },
      }
    } catch (error) {
      console.error('Error getting rating status:', error)
      return { success: false, error: error.message }
    }
  },

  // Contact form (store in Supabase instead of Firebase function)
  async submitContact(name, email, message) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          message,
          created_at: new Date().toISOString(),
        })
        .single()

      if (error) throw error
      return { success: true, message: 'Your message has been sent successfully!' }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      return { success: false, error: error.message }
    }
  },

  // Download tracking
  async trackDownload(documentId, downloadType) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase.from('downloads').insert({
        document_id: documentId,
        user_id: user?.id || null,
        download_type: downloadType,
        downloaded_at: new Date().toISOString(),
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error tracking download:', error)
      return { success: false, error: error.message }
    }
  },

  // Real-time subscriptions
  subscribeToComments(documentId, callback) {
    return supabase
      .channel(`comments:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `document_id=eq.${documentId}`,
        },
        callback,
      )
      .subscribe()
  },

  subscribeToRatings(documentId, callback) {
    return supabase
      .channel(`ratings:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ratings',
          filter: `document_id=eq.${documentId}`,
        },
        callback,
      )
      .subscribe()
  },

  // User profile operations
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return { success: false, error: error.message }
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { success: false, error: error.message }
    }
  },
}
