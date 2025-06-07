import {Args, Mutation, Resolver, Subscription, Query} from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as process from "node:process";
import {MessageModel} from "./dto/message.model";


const pubSub = new RedisPubSub({
  connection : {
    host: process.env.HOST,
    port: Number(process.env.REDIS_PORT)
  }
})
@Resolver(() => MessageModel)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}
  
  
  @Query(() => Boolean)
  getMessage(){
    return true
  }
  
  @Mutation(() => Boolean)
  async sendMessage(
      @Args("user") user: string,
      @Args("sender")  sender: string,
      @Args("message") message: string,
  ) {
    await pubSub.publish(`chat:${user}`, {
      chat: {
        sender, message
      }
    });
    return true
  }
  
  
  @Subscription(() => MessageModel, {
    name: 'chat',
    resolve: (payload) => payload.chat
  })
  chatTrigger(@Args("user") user: string) {
    return pubSub.asyncIterator(`chat:${user}`);
  }
}
