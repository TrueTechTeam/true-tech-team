import type { Handler, HandlerEvent } from '@netlify/functions';

const SPORTS_ENGINE_TOKEN_URL = 'https://user.sportsengine.com/oauth/token';

const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { code } = JSON.parse(event.body || '{}');

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Authorization code is required' }),
      };
    }

    const clientId = process.env.SPORTS_ENGINE_CLIENT_ID;
    const clientSecret = process.env.SPORTS_ENGINE_CLIENT_SECRET;
    const redirectUri = process.env.SPORTS_ENGINE_REDIRECT_URI;

    if (!clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Sports Engine credentials not configured' }),
      };
    }

    // Exchange authorization code for tokens
    const response = await fetch(SPORTS_ENGINE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Sports Engine token exchange failed:', error);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ message: 'Failed to exchange code for tokens' }),
      };
    }

    const tokens = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(tokens),
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

export { handler };
