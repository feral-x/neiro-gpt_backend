import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import {JwtStrategy} from "../../utils/strategy/jwt.strategy";
import {JwtModule, JwtModuleOptions, JwtService} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
				secret: configService.get('JWT_SECRET'),
			})
		}),
	],
	providers: [UserResolver, UserService, JwtStrategy],
})
export class UserModule {}
