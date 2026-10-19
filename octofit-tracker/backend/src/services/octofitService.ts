import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export async function createActivity(input: unknown) {
  const { userId, teamId, type, minutes } = (input ?? {}) as Record<string, unknown>;
  if (typeof userId !== 'string' || !OBJECT_ID_PATTERN.test(userId)) throw httpError(400, 'userId must be a valid id');
  if (typeof teamId !== 'string' || !OBJECT_ID_PATTERN.test(teamId)) throw httpError(400, 'teamId must be a valid id');
  if (typeof type !== 'string' || !type.trim()) throw httpError(400, 'type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) throw httpError(400, 'minutes must be a positive number');

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user) throw httpError(404, 'User not found');
  if (!team) throw httpError(404, 'Team not found');

  const activity = await Activity.create({ user: userId, team: teamId, type, minutes, points: minutes, occurredAt: new Date() });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const { name, mascot, members = [] } = (input ?? {}) as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) throw httpError(400, 'name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw httpError(400, 'mascot is required');
  if (!Array.isArray(members) || !members.every((id) => typeof id === 'string' && OBJECT_ID_PATTERN.test(id))) {
    throw httpError(400, 'members must be a list of valid ids');
  }
  const team = await Team.create({ name, mascot, members });
  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: unknown; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [String(_id), totalPoints]));
  const teams = await Team.find().lean();
  return teams
    .map((team) => ({ teamId: team._id, teamName: team.name, totalPoints: pointsByTeam.get(String(team._id)) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

const ACTIVITY_FOCUS: Record<string, string> = {
  run: 'endurance',
  cycle: 'endurance',
  walk: 'endurance',
  swim: 'endurance',
  row: 'endurance',
  strength: 'strength',
  lift: 'strength',
  stretch: 'mobility',
  yoga: 'mobility',
};

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw httpError(404, 'User not found');

  const recent = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const minutesByType = new Map<string, number>();
  for (const activity of recent) minutesByType.set(activity.type, (minutesByType.get(activity.type) ?? 0) + activity.minutes);
  const [topType] = [...minutesByType.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  const activityFocus = topType ? (ACTIVITY_FOCUS[topType] ?? topType) : undefined;

  const rank = (focus: string) => (focus === activityFocus ? 0 : focus === user.fitnessGoal ? 1 : 2);
  const workouts = (await Workout.find().lean()).sort((a, b) => rank(a.focus) - rank(b.focus));
  return workouts.slice(0, 3).map((workout) => ({
    ...workout,
    reason:
      workout.focus === activityFocus
        ? `Matches your recent ${topType} activity`
        : workout.focus === user.fitnessGoal
          ? `Supports your ${user.fitnessGoal} goal`
          : 'Adds variety to your routine',
  }));
}

export { User };
