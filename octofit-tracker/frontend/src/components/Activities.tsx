import { getJson } from '../api/client.js';
import { CapabilityCard, useLoad } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };

export default function Activities() {
  const state = useLoad(async () => (await getJson<{ activities: Activity[] }>('/api/activities')).activities);
  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points." noun="activities" state={state} emptyText="No activities recorded yet.">
      {state.status === 'ready' && (
        <ul className="list-group">
          {state.data.map((activity, index) => (
            <li className="list-group-item" key={activity._id ?? index}>{activity.type}: {activity.minutes} min, {activity.points} points</li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
