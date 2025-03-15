type Match = {
  id: number;
  name: string;
};

async function fetchMatches(): Promise<Match[]> {
  const res = await fetch('http://localhost:3000/api/matches'); // Adjust URL for production
  if (!res.ok) {
    throw new Error('Failed to fetch matches');
  }
  return res.json();
}

export default async function Home() {
  const matches = await fetchMatches();

  return (
    <main>
      <h1>Esports Matches</h1>
      <ul>
        {matches.map((match) => (
          <li key={match.id}>{match.name}</li>
        ))}
      </ul>
    </main>
  );
}
