import {Args, Context, Mutation, Query, Resolver} from '@nestjs/graphql';
import { UserService } from './user.service';
import {UserCreateModelModel, UserLoginData, UserLoginModel, UserModel} from './dto/user.model';
import {User} from "@prisma/client";
import {UseGuards} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {GqlAuthGuard} from "../../utils/guards/jwt-guard";

@Resolver(() => UserModel)
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Mutation(() => UserModel)
	async register(@Args('data') data: UserCreateModelModel): Promise<any> {
		return await this.userService.register(data);
	}
	
	@Query(() => UserLoginData)
	async login(@Args('data') data: UserLoginModel, @Context() context): Promise<UserLoginData> {
		return await this.userService.login(context.req, context.res,data);
	}
	
	
	@UseGuards(GqlAuthGuard)
	@Query(() => UserModel)
	async getById(@Args('id') id: string): Promise<User> {
		return this.userService.findById(id);
	}
	
	@Query(()=> Boolean)
	async refreshTokens(@Context() context): Promise<Boolean> {
		await this.userService.refreshTokens(context.req, context.res);
		return true;
	}
}
