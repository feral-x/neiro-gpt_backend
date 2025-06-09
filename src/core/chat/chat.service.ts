import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DeepseekMessageModel } from './dto/deepseek.message.model';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as readline from 'node:readline';

const pubSub = new RedisPubSub({
	connection: {
		host: process.env.HOST,
		port: Number(process.env.REDIS_PORT),
	},
});
@Injectable()
export class ChatService {
	constructor(private readonly configService: ConfigService) {}

	async chatStream(
		messages: DeepseekMessageModel[],
		message: string,
		userId: string,
	): Promise<any> {
		messages = [...messages, { role: 'user', content: message }];
		const base_uri = this.configService.get<string>('base_uri');
		const api_key = this.configService.get<string>('api_key');
		const model = this.configService.get('chat_model');

		try {
			const res = await axios.post(
				`${base_uri}/chat/completions`,
				{
					model: model,
					messages: messages,
					stream: true,
				},
				{
					responseType: 'stream',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${api_key}`,
					},
				},
			);

			const rl = readline.createInterface({ input: res.data });

			rl.on('line', async (line: string) => {
				if (line.startsWith('data: ')) {
					const json = line.replace(/^data:\s*/, '');

					if (json === '[DONE]') {
						await pubSub.publish(`chat:${userId}`, {
							chat: {
								sender: 'assistant',
								message: '[DONE]',
							},
						});
						rl.close();
						return;
					}

					try {
						const parsed = JSON.parse(json);
						const delta = parsed.choices?.[0]?.delta?.content;

						if (delta) {
							await pubSub.publish(`chat:${userId}`, {
								chat: {
									sender: 'assistant',
									message: delta,
								},
							});
						}
					} catch (err) {
						console.error('Stream parse error:', err);
					}
				}
			});
		} catch (error) {
			console.error(
				'Chat error:',
				error?.response?.data || error.message,
			);
			throw new InternalServerErrorException('Chat failed');
		}
	}
}
