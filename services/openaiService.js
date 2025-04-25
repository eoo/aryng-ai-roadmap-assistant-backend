// backend/services/openaiService.js
const { OpenAI } = require('openai');
const { getDB } = require('../db/mongoClient');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

/**
 * Sends a message to a preconfigured OpenAI Assistant using a persistent thread per session.
 * Supports thread reset.
 * @param {string} email
 * @param {string} message
 * @param {boolean} resetThread
 * @returns {Promise<string>} Assistant's response
 */
async function getOpenAIResponse(email, message, resetThread = false) {
  try {
    const db = getDB();
    let threadDoc = await db.collection('threads').findOne({ email });

    if (resetThread || !threadDoc || !threadDoc.thread_id) {
      const thread = await openai.beta.threads.create();
      await db.collection('threads').updateOne(
        { email },
        { $set: { thread_id: thread.id, assistant_id: ASSISTANT_ID, updated_at: new Date() } },
        { upsert: true }
      );
      threadDoc = { thread_id: thread.id };
    }

    // Send message to the thread
    await openai.beta.threads.messages.create(threadDoc.thread_id, {
      role: 'user',
      content: message
    });

    const run = await openai.beta.threads.runs.create(threadDoc.thread_id, {
      assistant_id: ASSISTANT_ID
    });

    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(threadDoc.thread_id, run.id);
      if (runStatus.status === 'completed') break;
      console.log('here ', runStatus.status)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } while (runStatus.status === 'queued' || runStatus.status === 'in_progress');

    const messagesResp = await openai.beta.threads.messages.list(threadDoc.thread_id);
    const lastMsg = messagesResp.data.find(m => m.role === 'assistant');

    return lastMsg?.content?.[0]?.text?.value || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error('OpenAI Assistant Error:', error);
    return "Sorry, I'm having trouble connecting to the assistant right now.";
  }
}

module.exports = { getOpenAIResponse };


module.exports = { getOpenAIResponse };

// async function getOpenAIResponse(history) {
//   const response = await openai.chat.completions.create({
//     model: 'gpt-4',
//     messages: history,
//   });
//   return response.choices[0].message.content;
// }