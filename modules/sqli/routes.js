const path = require('path');
const express = require('express');
const initDatabase = require('./db');

module.exports = function (app) {
  const db = initDatabase();

  // Servir les fichiers statiques du module
  app.use('/sqli', express.static(path.join(__dirname, 'public')));

  // ============================================
  // ROUTE VULNÉRABLE : Recherche produits
  // Concaténation directe → injection SQL possible
  // ============================================
  app.get('/sqli/api/search', (req, res) => {
    const query = req.query.q || '';

    // VULNÉRABLE INTENTIONNELLEMENT - concaténation directe
    const sql = `SELECT * FROM products WHERE name LIKE '%${query}%' OR description LIKE '%${query}%' OR category LIKE '%${query}%'`;

    try {
      const results = db.prepare(sql).all();
      res.json({ success: true, results, query: sql });
    } catch (err) {
      // Renvoyer l'erreur SQL (aide l'attaquant - vulnérabilité volontaire)
      res.json({ success: false, error: err.message, query: sql });
    }
  });

  // ============================================
  // ROUTE VULNÉRABLE : Login admin
  // Concaténation directe → bypass d'authentification
  // ============================================
  app.post('/sqli/api/login', (req, res) => {
    const { username, password } = req.body;

    // VULNÉRABLE INTENTIONNELLEMENT
    const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    try {
      const user = db.prepare(sql).get();
      if (user) {
        res.json({ success: true, user: { id: user.id, username: user.username, role: user.role }, query: sql });
      } else {
        res.json({ success: false, message: 'Identifiants incorrects', query: sql });
      }
    } catch (err) {
      res.json({ success: false, error: err.message, query: sql });
    }
  });

  // ============================================
  // ROUTE SÉCURISÉE : Recherche avec requête paramétrée
  // Pour comparaison éducative
  // ============================================
  app.get('/sqli/api/search-safe', (req, res) => {
    const query = req.query.q || '';

    const sql = `SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ?`;
    const param = `%${query}%`;

    try {
      const results = db.prepare(sql).all(param, param, param);
      res.json({ success: true, results, query: sql, params: [param, param, param] });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // ============================================
  // ROUTE : Récupérer tous les produits
  // ============================================
  app.get('/sqli/api/products', (req, res) => {
    const results = db.prepare('SELECT * FROM products').all();
    res.json({ success: true, results });
  });

  // ============================================
  // ROUTE : Récupérer les utilisateurs (pour panel admin)
  // ============================================
  app.get('/sqli/api/users', (req, res) => {
    const results = db.prepare('SELECT * FROM users').all();
    res.json({ success: true, results });
  });

  // ============================================
  // ROUTE : Récupérer les données secrètes (pour panel admin)
  // ============================================
  app.get('/sqli/api/secrets', (req, res) => {
    const results = db.prepare('SELECT * FROM secret_data').all();
    res.json({ success: true, results });
  });

  // ============================================
  // ROUTE : Indices pour le mode guidé
  // ============================================
  app.get('/sqli/api/hint/:level', (req, res) => {
    const hints = {
      1: {
        title: "Provoque une erreur SQL",
        hint: "Essaie de taper un caractère spécial qui est utilisé dans la syntaxe SQL... comme une apostrophe.",
        solution: "'"
      },
      2: {
        title: "Affiche tous les produits",
        hint: "En SQL, OR 1=1 est toujours vrai. Comment fermer la requête existante et ajouter cette condition ?",
        solution: "' OR 1=1 --"
      },
      3: {
        title: "Trouve le nombre de colonnes",
        hint: "La clause ORDER BY permet de trier par numéro de colonne. Si tu tries par la colonne 7 et que ça plante, c'est qu'il y en a moins de 7.",
        solution: "' ORDER BY 6 --"
      },
      4: {
        title: "Extrais les utilisateurs",
        hint: "UNION SELECT permet de combiner les résultats de deux requêtes. Tu connais le nombre de colonnes (6). La table s'appelle 'users' avec les colonnes : username, password, email, role.",
        solution: "' UNION SELECT 1,username,password,email,role,6 FROM users --"
      },
      5: {
        title: "Trouve la table secrète",
        hint: "Dans SQLite, la table sqlite_master contient la structure de toutes les tables. Les colonnes utiles sont 'name' et 'sql'.",
        solution: "' UNION SELECT 1,name,sql,3,4,5 FROM sqlite_master --"
      }
    };

    const level = parseInt(req.params.level);
    if (hints[level]) {
      res.json({ success: true, ...hints[level] });
    } else {
      res.json({ success: false, message: 'Niveau invalide' });
    }
  });
};
