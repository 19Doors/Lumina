import fg from 'fast-glob';
import { GoogleGenerativeAI } from "@google/generative-ai";

const modelName="models/gemini-1.5-flash-8b";
// const modelName="gemini-2.0-flash";

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
  let pdf = query[1];
  let emails = query[2];
  query=query[0];
  const heading = await model.generateContent("Write the heading for the query in bold: "+query);
  if(emails && emails.length>0) {
    query="Emails: "+emails+" \n";
  }
  if(pdf.length>0) {
    query="Read this "+pdf+" and answer, "+query;
  }
  const headingR = heading.response.text();
  const result = await model.generateContent(query);
  const rr = result.response.text();
  return [headingR, rr];
}

async function commandParse(query) {
  const prompt = `
You are a command parser. Given a user's query, return a JSON object with keys:
  - "type": The command types = ["email", "calendar", "search", "launch"]
  - "params": An object with parameters relevant to the command.

Examples:
If the user says "In my emails, what is going on?", return:
{
  "type": "email",
  "params": {
    "date": "today"
  }
}

If the user says "Open Spotify", return:
{
  "type": "launch",
  "params": {
    "app": "Spotify"
  }
}

No Markdowns

Now, parse the following user query and return only the JSON object:
"${query}"
`;
  const result = await model.generateContent(prompt);
  let rr = result.response.text();
  rr= rr.replace(/```json\s*|```/g, '').trim();

  try {
    const parsedCommand = JSON.parse(rr);
    console.log(parsedCommand);
    return parsedCommand;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return ;
  }
}

export {searchFiles, getAI, commandParse};
