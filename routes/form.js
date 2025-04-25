const express = require('express');
const router = express.Router();
const { getDB } = require('../db/mongoClient');

router.post('/', async (req, res) => {
  const { firstName, lastName, email, companyName, industry, companySize, jobTitle } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = getDB();
  const result = await db.collection('users').insertOne({
    first_name: firstName,
    last_name: lastName,
    email,
    company_name: companyName,
    industry,
    company_size: companySize,
    job_title: jobTitle,
    created_at: new Date()
  });

  res.status(200).json({ message: 'Form submitted successfully', id: result.insertedId });
});

module.exports = router;