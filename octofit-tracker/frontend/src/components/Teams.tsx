import { getJson } from '../api/client.js';
import { CapabilityCard, useLoad } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot?: string; members: unknown[] };

export default function Teams() {
  const state = useLoad(async () => (await getJson<{ teams: Team[] }>('/api/teams')).teams);
  return (
    <CapabilityCard title="Teams" description="Manage teams and members." noun="teams" state={state} emptyText="No teams created yet.">
      {state.status === 'ready' && (
        <ul className="list-group">
          {state.data.map((team, index) => (
            <li className="list-group-item" key={team._id ?? index}><strong>{team.name}</strong> <span>({team.members.length} members)</span></li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
