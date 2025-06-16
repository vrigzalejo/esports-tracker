import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const per_page = searchParams.get('per_page') || '20';

        console.log('🚀 [API] Fetching upcoming tournaments:', {
            page,
            per_page,
            timestamp: new Date().toISOString()
        });

        const token = process.env.PANDASCORE_TOKEN;
        if (!token) {
            console.error('❌ [API] PandaScore API token not configured');
            return NextResponse.json(
                { error: 'PandaScore API token not configured' },
                { status: 500 }
            );
        }

        const params = new URLSearchParams({
            token,
            page,
            per_page,
            include: 'teams',
            sort: 'begin_at'
        });

        const apiUrl = `https://api.pandascore.co/tournaments/upcoming?${params.toString()}`;
        console.log('📡 [PandaScore] Calling upcoming tournaments API:', {
            url: apiUrl.replace(token, 'TOKEN_HIDDEN'),
            params: { page, per_page, include: 'teams', sort: 'begin_at' }
        });

        const startTime = Date.now();
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 300 } // Cache for 5 minutes
        });
        const duration = Date.now() - startTime;

        console.log('📊 [PandaScore] Upcoming tournaments API response:', {
            status: response.status,
            statusText: response.statusText,
            duration: `${duration}ms`,
            headers: {
                'content-type': response.headers.get('content-type'),
                'x-rate-limit-remaining': response.headers.get('x-rate-limit-remaining'),
                'x-rate-limit-reset': response.headers.get('x-rate-limit-reset')
            }
        });

        if (!response.ok) {
            console.error('❌ [PandaScore] Upcoming tournaments API error:', {
                status: response.status,
                statusText: response.statusText,
                duration: `${duration}ms`
            });
            return NextResponse.json(
                { error: 'Failed to fetch upcoming tournaments' },
                { status: response.status }
            );
        }

        const tournaments = await response.json();
        console.log('✅ [PandaScore] Upcoming tournaments fetched successfully:', {
            count: tournaments.length,
            duration: `${duration}ms`,
            firstTournament: tournaments[0]?.name || 'N/A'
        });

        return NextResponse.json(tournaments);
    } catch (error) {
        console.error('💥 [API] Error fetching upcoming tournaments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch upcoming tournaments' },
            { status: 500 }
        );
    }
} 