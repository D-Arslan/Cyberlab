# CyberLab - Contexte projet

## Etat actuel

- Landing page CyberLab a la racine (hub avec cartes modules)
- MVP Phishing deploye et fonctionnel (deplace dans modules/phishing/)
- Module SQL Injection fonctionnel (mode guide + mode libre)
- Icones SVG inline partout (pas d'emojis)

- **URL en ligne** : https://cyberlab-uxey.onrender.com
- **Repo GitHub** : D-Arslan/Cyberlab (branche main)
- **Hebergement** : Render (plan gratuit, Node.js)
- **Email** : Resend API (cle dans variables d'environnement Render)
- **Email destinataire** : difarslan@gmail.com (compte Resend associe)

## Stack

- Backend : Node.js + Express
- Frontend : HTML/CSS/JS pur (pas de framework)
- BDD : better-sqlite3 (in-memory, pour le module SQLi)
- Email : Resend API (HTTP, pas SMTP - Render bloque SMTP)
- Deploiement : Render (auto-deploy sur push vers main)

## Structure actuelle

```
Spoof/
├── server.js          # Serveur Express + charge les modules
├── package.json       # express, better-sqlite3, dotenv
├── .env               # RESEND_API_KEY, EMAIL_TO, PORT
├── .env.example
├── .gitignore
├── RAPPORT.md         # Documentation complete du projet
├── public/
│   └── index.html     # Landing page CyberLab (hub modules)
└── modules/
    ├── phishing/
    │   ├── routes.js      # POST /phishing/submit + fichiers statiques
    │   └── public/
    │       ├── index.html     # Clone Google login
    │       └── awareness.html # Page de sensibilisation
    └── sqli/
        ├── db.js          # BDD SQLite in-memory (products, users, secret_data)
        ├── routes.js      # Routes API vulnerables + securisees + hints
        └── public/
            ├── index.html     # Landing page (choix mode guide / libre)
            ├── shop.html      # CyberShop vulnerable (recherche + challenges)
            ├── login.html     # Login admin vulnerable
            ├── admin.html     # Panel admin (users, flags)
            └── education.html # Theorie SQLi + prevention
```

## Variables d'environnement

- `RESEND_API_KEY` : Cle API Resend (re_...)
- `EMAIL_TO` : Adresse de reception des identifiants captures
- `PORT` : Port du serveur (3001 en local, attribue par Render en prod)

## Decisions techniques

- **Resend au lieu de Nodemailer/SMTP** : Render bloque les ports SMTP (465/587). Resend utilise HTTPS.
- **Logo Google en texte CSS** : Le SVG ne rendait pas correctement. Chaque lettre est un span avec la couleur correspondante.
- **Pas de base de donnees pour le phishing** : MVP simple, les identifiants sont envoyes par mail uniquement.
- **Resend gratuit** : Ne peut envoyer qu'a l'adresse du compte Resend (difarslan@gmail.com).
- **Architecture modulaire** : Chaque module a son propre dossier dans modules/ avec routes.js + public/. Le server.js les charge.
- **SVG inline au lieu d'emojis** : Meilleur rendu cross-platform, colores selon le theme (#00ff41 vert, #ff4444 rouge, #ffaa00 jaune).

## Vision future : CyberLab

Le projet est prevu pour evoluer en plateforme educative de cybersecurite :

### Modules prevus
1. **Phishing** (fait) : Clone de pages de login + capture + sensibilisation
2. **SQL Injection** (fait) : CyberShop vulnerable, mode guide (5 challenges) + mode libre + page educative
3. **Keylogger** : Keylogger JavaScript web-based + affichage temps reel
4. **Brute Force** : Outil de test contre hashs/formulaires vulnerables
5. **Network Scanner** : Mini nmap (scan de ports)
6. **Password Analyzer** : Analyse de force de mot de passe + API HaveIBeenPwned

### Architecture cible
```
CyberLab/
├── server.js
├── modules/
│   ├── phishing/       # Templates + routes
│   ├── keylogger/      # Payload JS + routes
│   ├── bruteforce/     # Engine + routes
│   └── scanner/        # Scanner + routes
├── dashboard/          # Interface admin commune
└── public/             # Pages educatives par module
```

### Fonctionnalites a ajouter
- Dashboard admin avec stats en temps reel
- Plusieurs templates de phishing (Google, Microsoft, Discord, Instagram)
- Gestion de campagnes
- Page educative par module (theorie + demo)
- Rapports PDF
- Base de donnees SQLite pour historique

## Notes

- Le serveur Render gratuit s'endort apres 15 min d'inactivite (~50s pour reveiller)
- Pour la demo : ouvrir le lien 1 min avant pour reveiller le serveur
- Le .env n'est PAS commite (dans .gitignore)
- nodemailer est encore dans package.json mais n'est plus utilise (peut etre retire)

## Module SQL Injection - Details

### Concept
Fausse boutique en ligne "CyberShop" avec des champs de recherche et login volontairement vulnerables a l'injection SQL.

### Deux modes
- **Mode guide** : 5 challenges progressifs avec indices (erreur SQL → OR 1=1 → ORDER BY → UNION SELECT users → sqlite_master)
- **Mode libre** : La boutique vulnerable sans aide, pour tester ses competences

### Base de donnees (SQLite in-memory)
- `products` : 12 produits tech (laptops, smartphones, audio...)
- `users` : 3 utilisateurs dont admin (mots de passe en clair volontairement)
- `secret_data` : 3 flags CTF a decouvrir via injection

### Routes API
- `GET /sqli/api/search?q=` : Recherche VULNERABLE (concatenation)
- `POST /sqli/api/login` : Login VULNERABLE (concatenation)
- `GET /sqli/api/search-safe?q=` : Recherche SECURISEE (requete parametree, pour comparaison)
- `GET /sqli/api/hint/:level` : Indices pour le mode guide (1-5)
- `GET /sqli/api/products` : Liste tous les produits
- `GET /sqli/api/users` : Liste les utilisateurs (panel admin)
- `GET /sqli/api/secrets` : Liste les flags (panel admin)

### Pages
- `/` : Landing page CyberLab (hub avec cartes modules)
- `/phishing/` : Clone Google login
- `/phishing/awareness.html` : Page de sensibilisation
- `/sqli/` : Landing page avec choix du mode
- `/sqli/shop.html?mode=guided|free` : Boutique vulnerable
- `/sqli/login.html` : Login admin vulnerable
- `/sqli/admin.html` : Panel admin (apres login reussi)
- `/sqli/education.html` : Theorie + prevention + exemples reels
