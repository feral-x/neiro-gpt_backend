import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MessageModel {
	@Field()
	sender: string;
	@Field()
	message: string;
}
