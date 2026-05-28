export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}
export type Role = 'admin' | 'user' | 'moderator';
