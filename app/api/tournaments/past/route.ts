import { NextResponse } from 'next/server';
import { logApiRequest, logApiResponse, logApiError } from '@/lib/utils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const per_page = searchParams.get('per_page') || '20';

        const token = process.env.PANDASCORE_TOKEN;
        if (!token) {
            logApiError('/tournaments/past', 'PandaScore API token not configured');
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
            sort: '-begin_at'
        });

        const apiUrl = `https://api.pandascore.co/tournaments/past?${params.toString()}`;
        logApiRequest('/tournaments/past', apiUrl, 'GET', { page, per_page, include: 'teams', sort: '-begin_at' });

        const startTime = Date.now();
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 300 } // Cache for 5 minutes
        });
        const duration = Date.now() - startTime;

        if (!response.ok) {
            logApiError('/tournaments/past', `${response.status} ${response.statusText}`, {
                status: response.status,
                statusText: response.statusText,
                duration: `${duration}ms`
            });
            return NextResponse.json(
                { error: 'Failed to fetch past tournaments' },
                { status: response.status }
            );
        }

        const tournaments = await response.json();
        logApiResponse('/tournaments/past', response.status, response.statusText, duration, {
            count: tournaments.length
        });

        return NextResponse.json(tournaments);
    } catch (error) {
        console.error('Error fetching past tournaments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch past tournaments' },
            { status: 500 }
        );
    }
} 
