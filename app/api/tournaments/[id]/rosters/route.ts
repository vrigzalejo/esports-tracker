import { NextResponse } from 'next/server';
import { getTournamentRosters } from '@/lib/pandaScore';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const data = await getTournamentRosters(params.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament rosters' },
      { status: 500 }
    );
  }
} 
