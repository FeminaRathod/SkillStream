const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChromaClient } = require('chromadb');

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const chromaConfig = {};
if (process.env.CHROMA_SERVER_URL) chromaConfig.url = process.env.CHROMA_SERVER_URL;
if (process.env.CHROMA_API_KEY) chromaConfig.apiKey = process.env.CHROMA_API_KEY;

const chroma = new ChromaClient(chromaConfig);

const getCollection = async (name) => {
    try {
        return await chroma.getCollection({ name });
    } catch (error) {
        return null;
    }
};

const getOrCreateCollection = async (name) => {
    const existing = await getCollection(name);
    if (existing) return existing;
    return await chroma.createCollection({ name });
};

module.exports = { genAI, chroma, getCollection, getOrCreateCollection };
