const Database = require('better-sqlite3');

function initDatabase() {
  const db = new Database(':memory:');

  // Table produits
  db.exec(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      stock INTEGER DEFAULT 0
    )
  `);

  // Table utilisateurs (mots de passe en clair volontairement - leçon sur le hashing)
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'user'
    )
  `);

  // Table secrète (à découvrir via injection)
  db.exec(`
    CREATE TABLE secret_data (
      id INTEGER PRIMARY KEY,
      flag TEXT NOT NULL,
      description TEXT
    )
  `);

  // --- Données produits ---
  const insertProduct = db.prepare(
    'INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)'
  );

  const products = [
    ['MacBook Pro 16"', 'Laptop Apple M3 Pro, 18Go RAM, 512Go SSD', 2799.99, 'Laptops', 15],
    ['Dell XPS 15', 'Intel i7-13700H, 16Go RAM, 1To SSD', 1899.99, 'Laptops', 23],
    ['ThinkPad X1 Carbon', 'Intel i7, 16Go RAM, écran 14" 2.8K', 1649.99, 'Laptops', 8],
    ['iPhone 15 Pro', 'A17 Pro, 256Go, Titane Naturel', 1229.99, 'Smartphones', 42],
    ['Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3, 256Go, S Pen', 1419.99, 'Smartphones', 31],
    ['Google Pixel 8 Pro', 'Tensor G3, 128Go, Camera 50MP', 1099.99, 'Smartphones', 19],
    ['Sony WH-1000XM5', 'Casque sans fil, réduction de bruit active', 349.99, 'Audio', 56],
    ['AirPods Pro 2', 'Réduction de bruit, USB-C, Audio spatial', 279.99, 'Audio', 74],
    ['LG OLED C3 55"', 'TV OLED 4K, 120Hz, HDR Dolby Vision', 1299.99, 'TV', 12],
    ['Samsung 49" Odyssey G9', 'Écran gaming incurvé, 240Hz, DQHD', 1199.99, 'Moniteurs', 7],
    ['Logitech MX Master 3S', 'Souris sans fil, capteur 8000 DPI', 99.99, 'Accessoires', 89],
    ['Razer BlackWidow V4', 'Clavier mécanique RGB, switches Green', 169.99, 'Accessoires', 34],
  ];

  for (const p of products) {
    insertProduct.run(...p);
  }

  // --- Données utilisateurs ---
  const insertUser = db.prepare(
    'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)'
  );

  const users = [
    ['admin', 'SuperSecret123', 'admin@cybershop.com', 'admin'],
    ['jean_dupont', 'password123', 'jean@email.com', 'user'],
    ['marie_martin', 'qwerty2024', 'marie@email.com', 'user'],
  ];

  for (const u of users) {
    insertUser.run(...u);
  }

  // --- Données secrètes (flags CTF) ---
  const insertSecret = db.prepare(
    'INSERT INTO secret_data (flag, description) VALUES (?, ?)'
  );

  const secrets = [
    ['FLAG{sql_injection_master}', 'Bravo ! Tu as trouvé la table secrète.'],
    ['FLAG{union_select_pro}', 'Tu maîtrises les UNION SELECT !'],
    ['FLAG{data_exfiltration_101}', 'Extraction de données réussie.'],
  ];

  for (const s of secrets) {
    insertSecret.run(...s);
  }

  return db;
}

module.exports = initDatabase;
