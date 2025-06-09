import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import * as process from 'node:process';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import {GraphQLError} from "graphql/error";

export function getGraphqlConfig(): ApolloDriverConfig {
	return {
		sortSchema: true,
		autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
		playground: false,
		installSubscriptionHandlers: true,
		subscriptions: {
			'graphql-ws': true,
		},
		debug: false,
		formatError: (error: GraphQLError) => {
			const originalError = (error.extensions?.originalError || {}) as any;
			
			return {
				message: originalError.message || error.message,
				extensions: {
					code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
					statusCode: originalError.statusCode || 500,
				},
			};
		},
		plugins: [ApolloServerPluginLandingPageLocalDefault()],
		context: ({ req, res }) => ({ req, res }),
	};
}
