import { ChatCloudflareWorkersAI } from "@langchain/cloudflare";
import { CloudflareD1MessageHistory } from "@langchain/cloudflare";
import { BufferMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough } from "langchain/runnables";

type GenerateQuestionParams = {
  sessionId: string;
  role: string;
  message: string;
  cloudflareAccountId: string;
  cloudflareApiToken: string;
};

export const generateQuestion = async (params: GenerateQuestionParams, db: D1Database) => {
  const { role, message, sessionId } = params;

  const memory = new BufferMemory({
    returnMessages: true,
    chatHistory: new CloudflareD1MessageHistory({
      tableName: "conversations",
      sessionId,
      database: db,
    }),
  });

  const model = new ChatCloudflareWorkersAI({
    model: "@cf/meta/llama-2-7b-chat-fp16",
    cloudflareAccountId: params.cloudflareAccountId,
    cloudflareApiToken: params.cloudflareApiToken
    // baseUrl: `https://gateway.ai.cloudflare.com/v1/{YOUR_ACCOUNT_ID}/{GATEWAY_NAME}/workers-ai/`,
  });
  const prompt = ChatPromptTemplate.fromMessages([
    ["system",  `Act as the interviewer asking me the interview questions for the ${role} position. I want you to answer only as the interviewer. Answer in English only. Ask me the questions one at a time and wait for my answers. Do not write explanations, be concrete and direct, and generate the question directly as an answer. Create the response in a paragraph of 200 characters or less.`],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]);

  const chain = RunnableSequence.from([
    {
      input: (initialInput) => initialInput.input,
      memory: () => memory.loadMemoryVariables({}),
    },
    {
      input: (previousOutput) => previousOutput.input,
      history: (previousOutput) => previousOutput.memory.history,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);
  const chainInput = {
    input: message
  }

  const response = await chain.invoke(chainInput);
  await memory.saveContext(chainInput, {
    output: response,
  });
  return response;
}

type GenerateFeedbackParams = {
  role: string;
  question: string;
  answer: string;
  cloudflareAccountId: string;
  cloudflareApiToken: string;
};

export const generateFeedback = async (params: GenerateFeedbackParams) => {
  const { role, question, answer } = params;
  const model = new ChatCloudflareWorkersAI({
    model: "@cf/meta/llama-2-7b-chat-fp16",
    cloudflareAccountId: params.cloudflareAccountId,
    cloudflareApiToken: params.cloudflareApiToken
    // Pass a custom base URL to use Cloudflare AI Gateway
    // baseUrl: `https://gateway.ai.cloudflare.com/v1/{YOUR_ACCOUNT_ID}/{GATEWAY_NAME}/workers-ai/`,
  });
  const response = await model.invoke([
    ["system", `Act as an interviewer who has generated feedback about the user's response for the ${role} position. Be specific and direct. Create the response in a paragraph of 200 characters or less.`],
    ["human", `Question: ${question}, my answer: ${answer}, please give feedback and tips to improve my answer.`],
  ]);
  return response;
}
