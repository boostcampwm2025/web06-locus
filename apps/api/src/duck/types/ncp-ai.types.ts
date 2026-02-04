export interface NcpAiResponse {
  result: {
    message: {
      content: string;
    };
  };
}

export interface AiRecordContext {
  title: string;
  location: string;
  tags: string[];
}

export interface AiDuckPromptPayload {
  user_nickname: string;
  recent_records: AiRecordContext[];
}

export const createAiDuckPromptPayload = (
  nickname: string,
  records: AiRecordContext[],
): AiDuckPromptPayload => {
  return {
    user_nickname: nickname,
    recent_records: records,
  };
};
