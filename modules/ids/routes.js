const path = require('path');
const express = require('express');
const { parseRule, analyze } = require('./engine');
const { generateTraffic, generateScenario } = require('./traffic');

module.exports = function (app) {

  // Servir les fichiers statiques du module
  app.use('/ids', express.static(path.join(__dirname, 'public')));

  // ============================================
  // Analyser du trafic avec des règles custom
  // ============================================
  app.post('/ids/api/analyze', (req, res) => {
    const { rules, packetCount, attackRatio } = req.body;

    if (!rules || !rules.trim()) {
      return res.json({ success: false, error: 'Aucune regle fournie' });
    }

    const packets = generateTraffic(packetCount || 30, attackRatio || 0.3);
    const result = analyze(rules, packets);

    res.json({
      success: true,
      ...result,
      packets
    });
  });

  // ============================================
  // Valider une règle Snort (vérifier la syntaxe)
  // ============================================
  app.post('/ids/api/validate-rule', (req, res) => {
    const { rule } = req.body;

    if (!rule || !rule.trim()) {
      return res.json({ success: false, error: 'Regle vide' });
    }

    const parsed = parseRule(rule.trim());

    if (parsed) {
      res.json({ success: true, parsed, message: 'Regle valide !' });
    } else {
      res.json({ success: false, error: 'Syntaxe invalide. Format attendu : alert <proto> <src_ip> <src_port> -> <dst_ip> <dst_port> (msg:"..."; sid:...;)' });
    }
  });

  // ============================================
  // Mode guidé : récupérer un scénario
  // ============================================
  app.get('/ids/api/scenario/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const scenario = generateScenario(id);

    if (scenario) {
      // Ne pas envoyer la règle attendue au client
      const { expectedRule, ...safe } = scenario;
      res.json({ success: true, ...safe });
    } else {
      res.json({ success: false, error: 'Scenario introuvable' });
    }
  });

  // ============================================
  // Mode guidé : tester une règle sur un scénario
  // ============================================
  app.post('/ids/api/scenario/:id/test', (req, res) => {
    const id = parseInt(req.params.id);
    const { rule } = req.body;
    const scenario = generateScenario(id);

    if (!scenario) {
      return res.json({ success: false, error: 'Scenario introuvable' });
    }

    if (!rule || !rule.trim()) {
      return res.json({ success: false, error: 'Aucune regle fournie' });
    }

    const result = analyze(rule, scenario.packets);

    // Compter les vrais positifs (attaques détectées)
    const attackPackets = scenario.packets.filter(p => p.type === 'attack');
    const detectedAttacks = result.alerts.filter(a => {
      const pkt = scenario.packets.find(p =>
        `${p.src}:${p.srcPort}` === a.packet.src && `${p.dst}:${p.dstPort}` === a.packet.dst
      );
      return pkt && pkt.type === 'attack';
    });

    // Faux positifs (trafic normal détecté)
    const falsePositives = result.alerts.filter(a => {
      const pkt = scenario.packets.find(p =>
        `${p.src}:${p.srcPort}` === a.packet.src && `${p.dst}:${p.dstPort}` === a.packet.dst
      );
      return pkt && pkt.type === 'normal';
    });

    const score = detectedAttacks.length;
    const maxScore = scenario.expectedDetections;
    const passed = score >= maxScore && falsePositives.length === 0;

    res.json({
      success: true,
      passed,
      score,
      maxScore,
      falsePositives: falsePositives.length,
      totalAlerts: result.alerts.length,
      alerts: result.alerts,
      packets: scenario.packets,
      message: passed
        ? 'Bravo ! Toutes les attaques detectees sans faux positif !'
        : score < maxScore
          ? `${score}/${maxScore} attaques detectees. Affine ta regle.`
          : `Attention : ${falsePositives.length} faux positif(s) ! Ta regle est trop large.`
    });
  });

  // ============================================
  // Générer du trafic brut (pour le mode libre)
  // ============================================
  app.get('/ids/api/traffic', (req, res) => {
    const count = Math.min(parseInt(req.query.count) || 30, 100);
    const ratio = Math.min(parseFloat(req.query.ratio) || 0.3, 0.8);
    const packets = generateTraffic(count, ratio);
    res.json({ success: true, packets });
  });

  // ============================================
  // Indice pour un challenge
  // ============================================
  app.get('/ids/api/hint/:id', (req, res) => {
    const scenario = generateScenario(parseInt(req.params.id));
    if (scenario) {
      res.json({ success: true, hint: scenario.hint, expectedRule: scenario.expectedRule });
    } else {
      res.json({ success: false, error: 'Scenario introuvable' });
    }
  });
};
