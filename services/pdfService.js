const markdownpdf = require("markdown-pdf");
const { Readable } = require("stream");

async function generatePDF(chatHistory) {
  console.log('generating pdf');
  const markdown = chatHistory.map(m => `**${m.role.toUpperCase()}**: ${m.content}`).join('\n\n');
  const stream = Readable.from([markdown]);
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.pipe(markdownpdf()).on('data', chunk => chunks.push(chunk)).on('end', () => resolve(Buffer.concat(chunks))).on('error', reject);
  });
}

module.exports = { generatePDF };