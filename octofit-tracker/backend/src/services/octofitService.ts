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

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
