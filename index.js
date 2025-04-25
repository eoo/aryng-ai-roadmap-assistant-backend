const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectToMongo } = require('./db/mongoClient');

const formRoutes = require('./routes/form');
const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/submit-form', formRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;

connectToMongo().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
