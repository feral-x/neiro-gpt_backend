import {Args, Mutation, Resolver, Subscription, Query} from '@nestjs/graphql';
import { ChatService } from './chat.service';
import {MessageModel} from "./dto/message.model";
import {RedisPubSub} from "graphql-redis-subscriptions";
import {DeepseekMessageModel} from "./dto/deepseek.message.model";


const pubSub = new RedisPubSub({
  connection: {
    host: process.env.HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

@Resolver(() => MessageModel)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}
  
  
  @Query(()=> String)
  ping(){
    return "pong"
  }
  
  @Mutation(() => Boolean)
  async startChat(
      @Args('userId') userId: string,
      @Args('messages', { type: () => [DeepseekMessageModel] }) messages: DeepseekMessageModel[],
      @Args('message') message: string,
  ) {
    await this.chatService.chatStream(messages, message, userId);
    return true;
  }
  
  @Subscription(() => MessageModel, {
    name: 'chat',
    resolve: (payload) => payload.chat,
  })
  chat(@Args('userId') userId: string) {
    return pubSub.asyncIterator(`chat:${userId}`);
  }
  
}
