const fs = require('fs');

const extractTextFromPdf = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const pdf = require('pdf-parse');
    const data = await pdf(dataBuffer);
    return (data && data.text) ? data.text : '';
};

const createTextChunks = (text, chunkSize = 800, overlap = 150) => {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return [];

    const chunks = [];
    let start = 0;
    while (start < cleaned.length) {
        const end = Math.min(start + chunkSize, cleaned.length);
        const chunk = cleaned.slice(start, end).trim();
        if (chunk) chunks.push(chunk);
        start += chunkSize - overlap;
        if (start < 0) start = 0;
    }
    return chunks;
};

module.exports = { extractTextFromPdf, createTextChunks };
