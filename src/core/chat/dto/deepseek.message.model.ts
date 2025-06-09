import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class DeepseekMessageModel {
	@Field(() => String)
	role: string;
	@Field(() => String)
	content: string;
}
