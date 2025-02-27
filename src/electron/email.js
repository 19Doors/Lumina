import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import {authenticate} from '@google-cloud/local-auth';
import {google} from 'googleapis';
import { htmlToText } from 'html-to-text';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

function decodeBase64(data) {
  // Gmail returns URL-safe base64, so replace URL-safe characters.
  const buff = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  return buff.toString('utf-8');
}
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function extractBody(parts) {
  let body = "";
  for(let part of parts) {
    if(part.mimeType=='text/plain') {
      body+=decodeBase64(part.body.data)+"\n";
    }else if(part.mimeType=='text/html'){
      body += htmlToText(decodeBase64(part.body.data))+"\n";
    }
  }
  if(body.length==0) body="No body here.";
  return body;
}

async function getEmails(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 15,
    });
    const msgs = res.data.messages || [];
    if(msgs.length==0) {
      console.log("No msg found");
      return;
    }
    let emails = "";
    let i=1;
    for(const msg of msgs){
      const m = await gmail.users.messages.get({id: msg.id, userId: "me", format:"full"});
      // console.log(m.data.payload.parts[0]);
      
      const header = m.data.payload.headers;
      const subject = header.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
      const from = header.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
      const to = header.find(h => h.name.toLowerCase() === 'to')?.value || 'No Recipients';
      const date = header.find(h => h.name.toLowerCase() === 'date')?.value || 'No Date';
      // If labels are available in the message, include them. They might come from a separate field.
	//
      const labels = m.data.labelIds ? m.data.labelIds.join(', ') : '';
      let body="NO body here";
      if(m.data.payload && m.data.payload.parts)
       body = extractBody(m.data.payload.parts);
      // console.log(body);
      emails = `
	Email No: ${i++}
	From: ${from}
	To: ${to}
	Date: ${date}
	Labels: ${labels}
	Subject: ${subject}
	Body: ${body}
	  `+emails.trim();
      // emails+="Email "+i+":\n";
      // emails+="From"+from+":\n";
      // emails+="Subject: "+subject+" \n";
      // emails+="Body: "+body+" \n";
    }
  return emails;
    console.log("FUNCTION "+emails);
    // return emails;
    // console.log(res.messages[0].payload.headers);
}
async function getEmailText() {
  let result="";
  let auth = await authorize();
  result = await getEmails(auth);
  return result;
}
export {getEmailText};
