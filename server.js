require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Modules
require('./modules/phishing/routes')(app);
require('./modules/sqli/routes')(app);
require('./modules/ids/routes')(app);
require('./modules/crypto/routes')(app);

app.listen(PORT, () => {
  console.log(`\n  CyberLab démarré sur http://localhost:${PORT}\n`);
});
