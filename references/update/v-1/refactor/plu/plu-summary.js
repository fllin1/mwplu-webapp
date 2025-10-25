// src/services/supabase.js
/**
 * Supabase Service Module
 * @module supabase
 * @description This module handles the Supabase client and database service functions.
 * It includes methods to fetch cities, zonings, zones, typologies, documents, comments, and ratings.
 * It also provides real-time subscriptions for comments and ratings.
 * It integrates with Supabase for user authentication and profile management.
 * @version 1.0.1
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.1 (2025-06-05): Fixed profile management and foreign key issues
 * - 1.0.0 (2025-06-02): Initial version with database service functions.
 */

import { createClient } from '@supabase/supabase-js'

// TODO: Change to production URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export const dbService = {
  // Profile management - CRITICAL: Must be called after authentication
  async ensureUserProfile(user) {
    try {
      if (!user || !user.id) {
        throw new Error('User object is required')
      }

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // If profile doesn't exist (PGRST116 = no rows returned), create it
      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) throw insertError
        return { success: true, data: newProfile, created: true }
      }

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      return { success: true, data: existingProfile, created: false }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
      return { success: false, error: error.message }
    }
  },

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
        .eq('city_id', cityId)
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
  /**
   * Get a document by zoning and zone IDs
   * @param {string} zoningId - The ID of the zoning
   * @param {string} zoneId - The ID of the zone
   * @returns {Promise<{success: boolean, data: Object | null, error: string | null}>}
   */
  async getDocument(zoningId, zoneId) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(
          `
            *,
            zoning:zonings(
              id,
              name,
              city:cities(id, name)
            ),
            zone:zones(id, name)
          `,
        )
        .match({ zoning_id: zoningId, zone_id: zoneId })
        .single()

      if (error) throw error

      // Transform the data to match expected structure
      const transformedData = {
        ...data,
        city_id: data.zoning?.city?.id,
        city_name: data.zoning?.city?.name || 'Unknown City',
        zoning_id: data.zoning?.id,
        zoning_name: data.zoning?.name || 'Unknown Zoning',
        zone_id: data.zone?.id,
        zone_name: data.zone?.name || 'Unknown Zone',
        synthesis_content:
          data.html_content ||
          (data.content_json?.response
            ? this.formatJsonContent(data.content_json.response)
            : 'Contenu non disponible'),
        // Add computed fields for stats (these would come from aggregated queries in real implementation)
        rating_average: null, // TODO: Calculate from ratings table
        comments_count: 0, // TODO: Calculate from comments table
        downloads_count: 0, // TODO: Calculate from downloads table
        sources: [], // TODO: Extract from content or separate sources table
      }

      return { success: true, data: transformedData }
    } catch (error) {
      console.error('Error fetching document:', error)
      return { success: false, error: error.message }
    }
  },

  // Helper method to format JSON content for display
  formatJsonContent(jsonResponse) {
    if (!jsonResponse) return 'Contenu non disponible'

    try {
      let htmlContent = '<div class="plu-content">'

      // Iterate through chapters
      Object.keys(jsonResponse).forEach((chapterKey) => {
        const chapter = jsonResponse[chapterKey]
        htmlContent += `<section class="chapter"><h2>Chapitre ${chapterKey.replace('chapitre_', '')}</h2>`

        // Iterate through sections
        Object.keys(chapter).forEach((sectionKey) => {
          const section = chapter[sectionKey]
          if (Array.isArray(section) && section.length > 0) {
            section.forEach((item) => {
              if (item.titre) {
                htmlContent += `<div class="section"><h3>${item.titre}</h3>`

                if (item.regles && Array.isArray(item.regles)) {
                  htmlContent += '<div class="rules">'
                  item.regles.forEach((rule) => {
                    htmlContent += `<div class="rule"><p>${rule.contenu}</p>`
                    if (rule.page_source) {
                      htmlContent += `<span class="source">(${rule.page_source})</span>`
                    }
                    htmlContent += '</div>'
                  })
                  htmlContent += '</div>'
                }
                htmlContent += '</div>'
              }
            })
          }
        })

        htmlContent += '</section>'
      })

      htmlContent += '</div>'
      return htmlContent
    } catch (error) {
      console.error('Error formatting JSON content:', error)
      return 'Erreur lors du formatage du contenu'
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
            profiles!user_id (
              id,
              email,
              full_name,
              avatar_url
            )
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

  async addComment(documentId, text, userId) {
    try {
      // Validate inputs
      if (!documentId || !text || !userId) {
        throw new Error('Document ID, text, and user ID are required')
      }

      const trimmedText = text.trim()
      if (trimmedText.length === 0) {
        throw new Error('Comment text cannot be empty')
      }

      // Ensure user profile exists before adding comment
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user && user.id === userId) {
        const profileResult = await this.ensureUserProfile(user)
        if (!profileResult.success) {
          throw new Error('Failed to ensure user profile: ' + profileResult.error)
        }
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          document_id: documentId,
          content: trimmedText,
          user_id: userId,
        })
        .select(
          `
            *,
            profiles!user_id (
              id,
              email,
              full_name,
              avatar_url
            )
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

  async updateComment(commentId, text, userId) {
    try {
      // Validate inputs
      if (!commentId || !text || !userId) {
        throw new Error('Comment ID, text, and user ID are required')
      }

      const trimmedText = text.trim()
      if (trimmedText.length === 0) {
        throw new Error('Comment text cannot be empty')
      }

      // Get the current comment to save to history
      const { data: currentComment, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError
      if (!currentComment) throw new Error('Comment not found or unauthorized')

      // Save current comment to history
      const { error: historyError } = await supabase.from('comment_history').insert({
        original_comment_id: commentId,
        document_id: currentComment.document_id,
        user_id: userId,
        content: currentComment.content,
        original_created_at: currentComment.created_at,
        action_type: 'modified',
      })

      if (historyError) throw historyError

      // Update the comment
      const { data, error } = await supabase
        .from('comments')
        .update({
          content: trimmedText,
          is_modified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('user_id', userId)
        .select(
          `
            *,
            profiles!user_id (
              id,
              email,
              full_name,
              avatar_url
            )
          `,
        )
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating comment:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteComment(commentId, userId) {
    try {
      // Validate inputs
      if (!commentId || !userId) {
        throw new Error('Comment ID and user ID are required')
      }

      // Get the current comment to save to history
      const { data: currentComment, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError
      if (!currentComment) throw new Error('Comment not found or unauthorized')

      // Save current comment to history
      const { error: historyError } = await supabase.from('comment_history').insert({
        original_comment_id: commentId,
        document_id: currentComment.document_id,
        user_id: userId,
        content: currentComment.content,
        original_created_at: currentComment.created_at,
        action_type: 'deleted',
      })

      if (historyError) throw historyError

      // Delete the comment
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error: error.message }
    }
  },

  // Ratings operations
  async getUserRating(documentId, userId) {
    try {
      // Validate inputs
      if (!documentId || !userId) {
        throw new Error('Document ID and user ID are required')
      }

      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      return { success: true, data }
    } catch (error) {
      console.error('Error getting user rating:', error)
      return { success: false, error: error.message }
    }
  },

  async submitRating(documentId, userId, rating) {
    try {
      // Validate inputs
      if (!documentId || !userId || !rating) {
        throw new Error('Document ID, user ID, and rating are required')
      }

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5')
      }

      // Ensure user profile exists before submitting rating
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user && user.id === userId) {
        const profileResult = await this.ensureUserProfile(user)
        if (!profileResult.success) {
          throw new Error('Failed to ensure user profile: ' + profileResult.error)
        }
      }

      // Use upsert to handle both insert and update automatically
      // This leverages the unique constraint on (document_id, user_id)
      const { data, error } = await supabase
        .from('ratings')
        .upsert({
          document_id: documentId,
          user_id: userId,
          rating: rating,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error submitting rating:', error)
      return { success: false, error: error.message }
    }
  },

  async removeRating(documentId, userId) {
    try {
      // Validate inputs
      if (!documentId || !userId) {
        throw new Error('Document ID and user ID are required')
      }

      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error removing rating:', error)
      return { success: false, error: error.message }
    }
  },

  async getDocumentStats(documentId) {
    try {
      // Validate input
      if (!documentId) {
        throw new Error('Document ID is required')
      }

      // Get ratings stats
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('rating')
        .eq('document_id', documentId)

      if (ratingsError) throw ratingsError

      // Get comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId)

      if (commentsError) throw commentsError

      // Get downloads count
      const { count: downloadsCount, error: downloadsError } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId)

      if (downloadsError) throw downloadsError

      // Calculate rating statistics
      const ratingsArray = ratingsData || []
      const ratingsTotal = ratingsArray.length
      const ratingsSum = ratingsArray.reduce((sum, item) => sum + item.rating, 0)
      const ratingsAverage = ratingsTotal > 0 ? (ratingsSum / ratingsTotal).toFixed(1) : null

      return {
        success: true,
        data: {
          ratings_count: ratingsTotal,
          ratings_average: ratingsAverage,
          comments_count: commentsCount || 0,
          downloads_count: downloadsCount || 0,
        },
      }
    } catch (error) {
      console.error('Error getting document stats:', error)
      return { success: false, error: error.message }
    }
  },

  // Contact form (store in Supabase instead of Firebase function)
  async submitContact(name, email, message) {
    try {
      const { error } = await supabase
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
  async trackDownload(documentId) {
    try {
      // Validate inputs
      if (!documentId) {
        throw new Error('Document ID is required')
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Only track downloads for authenticated users
      if (!user) {
        console.warn('Download tracking skipped: User not authenticated')
        return { success: true }
      }

      const { error } = await supabase.from('downloads').insert({
        document_id: documentId,
        user_id: user.id,
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
      // Validate input
      if (!userId) {
        throw new Error('User ID is required')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId) // Changed from 'user_id' to 'id'
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
      // Validate inputs
      if (!userId || !profileData) {
        throw new Error('User ID and profile data are required')
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId, // Changed from 'user_id' to 'id'
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
