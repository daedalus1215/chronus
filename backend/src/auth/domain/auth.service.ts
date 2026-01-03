import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAggregator, UserProjection } from '../../users/domain/aggregators/user.aggregator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userAggregator: UserAggregator,
        private readonly jwtService: JwtService
    ) { }

    async validateUser(username: string, password: string): Promise<UserProjection | null> {
        const user = await this.userAggregator.findByUsernameForAuth(username);
        if (user && await bcrypt.compare(password, user.password)) {
            // If the user is found and the password matches, return the user object without the password
            const { password: _, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: UserProjection) {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
