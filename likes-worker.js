// Cloudflare Worker script to handle card likes with D1 database
// Deploy this to Cloudflare as a Worker with D1 binding

export default {
    async fetch(request, env, ctx) {
      // CORS Headers for preflight requests and actual requests
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };
  
      // Handle OPTIONS request (preflight)
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: corsHeaders,
          status: 204,
        });
      }
  
      // Get the URL and pathname for routing
      const url = new URL(request.url);
      const endpoint = url.pathname.split('/').pop();
  
      // Parse the request body (if any)
      let body;
      try {
        if (request.method === 'POST') {
          body = await request.json();
        }
      } catch (error) {
        return errorResponse('Invalid JSON body', 400, corsHeaders);
      }
  
      // Route the request based on the endpoint
      try {
        switch (endpoint) {
          case 'getAll':
            return await getAllLikes(env, body, corsHeaders);
          case 'update':
            return await updateLike(env, body, corsHeaders);
          default:
            return errorResponse('Endpoint not found', 404, corsHeaders);
        }
      } catch (error) {
        console.error('Error processing request:', error);
        return errorResponse('Internal server error', 500, corsHeaders);
      }
    }
  };
  
  /**
   * Get all likes for all cards and the user's liked cards
   */
  async function getAllLikes(env, body, corsHeaders) {
    // Check if sessionId is provided
    if (!body || !body.sessionId) {
      return errorResponse('Session ID is required', 400, corsHeaders);
    }
  
    const sessionId = body.sessionId;
    const db = env.CARD_LIKES_DB; // D1 database binding name
  
    // Create tables if they don't exist
    await createTablesIfNeeded(db);
  
    try {
      // Prepare response data
      const response = {
        cardLikes: {},
        userLikeCount: 0
      };
  
      // Get all cards with their like counts
      const cardLikesResult = await db.prepare(`
        SELECT card_path, COUNT(*) as count 
        FROM card_likes 
        GROUP BY card_path
      `).all();
  
      // Get user's liked cards
      const userLikesResult = await db.prepare(`
        SELECT card_path 
        FROM card_likes 
        WHERE session_id = ?
      `).bind(sessionId).all();
  
      // Calculate user's daily like count (within the last 24 hours)
      const userDailyLikeCountResult = await db.prepare(`
        SELECT COUNT(*) as count 
        FROM card_likes 
        WHERE session_id = ? 
        AND created_at > datetime('now', '-1 day')
      `).bind(sessionId).first();
  
      // Format the data for the client
      if (cardLikesResult.results && cardLikesResult.results.length > 0) {
        cardLikesResult.results.forEach(row => {
          response.cardLikes[row.card_path] = {
            count: row.count,
            userLiked: false
          };
        });
      }
  
      // Mark the user's liked cards
      if (userLikesResult.results && userLikesResult.results.length > 0) {
        userLikesResult.results.forEach(row => {
          if (response.cardLikes[row.card_path]) {
            response.cardLikes[row.card_path].userLiked = true;
          } else {
            // Create an entry if it doesn't exist (shouldn't happen but just in case)
            response.cardLikes[row.card_path] = {
              count: 1, // This is just a guess since it doesn't appear in the count query
              userLiked: true
            };
          }
        });
      }
  
      // Set the user like count
      if (userDailyLikeCountResult) {
        response.userLikeCount = userDailyLikeCountResult.count || 0;
      }
  
      return new Response(JSON.stringify(response), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } catch (error) {
      console.error('Database error:', error);
      return errorResponse('Database error', 500, corsHeaders);
    }
  }
  
  /**
   * Update a card like (add or remove)
   */
  async function updateLike(env, body, corsHeaders) {
    // Check if required fields are provided
    if (!body || !body.sessionId || !body.cardPath || !body.action) {
      return errorResponse('SessionId, cardPath and action are required', 400, corsHeaders);
    }
  
    const { sessionId, cardPath, action } = body;
    const db = env.CARD_LIKES_DB; // D1 database binding name
  
    // Create tables if they don't exist
    await createTablesIfNeeded(db);
  
    // Validate action is either 'like' or 'unlike'
    if (action !== 'like' && action !== 'unlike') {
      return errorResponse('Action must be either "like" or "unlike"', 400, corsHeaders);
    }
  
    try {
      // Begin transaction
      const tx = db.batch();
  
      // Check if the user is within the daily like limit (if they're liking)
      if (action === 'like') {
        const userDailyLikeCountResult = await db.prepare(`
          SELECT COUNT(*) as count 
          FROM card_likes 
          WHERE session_id = ? 
          AND created_at > datetime('now', '-1 day')
        `).bind(sessionId).first();
  
        if (userDailyLikeCountResult && userDailyLikeCountResult.count >= 10) {
          return errorResponse('Daily like limit reached (10 likes per day)', 429, corsHeaders);
        }
      }
  
      // Check if the user has already liked the card
      const existingLikeResult = await db.prepare(`
        SELECT id 
        FROM card_likes 
        WHERE session_id = ? AND card_path = ?
      `).bind(sessionId, cardPath).first();
  
      // Perform the like or unlike action
      if (action === 'like' && !existingLikeResult) {
        // Add the like
        await db.prepare(`
          INSERT INTO card_likes (session_id, card_path, created_at) 
          VALUES (?, ?, datetime('now'))
        `).bind(sessionId, cardPath).run();
      } else if (action === 'unlike' && existingLikeResult) {
        // Remove the like
        await db.prepare(`
          DELETE FROM card_likes 
          WHERE session_id = ? AND card_path = ?
        `).bind(sessionId, cardPath).run();
      }
  
      // Get the updated like count for the card
      const updatedCountResult = await db.prepare(`
        SELECT COUNT(*) as count 
        FROM card_likes 
        WHERE card_path = ?
      `).bind(cardPath).first();
  
      // Return the result
      return new Response(JSON.stringify({
        success: true,
        action: action,
        newCount: updatedCountResult ? updatedCountResult.count : 0
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } catch (error) {
      console.error('Database error:', error);
      return errorResponse('Database error', 500, corsHeaders);
    }
  }
  
  /**
   * Create tables if they don't exist
   */
  async function createTablesIfNeeded(db) {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS card_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        card_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, card_path)
      )
    `).run();
  }
  
  /**
   * Helper to construct error responses
   */
  function errorResponse(message, status, corsHeaders) {
    return new Response(JSON.stringify({
      success: false,
      message: message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: status
    });
  }