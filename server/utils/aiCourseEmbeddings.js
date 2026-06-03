const { genAI, getOrCreateCollection, getCollection } = require('../config/ai');
const { extractTextFromPdf, createTextChunks } = require('./pdfUtils');

const EMBEDDING_MODEL = 'gemini-embedding-2';
const ANSWER_MODEL = 'gemini-flash-latest';

const ensureGeminiConfigured = () => {
    if (!genAI) {
        throw new Error('GEMINI_API_KEY is not configured. Set GEMINI_API_KEY in server/.env.');
    }
};
const MAX_CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

/**
 * Generate an embedding vector for a single text input using Gemini.
 */
const generateEmbedding = async (text) => {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
};

const processCoursePdfUpload = async (courseId, pdfFilePath) => {
    ensureGeminiConfigured();
    const text = await extractTextFromPdf(pdfFilePath);
    if (!text || !text.trim()) {
        throw new Error('Uploaded PDF did not contain extractable text.');
    }

    const chunks = createTextChunks(text, MAX_CHUNK_SIZE, CHUNK_OVERLAP);
    if (!chunks.length) {
        throw new Error('Could not split PDF text into chunks.');
    }

    const collectionName = `course-${courseId}`;
    const collection = await getOrCreateCollection(collectionName);

    const ids = chunks.map((_, index) => `${courseId}-${index}`);
    const embeddings = [];

    for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk);
        if (!embedding || !embedding.length) {
            throw new Error('Failed to generate embedding for PDF chunk.');
        }
        embeddings.push(embedding);
    }

    await collection.add({
        ids,
        embeddings,
        documents: chunks,
        metadatas: chunks.map((chunk, index) => ({
            courseId,
            chunkIndex: index,
            preview: chunk.slice(0, 250),
        })),
    });

    return { collectionName, chunkCount: chunks.length };
};

const answerCourseQuestion = async (courseId, question, topK = 5) => {
    ensureGeminiConfigured();
    const collectionName = `course-${courseId}`;
    const collection = await getCollection(collectionName);
    if (!collection) {
        throw new Error('No vector collection found for this course.');
    }

    const questionEmbedding = await generateEmbedding(question);
    if (!questionEmbedding || !questionEmbedding.length) {
        throw new Error('Failed to generate embedding for the question.');
    }

    const queryResult = await collection.query({
        queryEmbeddings: [questionEmbedding],
        nResults: topK,
        include: ['documents', 'distances', 'metadatas'],
    });

    const documents = Array.isArray(queryResult.documents) ? queryResult.documents[0] : [];
    const distances = Array.isArray(queryResult.distances) ? queryResult.distances[0] : [];

    const relevantChunks = documents.map((doc, index) => ({
        text: doc,
        score: distances[index],
    })).filter((item) => item.text && item.text.trim());

    if (!relevantChunks.length) {
        throw new Error('No relevant content matched the question.');
    }

    const context = relevantChunks.map((chunk, index) => `Chunk ${index + 1}:
${chunk.text}`).join('\n\n---\n\n');

    const prompt = `You are an expert course assistant. Answer the student's question in detail using ONLY the information from the Context provided below.
CRITICAL INSTRUCTION: Do NOT use phrases like "Based on the provided course content", "According to the context", or "The document says". Answer directly and naturally as if you are the instructor.
If the answer is not contained in the context, respond with: "I don't have enough information from the uploaded course content to answer that."

Context:
${context}

Question:
${question}

Answer:`;

    const model = genAI.getGenerativeModel({ model: ANSWER_MODEL });
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            maxOutputTokens: 2500,
        },
    });

    const response = result.response;
    const answer = response.text() || '';

    return {
        answer: answer.trim() || 'Unable to generate an answer from the provided context.',
        sources: relevantChunks,
    };
};

module.exports = { processCoursePdfUpload, answerCourseQuestion };
