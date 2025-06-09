import {PassportStrategy} from "@nestjs/passport";
import {BadRequestException, Injectable} from "@nestjs/common";
import { ExtractJwt, Strategy } from 'passport-jwt';
import {ConfigService} from "@nestjs/config";
import {Premium, User} from "@prisma/client";
import {PrismaService} from "../../core/prisma/prisma.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(private readonly config: ConfigService, private readonly prismaService: PrismaService) {
		super({
			secretOrKey: config.getOrThrow("JWT_SECRET"),
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req) => req.cookies?.token
			])
		});
	}
	
	async validate(payload: {id: string}): Promise<{id: string, email: string, premium: Premium}> {
		const data:User | null = await this.prismaService.user.findUnique({where: {id: payload.id}});
		if(!data) throw new BadRequestException('Wrong token');
		return {
			email: data.email, id: data.id, premium: data.premium
		}
	}
}