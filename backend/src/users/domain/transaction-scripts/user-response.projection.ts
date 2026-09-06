/**
 * User response projection -- user data as returned to API consumers,
 * without the password hash. Wire-compatible with the former
 * Omit<User, 'password'> shape (email is optional and omitted from JSON
 * when unset).
 */
export type UserResponseProjection = {
  id: number;
  username: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
};
