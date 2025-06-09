import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module';
import { GraphQLModule, registerEnumType } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getGraphqlConfig } from './utils/configs/grapql.config';
import { ChatModule } from './core/chat/chat.module';
import { ApolloDriver } from '@nestjs/apollo';
import { UserModule } from './core/user/user.module';
import {Premium, Prisma} from '@prisma/client';
import {JwtModule, JwtModuleOptions} from "@nestjs/jwt";


registerEnumType(Premium, {
	name: 'Premium',
});

@Module({
	imports: [
		PrismaModule,
		ConfigModule.forRoot({ isGlobal: true }),
		GraphQLModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			driver: ApolloDriver,
			useFactory: getGraphqlConfig,
		}),
		ChatModule,
		UserModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
