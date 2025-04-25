const express = require('express');
const router = express.Router();
const { getDB } = require('../db/mongoClient');
const { getOpenAIResponse } = require('../services/openaiService');
const { generatePDF } = require('../services/pdfService');
const { sendEmail } = require('../services/emailService');
const fs = require('fs')

router.post('/', async (req, res) => {
  const { email, message, reset = false } = req.body;
  const db = getDB();

  if (!email || !message) {
    return res.status(400).json({ error: 'Missing email or message' });
  }

  try {
    if (reset) {
      await db.collection('chat_history').deleteMany({ email });
    }
      // Insert user message into DB
    await db.collection('chat_history').insertOne({ email, role: 'user', message, created_at: new Date() });

    const aiResponse = await getOpenAIResponse(email, message, reset);

    // Save assistant response to DB
    await db.collection('chat_history').insertOne({ email, role: 'assistant', message: aiResponse, created_at: new Date() });

    // Retrieve full chat history for the email
    const fullChatHistory = await db.collection('chat_history')
    .find({ email })
    .sort({ created_at: 1 })
    .toArray();

    const formattedHistory = fullChatHistory.map(entry => ({
      role: entry.role === 'user' ? 'user' : 'assistant',
      content: entry.message
    }));

    if (aiResponse.toLowerCase().includes("finalized ai roadmap")) {
      const pdfBuffer = await generatePDF(formattedHistory);
      fs.writeFileSync("pdffile.pdf", Buffer.from(pdfBuffer), 'binary');
      console.log(`PDF saved`);
      await sendEmail(email, pdfBuffer);
    }
    res.status(200).json({ reply: aiResponse });
  } catch (err) {
    console.error('Chat route error:', err);
    res.status(500).json({ error: 'Failed to process chat message' });
  }

  // // Retrieve full chat history for the email
  // const fullChatHistory = await db.collection('chat_history')
  //   .find({ email })
  //   .sort({ created_at: 1 })
  //   .toArray();

  // // Format for OpenAI
  // const formattedHistory = fullChatHistory.map(entry => ({
  //   role: entry.role === 'user' ? 'user' : 'assistant',
  //   content: entry.message
  // }));

  // const aiResponse = await getOpenAIResponse(formattedHistory);



  // if (aiResponse.includes("finalized AI roadmap")) {
  //   const pdfBuffer = await generatePDF(formattedHistory);
  //   await sendEmail(email, pdfBuffer);
  // }
});

module.exports = router;