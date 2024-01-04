import { Pinecone } from "@pinecone-database/pinecone";

const pineconeApiKey = process.env.PINECONE_API_KEY;

if (!pineconeApiKey) {
  throw new Error(
    "Pinecone API key is missing. Please set the PINECONE_API_KEY environment variable."
  );
}

export const pinecone = new Pinecone({
  apiKey: pineconeApiKey,
  environment: "gcp-starter",
});
