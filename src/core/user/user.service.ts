import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {UserCreateModelModel, UserLoginModel, UserModel} from './dto/user.model';
import * as argon2 from "argon2"

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async register(data: UserCreateModelModel): Promise<UserModel> {
		const user = await this.prisma.user.findUnique({
			where: { email: data.email },
		});
		if (user) throw new BadRequestException('User already exists');
		const {id, email, premium} = await this.prisma.user.create({
			data: {
				...data,
				password: await argon2.hash(data.password)
			},
		});
		
		return {
			id,
			email,
			premium,
		};
	}

	async login(data: UserLoginModel): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { email: data.email },
		});
		if (!user) throw new BadRequestException('Wrong data');
		const compare = await argon2.verify(user.password, data.password);
		if (!compare) throw new BadRequestException('Wrong data');
		return user;
	}
}
