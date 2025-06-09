import { NextRequest, NextResponse } from 'next/server';
import { getTournamentRosters } from '@/lib/pandaScore';

type Props = {
  params: Promise<{
    tournamentId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  const { tournamentId } = await params;

  try {
    if (!tournamentId) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const data = await getTournamentRosters(tournamentId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament rosters' },
      { status: 500 }
    );
  }
} 
