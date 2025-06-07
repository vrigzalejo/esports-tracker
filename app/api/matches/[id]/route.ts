import { NextResponse } from 'next/server';
import { getMatchDetails } from '@/lib/pandaScore';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json(
                { error: 'Match ID is required' },
                { status: 400 }
            );
        }

        const match = await getMatchDetails(id);
        return NextResponse.json(match);
    } catch (error) {
        console.error('Error fetching match details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch match details' },
            { status: 500 }
        );
    }
} 