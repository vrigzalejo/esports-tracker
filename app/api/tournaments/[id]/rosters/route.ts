import { NextRequest, NextResponse } from 'next/server';
import { getTournamentRosters } from '@/lib/pandaScore';

type Props = {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;

  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const data = await getTournamentRosters(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament rosters' },
      { status: 500 }
    );
  }
} 
