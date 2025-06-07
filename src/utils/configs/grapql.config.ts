import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";
import { join } from "path";
import * as process from "node:process";
import {ApolloServerPluginLandingPageLocalDefault} from '@apollo/server/plugin/landingPage/default';

export function getGrapqlConfig():ApolloDriverConfig {
	return {
		sortSchema: true,
		autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
		playground: false,
		installSubscriptionHandlers: true,
		subscriptions: {
			"graphql-ws": true
		},
		plugins: [ApolloServerPluginLandingPageLocalDefault()],
		context: ({ req, res }) => ({ req, res }),
	}
}