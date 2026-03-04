# Rapport de projet - CyberLab

## Informations

- **Projet** : CyberLab - Plateforme educative de cybersecurite
- **Auteur** : Arslan D.
- **Date** : 20 Fevrier 2026 (Phishing) / 4 Mars 2026 (SQL Injection)
- **URL de la demo** : https://cyberlab-uxey.onrender.com

---

# PARTIE 1 : Simulation de Phishing

---

## 1. Introduction

Ce projet consiste en la mise en place d'un site web de phishing fonctionnel dans un cadre académique. L'objectif est de reproduire une page de connexion Google afin de capturer les identifiants saisis par un utilisateur, puis de les transmettre par email a l'attaquant. Une page de sensibilisation est affichee apres la capture pour informer la victime qu'elle vient d'etre piegee.

---

## 2. Objectifs

- Comprendre le fonctionnement d'une attaque par phishing
- Reproduire une page de connexion realiste (Google)
- Mettre en place un systeme de capture et d'exfiltration d'identifiants par email
- Sensibiliser l'utilisateur aux risques du phishing via une page de revelation post-capture
- Deployer le site en ligne pour une demonstration fonctionnelle

---

## 3. Stack technique

| Composant | Technologie | Role |
|-----------|-------------|------|
| Frontend | HTML / CSS / JavaScript | Page de login Google clone + page de sensibilisation |
| Backend | Node.js + Express | Serveur web, reception des identifiants |
| Email | Resend API | Envoi des identifiants captures par email |
| Deploiement | Render (plan gratuit) | Hebergement en ligne |
| Versioning | Git + GitHub | Gestion du code source |

---

## 4. Architecture du projet

```
Spoof/
├── server.js              # Serveur Express + endpoint de capture + envoi email
├── package.json           # Dependances du projet
├── .env                   # Variables d'environnement (cle API, email destinataire)
├── .env.example           # Template de configuration
├── .gitignore             # Exclusion de node_modules et .env
└── public/
    ├── index.html          # Clone de la page de connexion Google
    └── awareness.html      # Page de sensibilisation post-phishing
```

---

## 5. Fonctionnement detaille

### 5.1 Schema de l'attaque

```
  Attaquant                        Victime                         Serveur
     |                               |                               |
     |   1. Envoie le lien piege     |                               |
     |------------------------------>|                               |
     |                               |   2. Ouvre le lien            |
     |                               |------------------------------>|
     |                               |   3. Affiche le clone Google  |
     |                               |<------------------------------|
     |                               |                               |
     |                               |   4. Saisit email             |
     |                               |   (transition etape 2)        |
     |                               |                               |
     |                               |   5. Saisit mot de passe      |
     |                               |   6. Clique "Suivant"         |
     |                               |------------------------------>|
     |                               |                               |
     |   7. Email avec identifiants  |                               |
     |<------------------------------|------- POST /submit --------->|
     |                               |                               |
     |                               |   8. Redirection vers         |
     |                               |   page de sensibilisation     |
     |                               |<------------------------------|
```

### 5.2 Etape 1 - Page de login (index.html)

La page reproduit fidelement l'interface de connexion Google avec un flow en deux etapes :

