import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  AiConfigMissingException,
  AiGenerationFailedException,
  AiParseFailedException,
} from './exception/duck.exceptions';
import {
  DUCK_AI_FEW_SHOT,
  DUCK_AI_MODEL_CONFIG,
  DUCK_AI_SYSTEM_PROMPT,
} from './constants/duck-ai.constants';
import {
  AiDuckPromptPayload,
  AiRecordContext,
  createAiDuckPromptPayload,
  NcpAiResponse,
} from './types/ncp-ai.types';

@Injectable()
export class NcpAiService {
  private readonly logger = new Logger(NcpAiService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateDuckComments(
    nickname: string,
    recentRecords: AiRecordContext[],
  ): Promise<string[]> {
    const { url, apiKey } = this.getValidatedConfig();
    const payload = createAiDuckPromptPayload(nickname, recentRecords);

    const rawResponse = await this.requestClovaAi(url, apiKey, payload);

    return this.parseJsonResponse<string[]>(rawResponse);
  }

  private getValidatedConfig() {
    const url = this.configService.get<string>('NCP_CLOVA_STUDIO_URL');
    const apiKey = this.configService.get<string>('NCP_CLOVA_STUDIO_API_KEY');

    if (!url || !apiKey) throw new AiConfigMissingException();
    return { url, apiKey };
  }

  private async requestClovaAi(
    url: string,
    apiKey: string,
    payload: AiDuckPromptPayload,
  ): Promise<string> {
    try {
      const { data } = await axios.post<NcpAiResponse>(
        url,
        {
          messages: [
            { role: 'system', content: DUCK_AI_SYSTEM_PROMPT },
            ...DUCK_AI_FEW_SHOT,
            { role: 'user', content: JSON.stringify(payload) },
          ],
          ...DUCK_AI_MODEL_CONFIG,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        },
      );

      return data.result.message.content;
    } catch (error) {
      this.logger.error(
        `[NCP AI Error] ${error instanceof Error ? error.message : error}`,
      );
      throw new AiGenerationFailedException();
    }
  }

  private parseJsonResponse<T>(content: string): T {
    try {
      const cleaned = content.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch {
      this.logger.error(`[AI Parse Error] 원문: ${content}`);
      throw new AiParseFailedException(content);
    }
  }
}
