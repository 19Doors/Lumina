import fg from 'fast-glob';
import { GoogleGenerativeAI } from "@google/generative-ai";

const modelName="models/gemini-1.5-flash-8b";
const genAI = new GoogleGenerativeAI("AIzaSyDR_EVwevdInqeRYjpYodyEYqXYJc0dmw0");
const model = genAI.getGenerativeModel({ model: modelName});

async function searchFiles(baseDir, query, depth = 5) {
  const pattern = `**/*${query}*`;
  const entriesDir = await fg(pattern, { caseSensitiveMatch: false, onlyDirectories:true, cwd: baseDir, deep: depth });
  const entriesFiles = await fg(pattern, { caseSensitiveMatch: false, onlyFiles:true, cwd: baseDir, deep: depth });
  return [entriesFiles, entriesDir]
}

async function getAI(query) {
  console.log(query);
  const result = await model.generateContent(query);
  return result.response.text();
  return "OK";
}

export {searchFiles, getAI};
