const path = require('path');
const express = require('express');
const crypto = require('crypto');

const sessions = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > 3600000) sessions.delete(id);
  }
}, 300000);

module.exports = function (app) {
  app.use('/crypto', express.static(path.join(__dirname, 'public')));

  // Générer une paire de clés DH (réutilise prime/generator si fournis)
  app.post('/crypto/api/dh/keygen', (req, res) => {
    try {
      const { prime, generator } = req.body;
      let dh;

      if (prime && generator) {
        dh = crypto.createDiffieHellman(
          Buffer.from(prime, 'hex'),
          Buffer.from(generator, 'hex')
        );
      } else {
        dh = crypto.createDiffieHellman(512);
      }

      dh.generateKeys();
      const sessionId = crypto.randomBytes(8).toString('hex');
      sessions.set(sessionId, { dh, createdAt: Date.now() });

      res.json({
        success: true,
        sessionId,
        publicKey: dh.getPublicKey('hex'),
        privateKey: dh.getPrivateKey('hex'),
        prime: dh.getPrime('hex'),
        generator: dh.getGenerator('hex'),
        keyBits: dh.getPrime().length * 8
      });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  // Calculer le secret partagé à partir de la clé publique de l'autre partie
  app.post('/crypto/api/dh/compute', (req, res) => {
    try {
      const { sessionId, otherPublicKey } = req.body;
      const session = sessions.get(sessionId);
      if (!session) return res.json({ success: false, error: 'Session invalide ou expirée' });

      const sharedSecret = session.dh.computeSecret(Buffer.from(otherPublicKey, 'hex'));
      // Dériver une clé AES-256 via SHA-256 du secret partagé
      const aesKey = crypto.createHash('sha256').update(sharedSecret).digest('hex');

      res.json({
        success: true,
        sharedSecret: sharedSecret.toString('hex'),
        aesKey
      });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  // Chiffrer un message avec AES-256-CBC
  app.post('/crypto/api/aes/encrypt', (req, res) => {
    try {
      const { aesKey, plaintext } = req.body;
      if (!aesKey || !plaintext) return res.json({ success: false, error: 'Paramètres manquants' });

      const keyBuf = Buffer.from(aesKey, 'hex');
      if (keyBuf.length !== 32) return res.json({ success: false, error: 'Clé AES invalide (256 bits requis)' });

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', keyBuf, iv);
      const ciphertext = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex');

      res.json({ success: true, ciphertext, iv: iv.toString('hex') });
    } catch (e) {
      res.json({ success: false, error: e.message });
    }
  });

  // Déchiffrer un message avec AES-256-CBC
  app.post('/crypto/api/aes/decrypt', (req, res) => {
    try {
      const { aesKey, ciphertext, iv } = req.body;
      if (!aesKey || !ciphertext || !iv) return res.json({ success: false, error: 'Paramètres manquants' });

      const keyBuf = Buffer.from(aesKey, 'hex');
      const ivBuf = Buffer.from(iv, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuf, ivBuf);
      const plaintext = decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8');

      res.json({ success: true, plaintext });
    } catch (e) {
      res.json({ success: false, error: 'Déchiffrement échoué: clé ou données incorrectes' });
    }
  });
};
