import { getJson } from '../api/client.js';
import { CapabilityCard, useLoad } from './CapabilityCard.js';

type Suggestion = { _id?: string; title: string; reason?: string };

// Seeded demo user; the API requires an email to personalise suggestions.
const DEMO_USER_EMAIL = 'mona@example.com';

export default function Workouts() {
  const state = useLoad(async () => (await getJson<{ suggestions: Suggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent(DEMO_USER_EMAIL)}`)).suggestions);
  return (
    <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." noun="workout suggestions" state={state} emptyText="No workout suggestions yet.">
      {state.status === 'ready' && (
        <ul className="list-group">
          {state.data.map((suggestion, index) => (
            <li className="list-group-item" key={suggestion._id ?? index}><strong>{suggestion.title}</strong> <span className="text-muted">{suggestion.reason}</span></li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
