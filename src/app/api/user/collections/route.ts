import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a service client that bypasses RLS
const createServiceClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/user/collections - Starting request');
    
    const supabase = createServiceClient();
    console.log('Supabase service client created successfully');
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('No authorization header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);
    
    // Verify the user with the service client
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('Auth result:', { user: user?.email, error: authError });
    
    if (authError || !user) {
      console.log('Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's collection using service client (bypasses RLS)
    const { data: collections, error } = await supabase
      .from('user_collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collections:', error);
      return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }

    console.log('Collections fetched successfully, count:', collections?.length);
    return NextResponse.json(collections);
  } catch (error) {
    console.error('Collections API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/user/collections - Starting request');
    
    const supabase = createServiceClient();
    console.log('Supabase service client created successfully');
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('No authorization header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);
    
    // Verify the user with the service client
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('Auth result:', { user: user?.email, error: authError });
    
    if (authError || !user) {
      console.log('Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', { game_id: body.game_id, has_game_data: !!body.game_data });

    const { game_id, game_data } = body;

    if (!game_id || !game_data) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Missing game_id or game_data' }, { status: 400 });
    }

    // Check if game already exists in collection using service client
    const { data: existing, error: checkError } = await supabase
      .from('user_collections')
      .select('id')
      .eq('user_id', user.id)
      .eq('game_id', game_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing game:', checkError);
      return NextResponse.json({ error: 'Failed to check existing game' }, { status: 500 });
    }

    if (existing) {
      console.log('Game already exists in collection');
      return NextResponse.json({ error: 'Game already in collection' }, { status: 400 });
    }

    // Add game to collection using service client (bypasses RLS)
    const { data, error } = await supabase
      .from('user_collections')
      .insert([
        {
          user_id: user.id,
          game_id,
          game_data,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding to collection:', error);
      return NextResponse.json({ error: 'Failed to add to collection' }, { status: 500 });
    }

    console.log('Game added successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Add to collection API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/user/collections - Starting request');
    
    const supabase = createServiceClient();
    console.log('Supabase service client created successfully');
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('No authorization header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);
    
    // Verify the user with the service client
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('Auth result:', { user: user?.email, error: authError });
    
    if (authError || !user) {
      console.log('Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      console.log('No game_id provided');
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    console.log('Removing game:', gameId);

    // Remove game from collection using service client (bypasses RLS)
    const { error } = await supabase
      .from('user_collections')
      .delete()
      .eq('user_id', user.id)
      .eq('game_id', gameId);

    if (error) {
      console.error('Error removing from collection:', error);
      return NextResponse.json({ error: 'Failed to remove from collection' }, { status: 500 });
    }

    console.log('Game removed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from collection API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 