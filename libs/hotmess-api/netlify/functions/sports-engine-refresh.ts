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
    const { refresh_token } = JSON.parse(event.body || '{}');

    if (!refresh_token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Refresh token is required' }),
      };
    }

    const clientId = process.env.SPORTS_ENGINE_CLIENT_ID;
    const clientSecret = process.env.SPORTS_ENGINE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Sports Engine credentials not configured' }),
      };
    }

    // Refresh the access token
    const response = await fetch(SPORTS_ENGINE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Sports Engine token refresh failed:', error);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ message: 'Failed to refresh token' }),
      };
    }

    const tokens = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(tokens),
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

export { handler };
