import { db } from "@/db";
import { sendMessageValidator } from "@/lib/validators/sendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";
import { pinecone } from "@/lib/pinecone";
import { openai } from "@/lib/openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Check if user is null or undefined
  if (!user || !user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: userId } = user;

  const { fileId, message } = sendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) {
    return new Response("Not Found", { status: 404 });
  }

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // 1. vectorize message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY!,
  });

  const pineconeIndex = pinecone.Index("gradus");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4);

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  // Send messages to OpenAI
  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "Use the provided essay context and any relevant information from the previous conversation to answer the user's question. Additionally, provide an artificial grade out of 100 for their essay context in markdown format.",
      },
      {
        role: "user",
        content: `Utilize the given pieces of essay context and any relevant details from our previous conversation to respond to the user's question. Present the answer in markdown format or offer an artificial grade to their essay based on any criteria they specify.
  
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages
    .map((message) => {
      return `${message.role === "user" ? "User" : "Assistant"}: ${
        message.content
      }\n`;
    })
    .join("")}
  
  \n----------------\n
  
  ESSAY CONTEXT:
  ${results.map((r) => r.pageContent).join("\n\n")}
  
  USER INPUT: ${message}`,
      },
    ],
  });

  // const response = await openai.chat.completions.create({
  //   model: "gpt-3.5-turbo",
  //   temperature: 0,
  //   stream: true,
  //   messages: [
  //     {
  //       role: "system",
  //       content: `Provide an artificial grade out of 100 for the user's essay based on the provided rubric. Grade Use the given context and previous conversation to assess the following criteria and present the evaluation in markdown format:

  //         1. **Organization (20 points):** Evaluate the clarity of the essay's structure, including the introduction, body paragraphs, and conclusion.

  //         2. **Thesis/Focus (20 points):** Assess the strength and clarity of the thesis statement and its alignment with the essay's central theme.

  //         3. **Development: Support (20 points):** Evaluate the use of specific details, examples, and references to substantiate the thesis and arguments.

  //         4. **Development: Analysis (20 points):** Assess the depth and coherence of the analysis, including connections between evidence and main ideas.

  //         5. **Mechanics: Sentence Craft & Style (10 points):** Evaluate the precision of language, sentence structure variety, tone, and overall style.

  //         6. **Mechanics: Grammar and Spelling (10 points):** Assess the essay's adherence to proper grammar, punctuation, and spelling.

  //         Please note that this grading is intended to be more stringent than usual, emphasizing high expectations and minimal tolerance for deficiencies.

  //         Please ensure that the response includes a clear breakdown of scores for each criterion and an overall summary of the essay's strengths and areas for improvement.
  //         `,
  //     },
  //     {
  //       role: "user",
  //       content: `**Use the following pieces of context to generate an artificial grade out of 100 for my essay based on the provided rubric. Do this in markdown format.**

  //   \n----------------\n

  //   **CONTEXT:**
  //   ${results.map((r) => r.pageContent).join("\n\n")}

  //   **USER INPUT:** ${message}

  //   `,
  //     },
  //   ],
  // });

  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
};
