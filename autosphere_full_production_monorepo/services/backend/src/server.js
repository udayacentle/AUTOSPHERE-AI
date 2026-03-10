
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const SECRET = "AUTOSPHERE_SECRET";

app.post('/auth/login', (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/vehicles/1', (req, res) => {
  res.json({ mobilityScore: 870 });
});

app.listen(3000, () => console.log("Backend running on 3000"));
