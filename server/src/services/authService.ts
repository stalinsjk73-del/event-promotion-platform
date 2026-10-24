import bcrypt from 'bcryptjs';
import { db, UserEntity } from '../utils/db';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../schemas/authSchema';
import { AppError } from '../middleware/errorHandler';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER';
  createdAt?: Date;
}

export const authService = {
  async register(input: RegisterInput): Promise<{ user: SafeUser; token: string }> {
    const existing = await db.user.findUnique({ email: input.email });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await db.user.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role || 'ORGANIZER',
    });

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    const token = signToken({
      userId: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    return { user: safeUser, token };
  },

  async login(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
    const user = await db.user.findUnique({ email: input.email });
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    const token = signToken({
      userId: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    return { user: safeUser, token };
  },

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await db.user.findUnique({ id: userId });
    if (!user) {
      throw new AppError('User account not found.', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  },
};
