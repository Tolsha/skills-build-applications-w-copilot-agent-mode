import { getJson } from '../api/client.js';
import { CapabilityCard, useLoad } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const state = useLoad(async () => (await getJson<{ leaderboard: Entry[] }>('/api/leaderboard')).leaderboard);
  return (
    <CapabilityCard title="Leaderboard" description="Compare team point totals." noun="leaderboard" state={state} emptyText="No leaderboard scores yet.">
      {state.status === 'ready' && (
        <ol className="list-group list-group-numbered">
          {state.data.map((entry) => (
            <li className="list-group-item" key={entry.rank}><strong>{entry.teamName}</strong> <span>{entry.totalPoints}</span> points</li>
          ))}
        </ol>
      )}
    </CapabilityCard>
  );
}
