import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/domain/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/domain/entities/user.entity';

//@TODO: This service depends directly onl another service - user service. We ought to export out an user aggregator, to mitigate any chance of cylical dependency flows and to adhere to DDD flow (service will stitch together its current domain TS and other domain's Aggregators).
@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.usersService.findByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            // If the user is found and the password matches, return the user object without the password
            const { password: _, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: Omit<User, 'password'>) {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