**Etape email :**
- Logo Google avec les couleurs officielles (bleu #4285F4, rouge #EA4335, jaune #FBBC05, vert #34A853)
- Titre "Connexion" et sous-titre "Utiliser votre compte Google"
- Champ de saisie avec label flottant (floating label)
- Liens "Adresse e-mail oubliee ?" et "Creer un compte"
- Bouton "Suivant" bleu
- Footer avec selection de langue et liens Aide/Confidentialite/Conditions

**Etape mot de passe :**
- Titre "Bienvenue"
- Chip affichant l'email saisi precedemment avec icone utilisateur
- Champ mot de passe avec label flottant
- Checkbox "Afficher le mot de passe"
- Lien "Mot de passe oublie ?"
- Bouton "Suivant"

**Techniques utilisees :**
- Transition animee entre les deux etapes (fadeIn CSS avec translateX)
- Validation des champs (messages d'erreur identiques a Google)
- Support de la touche Entree pour la navigation
- Spinner de chargement apres soumission
- Design responsive (adaptation mobile)

### 5.3 Etape 2 - Capture et exfiltration (server.js)

Lorsque la victime clique sur "Suivant" a l'etape du mot de passe :

1. Le JavaScript envoie une requete `POST /submit` avec les donnees :
   ```json
   {
     "email": "victime@example.com",
     "password": "motdepasse123"
   }
   ```

2. Le serveur Express recoit la requete et extrait :
   - L'email et le mot de passe du body
   - L'adresse IP via le header `x-forwarded-for`
   - La date/heure au format francais

3. Le serveur appelle l'API Resend pour envoyer un email HTML contenant :
   - L'email capture
   - Le mot de passe capture
   - L'adresse IP de la victime
   - La date et l'heure de la capture

4. Le serveur repond `{ success: true }`

### 5.4 Etape 3 - Sensibilisation (awareness.html)

Apres la capture, la victime est redirigee vers une page de sensibilisation qui :

- Informe clairement : "Vous avez ete piege."
- Explique en 4 etapes ce qui s'est passe
- Fournit des conseils de protection :
  - Verifier l'URL avant de saisir des identifiants
  - Activer l'authentification a deux facteurs (2FA)
  - Ne pas cliquer sur les liens suspects
  - Utiliser un gestionnaire de mots de passe
  - Acceder aux sites en tapant l'URL manuellement
- Propose un lien vers le vrai Google

---

## 6. Deploiement

### 6.1 Hebergement

Le projet est deploye sur **Render** (plan gratuit) :
- **URL** : https://cyberlab-uxey.onrender.com
- **Build command** : `npm install`
- **Start command** : `node server.js`
- **Variables d'environnement** configurees dans le dashboard Render (non commitees dans le code)

### 6.2 Service d'email

L'envoi d'emails utilise **Resend** (API HTTP) au lieu de SMTP car :
- Les hebergeurs cloud (Render, Heroku, etc.) bloquent les ports SMTP (465, 587)
- Resend fonctionne via HTTPS (port 443), non bloque
- L'API est simple : un seul appel `fetch()` avec la cle API en header

---

## 7. Elements de credibilite du clone

| Element | Implementation |
|---------|---------------|
| Logo | Texte "Google" avec les couleurs officielles par lettre |
| Police | Google Sans / Roboto (chargees depuis Google Fonts) |
| Couleurs | Bleu #1a73e8 (boutons), gris #5f6368 (texte secondaire), fond #f0f4f9 |
| Flow | 2 etapes identiques au vrai Google (email puis mot de passe) |
| Labels | Labels flottants (floating labels) comme l'original |
| Favicon | Favicon Google officiel |
| Footer | Selecteur de langue + liens Aide/Confidentialite/Conditions |
| Erreurs | Messages d'erreur avec icone rouge identiques a Google |
| Animation | Transition laterale entre les etapes |

**Seul indice de phishing** : l'URL dans la barre d'adresse (cyberlab-uxey.onrender.com au lieu de accounts.google.com).

---

## 8. Donnees capturees

Pour chaque victime, les informations suivantes sont collectees et envoyees par email :

| Donnee | Source |
|--------|--------|
| Email / telephone | Champ de saisie etape 1 |
| Mot de passe | Champ de saisie etape 2 |
| Adresse IP | Header HTTP `x-forwarded-for` |
| Date et heure | Horodatage serveur (timezone Europe/Paris) |

---

## 9. Limites et axes d'amelioration

### Limites actuelles
- L'URL trahit l'attaque (pas de domaine custom)
- Le serveur Render gratuit se met en veille apres 15 min d'inactivite (delai de ~50s au reveil)
- Un seul template disponible (Google)
- Pas de dashboard pour visualiser les captures en temps reel

### Ameliorations possibles
- Achat d'un nom de domaine ressemblant (ex: accounts-g00gle.com)
- Ajout de templates supplementaires (Microsoft, Instagram, Discord)
- Dashboard d'administration avec statistiques
- Gestion de campagnes de phishing (envoi d'emails pieges)
- Rapports PDF automatiques
- Integration dans une plateforme plus large (CyberLab) avec d'autres modules de securite

---

## 10. Aspects ethiques et legaux

Ce projet est realise **exclusivement dans un cadre academique**. En situation reelle :

- Le phishing est un **delit** puni par la loi (article 226-4-1 du Code penal, article 323-1 et suivants)
- Toute utilisation hors cadre educatif est **illegale**
- Les donnees capturees dans cette demo ne sont **pas conservees**
- La page de sensibilisation informe immediatement la victime

---

## 11. References

- MITRE ATT&CK - Phishing (T1566) : https://attack.mitre.org/techniques/T1566/
- OWASP - Phishing : https://owasp.org/www-community/attacks/Phishing
- ANSSI - Bonnes pratiques : https://www.ssi.gouv.fr/
- Node.js : https://nodejs.org/
- Express.js : https://expressjs.com/
- Resend : https://resend.com/docs
- Render : https://render.com/docs

---
---

# PARTIE 2 : SQL Injection Lab

## 1. Introduction

Ce module est un laboratoire interactif d'injection SQL. Il met en place une fausse boutique en ligne ("CyberShop") volontairement vulnerable, permettant a l'utilisateur d'apprendre a exploiter et comprendre les injections SQL dans un environnement controle. Deux modes sont proposes : un mode guide avec 5 challenges progressifs, et un mode libre pour tester ses competences sans aide.

---

## 2. Objectifs

- Comprendre le fonctionnement d'une injection SQL
- Apprendre les differents types d'injections (tautologie, UNION SELECT, extraction de schema)
- Decouvrir la methodologie d'un attaquant etape par etape
- Comparer code vulnerable et code securise (requetes parametrees)
- Sensibiliser aux bonnes pratiques de prevention

---

## 3. Stack technique

| Composant | Technologie | Role |
|-----------|-------------|------|
| Frontend | HTML / CSS / JavaScript | Interface CyberShop + challenges interactifs |
| Backend | Node.js + Express | Serveur web, routes API vulnerables et securisees |
| Base de donnees | better-sqlite3 (in-memory) | BDD SQLite en memoire avec donnees fictives |
| Deploiement | Render (plan gratuit) | Hebergement en ligne |

---

## 4. Architecture du module

```
modules/sqli/
├── db.js              # Initialisation BDD SQLite in-memory
├── routes.js          # Routes API (vulnerables + securisees + hints)
└── public/
    ├── index.html     # Landing page (choix du mode)
    ├── shop.html      # Boutique CyberShop vulnerable
    ├── login.html     # Page de login admin vulnerable
    ├── admin.html     # Panel admin (donnees sensibles)
    └── education.html # Page educative (theorie + prevention)
```

---

## 5. Base de donnees

La base de donnees SQLite est creee en memoire a chaque demarrage du serveur. Elle contient 3 tables :

### 5.1 Table `products` (12 enregistrements)

Produits tech fictifs (laptops, smartphones, audio, etc.) avec colonnes : `id`, `name`, `description`, `price`, `category`, `stock`.

### 5.2 Table `users` (3 enregistrements)

| Username | Password | Role |
|----------|----------|------|
| admin | SuperSecret123 | admin |
| jean_dupont | password123 | user |
| marie_martin | qwerty2024 | user |

Les mots de passe sont stockes en clair **volontairement** pour illustrer une mauvaise pratique (absence de hashing).

### 5.3 Table `secret_data` (3 enregistrements)

Flags de type CTF (Capture The Flag) caches, a decouvrir via injection :

| Flag | Description |
|------|-------------|
| `FLAG{sql_injection_master}` | Table secrete decouverte |
| `FLAG{union_select_pro}` | Maitrise du UNION SELECT |
| `FLAG{data_exfiltration_101}` | Extraction de donnees reussie |

---

## 6. Routes API

### 6.1 Route vulnerable : Recherche produits

```
GET /sqli/api/search?q=<input>
```

```javascript
// VULNERABLE : concatenation directe de l'entree utilisateur
const sql = `SELECT * FROM products WHERE name LIKE '%${query}%'
  OR description LIKE '%${query}%' OR category LIKE '%${query}%'`;
```

L'entree utilisateur est inseree directement dans la requete SQL sans aucun filtrage. L'API renvoie aussi la requete SQL executee (pour visualisation pedagogique) et les erreurs SQL detaillees (vulnerabilite volontaire).

### 6.2 Route vulnerable : Login admin

```
POST /sqli/api/login
Body : { username, password }
```

```javascript
// VULNERABLE : concatenation directe
const sql = `SELECT * FROM users WHERE username = '${username}'
  AND password = '${password}'`;
```

Meme principe : l'attaquant peut contourner l'authentification avec une injection dans le champ username.

### 6.3 Route securisee : Recherche parametree

```
GET /sqli/api/search-safe?q=<input>
```

```javascript
// SECURISE : requete parametree avec placeholder ?
const sql = `SELECT * FROM products WHERE name LIKE ?
  OR description LIKE ? OR category LIKE ?`;
db.prepare(sql).all(param, param, param);
```

Cette route utilise des requetes parametrees (prepared statements). La base de donnees traite la valeur comme une donnee, jamais comme du code SQL. L'injection est impossible. Elle sert de comparaison educative.

### 6.4 Route indices

```
GET /sqli/api/hint/:level   (level = 1 a 5)
```

Renvoie un indice et la solution pour chaque challenge du mode guide.

---

## 7. Fonctionnement detaille

### 7.1 Mode guide : 5 challenges progressifs

Le mode guide reproduit la methodologie reelle d'un attaquant, etape par etape :

#### Challenge 1 - Detection de la vulnerabilite

**Objectif** : Provoquer une erreur SQL
**Injection** : `'`
**Requete generee** :
```sql
SELECT * FROM products WHERE name LIKE '%'%'
```
**Explication** : L'apostrophe casse la syntaxe SQL (3 apostrophes au lieu de 2). L'erreur renvoyee confirme que l'entree est injectee directement dans la requete.

#### Challenge 2 - Contournement des filtres

**Objectif** : Afficher tous les produits
**Injection** : `' OR 1=1 --`
**Requete generee** :
```sql
SELECT * FROM products WHERE name LIKE '%' OR 1=1 --%'
```
**Explication** :
- `'` ferme la chaine de caracteres
- `OR 1=1` ajoute une condition toujours vraie → tous les enregistrements sont retournes
- `--` commente le reste de la requete (le `%'` residuel est ignore)

#### Challenge 3 - Reconnaissance (nombre de colonnes)

**Objectif** : Determiner le nombre de colonnes de la table
**Injection** : `' ORDER BY 6 --`
**Requete generee** :
```sql
SELECT * FROM products WHERE name LIKE '%' ORDER BY 6 --%'
```
**Explication** : `ORDER BY 6` trie par la 6e colonne. Si ca fonctionne, il y a au moins 6 colonnes. `ORDER BY 7` provoque une erreur → la table a exactement 6 colonnes. Cette information est indispensable pour le UNION SELECT suivant.

#### Challenge 4 - Exfiltration de donnees

**Objectif** : Extraire les noms d'utilisateurs et mots de passe
**Injection** : `' UNION SELECT 1,username,password,email,role,6 FROM users --`
**Requete generee** :
```sql
SELECT * FROM products WHERE name LIKE '%'
UNION SELECT 1,username,password,email,role,6 FROM users --%'
```
**Explication** :
- `UNION SELECT` fusionne les resultats de deux requetes
- Les 6 valeurs correspondent aux 6 colonnes de la premiere requete (decouverte au challenge 3)
- `1` et `6` sont des valeurs de remplissage (placeholders)
- Les donnees de la table `users` (username, password, email, role) apparaissent dans les resultats, melangees aux produits

#### Challenge 5 - Cartographie de la base

**Objectif** : Decouvrir la structure complete de la base de donnees
**Injection** : `' UNION SELECT 1,name,sql,3,4,5 FROM sqlite_master --`
**Requete generee** :
```sql
SELECT * FROM products WHERE name LIKE '%'
UNION SELECT 1,name,sql,3,4,5 FROM sqlite_master --%'
```
**Explication** :
- `sqlite_master` est une table systeme de SQLite contenant la structure de toutes les tables
- `name` renvoie le nom de chaque table
- `sql` renvoie la requete CREATE TABLE (revele les colonnes et leurs types)
- L'attaquant decouvre l'existence de la table `secret_data`, puis l'interroge :
```sql
' UNION SELECT 1,flag,description,3,4,5 FROM secret_data --
```

### 7.2 Mode libre

La meme boutique CyberShop est accessible sans aide ni validation de challenges. L'utilisateur peut tester librement ses techniques d'injection SQL.

### 7.3 Login admin vulnerable

La page de login est vulnerable a l'injection dans le champ username :
**Injection** : `' OR 1=1 --`
**Requete generee** :
```sql
SELECT * FROM users WHERE username = '' OR 1=1 --' AND password = '...'
```
La condition `OR 1=1` est toujours vraie. Le premier utilisateur retourne est l'admin. L'attaquant accede au panel d'administration sans connaitre le mot de passe.

### 7.4 Schema de l'attaque

```
  Attaquant                                    Application CyberShop
     |                                                    |
     |  1. Recherche normale ("MacBook")                  |
     |  → Resultat normal, mais la requete SQL est visible|
     |--------------------------------------------------->|
     |                                                    |
     |  2. Test de vulnerabilite (')                      |
     |  → Erreur SQL : la faille est confirmee            |
     |--------------------------------------------------->|
     |                                                    |
     |  3. Injection tautologie (' OR 1=1 --)             |
     |  → Tous les produits affiches                      |
     |--------------------------------------------------->|
     |                                                    |
     |  4. Reconnaissance (' ORDER BY 6 --)               |
     |  → 6 colonnes identifiees                          |
     |--------------------------------------------------->|
     |                                                    |
     |  5. Exfiltration UNION SELECT ... FROM users       |
     |  → Usernames + mots de passe en clair              |
     |--------------------------------------------------->|
     |                                                    |
     |  6. Cartographie (sqlite_master)                   |
     |  → Structure complete de la BDD                    |
     |--------------------------------------------------->|
     |                                                    |
     |  7. Extraction des flags (secret_data)             |
     |  → Donnees confidentielles obtenues                |
     |--------------------------------------------------->|
```

---

## 8. Page educative

La page `education.html` presente :

### Theorie
- Definition de l'injection SQL et son classement OWASP (#3 du Top 10)
- Mecanisme d'exploitation : comment l'entree utilisateur manipule la requete
- Demonstration visuelle du code vulnerable vs code securise

### Types d'attaques detailles
1. **Tautologie** (`OR 1=1`) : contournement d'authentification
2. **UNION SELECT** : extraction de donnees d'autres tables
3. **Extraction de schema** (`sqlite_master`) : cartographie de la base
4. **Blind SQL Injection** : extraction caractere par caractere quand les resultats ne sont pas visibles

### Prevention (checklist)
- Requetes parametrees (Prepared Statements) - defense #1
- Utilisation d'un ORM (Sequelize, Prisma, SQLAlchemy)
- Validation des entrees (type, format)
- Principe du moindre privilege sur la base de donnees
- Ne jamais exposer les erreurs SQL en production
- WAF (Web Application Firewall) comme couche supplementaire

### Exemples reels
- Sony Pictures (2011) - 77 millions de comptes
- Heartland Payment Systems (2008) - 130 millions de cartes
- TalkTalk (2015) - 157 000 clients, exploite par un adolescent de 17 ans

---

## 9. Comparaison vulnerable vs securise

| Aspect | Code vulnerable | Code securise |
|--------|----------------|---------------|
| Construction de la requete | Concatenation de strings | Requetes parametrees (?) |
| Traitement de l'entree | Inseree comme du code SQL | Traitee comme une donnee |
| Risque d'injection | Oui | Non |
| Exemple | `'SELECT * FROM users WHERE name = '' + input + '''` | `db.prepare('SELECT * FROM users WHERE name = ?').all(input)` |

Le module fournit les deux routes (`/sqli/api/search` et `/sqli/api/search-safe`) pour que l'utilisateur puisse comparer directement le comportement.

---

## 10. Limites et axes d'amelioration

### Limites actuelles
- Base de donnees en memoire (les donnees sont reinitialises a chaque redemarrage)
- Uniquement SQLite (les syntaxes varient selon les SGBD : MySQL, PostgreSQL, etc.)
- Pas de Blind SQL Injection dans les challenges (technique plus avancee)
- Le panel admin est accessible directement via URL (pas de verification de session)

### Ameliorations possibles
- Ajouter des challenges de Blind SQL Injection (boolean-based, time-based)
- Implementer une gestion de session pour le panel admin
- Ajouter un mode "compare" avec execution cote a cote vulnerable/securise
- Supporter d'autres SGBD pour montrer les differences de syntaxe
- Ajouter un systeme de score et de progression persistant

---

## 11. Aspects ethiques et legaux

Ce module est realise **exclusivement dans un cadre academique**. En situation reelle :

- L'injection SQL est un **delit** (article 323-1 du Code penal : acces frauduleux a un systeme de traitement automatise de donnees)
- Peine encourue : jusqu'a **5 ans d'emprisonnement** et **150 000 euros d'amende**
- Toute exploitation sur un systeme reel sans autorisation est **illegale**
- Ce laboratoire utilise une base de donnees fictive en memoire, aucune donnee reelle n'est impliquee

---

## 12. References

- OWASP Top 10 - A03:2021 Injection : https://owasp.org/Top10/A03_2021-Injection/
- MITRE ATT&CK - Exploit Public-Facing Application (T1190) : https://attack.mitre.org/techniques/T1190/
- PortSwigger - SQL Injection : https://portswigger.net/web-security/sql-injection
- SQLite Documentation : https://www.sqlite.org/docs.html
- better-sqlite3 : https://github.com/WiseLibs/better-sqlite3
- ANSSI - Bonnes pratiques de securisation : https://www.ssi.gouv.fr/
