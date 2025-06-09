import { Field, HideField, ID, InputType, ObjectType } from '@nestjs/graphql';
import {Exclude} from "class-transformer";
import {Premium} from "@prisma/client";

@ObjectType()
export class UserModel {
	@Field(() => ID)
	id: string;
	@Field()
	email: string;
	@Field()
	@HideField()
	@Exclude()
	password?: string;
	@Field(() => Premium)
	premium: Premium;
}

@InputType()
export class UserCreateModelModel {
	@Field()
	email: string;
	@Field()
	@HideField()
	password: string;
}

@InputType()
export class UserLoginModel {
	@Field()
	email: string;
	@Field()
	@HideField()
	password: string;
}
