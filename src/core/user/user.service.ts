import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {UserCreateModelModel, UserLoginData, UserLoginModel, UserModel} from './dto/user.model';
import * as argon2 from "argon2"
import {JwtService} from "@nestjs/jwt";
import {Request, Response} from "express";

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

	async register(data: UserCreateModelModel): Promise<UserLoginData> {
		const user = await this.prisma.user.findUnique({
			where: { email: data.email },
		});
		if (user) throw new BadRequestException('User already exists');
		const new_user = await this.prisma.user.create({
			data: {
				...data,
				password: await argon2.hash(data.password)
			},
		});
		
		delete (new_user as Partial<User>).password;
		return new_user
	}

	async login(req:Request, res:Response, data: UserLoginModel): Promise<UserModel> {
		const user = await this.prisma.user.findUnique({
			where: { email: data.email },
		});
		if (!user) throw new BadRequestException('Wrong data');
		const compare = await argon2.verify(user.password, data.password);
		if (!compare) throw new BadRequestException('Wrong data');
		delete (user as Partial<User>).password;
		await this.createTokens(req, res, user.id)
		return user
	}
	
	async createTokens(req: Request, res: Response, id: string):Promise<void> {
		const token = await this.jwtService.signAsync({id}, {
			expiresIn: "15m"
		})
		const refresh_token = await this.jwtService.signAsync({id}, {
			expiresIn: "7d"
		})
		
		res.cookie('token', token, {
			httpOnly: true,
		})
		res.cookie('refresh_token', refresh_token, {
			httpOnly: true,
		})
	}
	
	
	async refreshTokens(req: Request, res: Response):Promise<void> {
		const token = req.cookies.refresh_token;
		if(!token) throw new BadRequestException('Invalid token');
		const validateToken = await this.jwtService.verifyAsync<{id: string}>(token)
		if(!validateToken) throw new BadRequestException('Invalid token');
		await this.createTokens(req, res, validateToken.id)
	}
	
	async findById(id: string): Promise<User> {
		const user = await this.prisma.user.findUnique({where: {id: id}});
		if (!user) throw new BadRequestException('User already exists');
		return user;
	}
}
