import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface User {
  id: number;
  username: string;
  password?: string;
}

@Injectable()
export class AuthService {
  // In a real application, this would come from a database
  private users: User[] = [
    {
      id: 1,
      username: 'admin',
      // Password: 'admin123' (hashed)
      password: '$2b$10$K8wjZ1K5v1Q6v1Q6v1Q6vO1Q6v1Q6v1Q6v1Q6v1Q6v1Q6v1Q6vO', // Placeholder
    },
  ];

  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = this.users.find(u => u.username === username);
    
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, password: string): Promise<User> {
    const existingUser = this.users.find(u => u.username === username);
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: this.users.length + 1,
      username,
      password: hashedPassword,
    };

    this.users.push(newUser);
    const result = { id: newUser.id, username: newUser.username };
    return result;
  }
}