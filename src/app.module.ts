import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module';
import {GraphQLModule} from "@nestjs/graphql";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {getGrapqlConfig} from "./utils/configs/grapql.config";
import { ChatModule } from './core/chat/chat.module';
import {ApolloDriver} from "@nestjs/apollo";


@Module({
  imports: [PrismaModule,
      ConfigModule.forRoot({ isGlobal: true }),
      GraphQLModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        driver: ApolloDriver,
        useFactory: getGrapqlConfig
    }),
      ChatModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
