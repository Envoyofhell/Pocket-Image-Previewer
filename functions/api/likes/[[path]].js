export async function onRequest(context) {
    // Get path and method
    const url = new URL(context.request.url);
    const path = url.pathname.split('/api/likes/')[1] || '';
    const method = context.request.method;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  
    // Handle OPTIONS
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      });
    }
  
    // Parse body if POST
    let body = {};
    if (method === 'POST') {
      try {
        body = await context.request.json();
      } catch (e) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid JSON'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
    }
  
    // Create tables if needed
    try {
      await context.env.CARD_LIKES_DB.prepare(`
        CREATE TABLE IF NOT EXISTS card_likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          card_path TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(session_id, card_path)
        )
      `).run();
    } catch (e) {
      // Table might already exist or D1 not configured
      console.error("Table creation error:", e);
    }
  
    // Handle endpoints
    try {
      switch (path) {
        case 'getAll':
          const sessionId = body.sessionId;
          
          // Get all cards with likes
          const cardLikes = await context.env.CARD_LIKES_DB.prepare(`
            SELECT card_path, COUNT(*) as count FROM card_likes GROUP BY card_path
          `).all();
          
          // Get user's liked cards
          const userLikes = await context.env.CARD_LIKES_DB.prepare(`
            SELECT card_path FROM card_likes WHERE session_id = ?
          `).bind(sessionId).all();
          
          // Format response
          const response = {
            cardLikes: {},
            userLikeCount: userLikes.results?.length || 0
          };
          
          if (cardLikes.results?.length) {
            cardLikes.results.forEach(row => {
              response.cardLikes[row.card_path] = {
                count: row.count,
                userLiked: false
              };
            });
          }
          
          if (userLikes.results?.length) {
            userLikes.results.forEach(row => {
              if (response.cardLikes[row.card_path]) {
                response.cardLikes[row.card_path].userLiked = true;
              } else {
                response.cardLikes[row.card_path] = {
                  count: 1,
                  userLiked: true
                };
              }
            });
          }
          
          return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        case 'update':
          const {cardPath, action, sessionId: userSessionId} = body;
          
          // Check for required fields
          if (!cardPath || !action || !userSessionId) {
            return new Response(JSON.stringify({
              success: false,
              message: 'Missing required fields'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            });
          }
          
          // Handle like/unlike
          if (action === 'like') {
            try {
              await context.env.CARD_LIKES_DB.prepare(`
                INSERT INTO card_likes (session_id, card_path, created_at)
                VALUES (?, ?, datetime('now'))
              `).bind(userSessionId, cardPath).run();
            } catch (e) {
              // Probably already liked
              console.error("Like insertion error:", e);
            }
          } else if (action === 'unlike') {
            await context.env.CARD_LIKES_DB.prepare(`
              DELETE FROM card_likes 
              WHERE session_id = ? AND card_path = ?
            `).bind(userSessionId, cardPath).run();
          }
          
          // Get new count
          const newCount = await context.env.CARD_LIKES_DB.prepare(`
            SELECT COUNT(*) as count FROM card_likes WHERE card_path = ?
          `).bind(cardPath).first();
          
          return new Response(JSON.stringify({
            success: true,
            newCount: newCount.count || 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        default:
          return new Response(JSON.stringify({
            success: false,
            message: 'Endpoint not found'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          });
      }
    } catch (e) {
      console.error("API error:", e);
      return new Response(JSON.stringify({
        success: false,
        message: 'Server error'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
  }