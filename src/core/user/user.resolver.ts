import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserCreateModelModel, UserModel } from './dto/user.model';

@Resolver(() => UserModel)
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Mutation(() => UserModel)
	async register(@Args('data') data: UserCreateModelModel): Promise<any> {
		return await this.userService.register(data);
	}
}
