// app/api/matches/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

type Match = {
  id: number;
  name: string;
};

export async function GET() {
  const API_URL = 'https://api.pandascore.co/matches';
  const API_TOKEN = process.env.PANDASCORE_API_TOKEN;

  try {
    const response = await axios.get<Match[]>(API_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
