import type { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async validateLogin(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }
}
