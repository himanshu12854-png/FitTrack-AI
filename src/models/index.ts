export { default as User } from './User';
export type { IUser } from './User';

export { default as UserFitnessProfile } from './UserFitnessProfile';
export type {
  IUserFitnessProfile,
  Gender,
  ActivityLevel,
  FitnessGoal,
} from './UserFitnessProfile';

export { default as DietLog } from './DietLog';
export type { IDietLog, IFoodEntry } from './DietLog';

export { default as WorkoutPlan } from './WorkoutPlan';
export type {
  IWorkoutPlan,
  IWorkoutDay,
  IExercise,
  WorkoutCreator,
} from './WorkoutPlan';

export { default as WorkoutSession } from './WorkoutSession';
export type {
  IWorkoutSession,
  ISessionExercise,
  ISetRecord,
} from './WorkoutSession';

export { default as ExerciseHistory } from './ExerciseHistory';
export type { IExerciseHistory } from './ExerciseHistory';

export { default as AIConversation } from './AIConversation';
export type {
  IAIConversation,
  IMessage,
  MessageRole,
} from './AIConversation';
