import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const per_page = searchParams.get('per_page') || '20';

        const token = process.env.PANDASCORE_TOKEN;
        if (!token) {
            return NextResponse.json(
                { error: 'PandaScore API token not configured' },
                { status: 500 }
            );
        }

        const params = new URLSearchParams({
            token,
            page,
            per_page,
            include: 'teams'
        });

        const response = await fetch(
            `https://api.pandascore.co/tournaments/running?${params.toString()}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 300 } // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            console.error('PandaScore API error:', response.status, response.statusText);
            return NextResponse.json(
                { error: 'Failed to fetch running tournaments' },
                { status: response.status }
            );
        }

        const tournaments = await response.json();
        return NextResponse.json(tournaments);
    } catch (error) {
        console.error('Error fetching running tournaments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch running tournaments' },
            { status: 500 }
        );
    }
} 