// ============================================
// Générateur de trafic réseau simulé
// Mélange trafic normal + attaques
// ============================================

const NORMAL_TRAFFIC = [
  { proto: 'tcp', src: '192.168.1.10', srcPort: '52341', dst: '93.184.216.34', dstPort: '80', payload: 'GET /index.html HTTP/1.1', type: 'normal', label: 'Navigation web' },
  { proto: 'tcp', src: '192.168.1.10', srcPort: '52342', dst: '93.184.216.34', dstPort: '443', payload: 'TLS Client Hello', type: 'normal', label: 'Navigation HTTPS' },
  { proto: 'udp', src: '192.168.1.10', srcPort: '54321', dst: '8.8.8.8', dstPort: '53', payload: 'DNS Query: google.com A', type: 'normal', label: 'Requete DNS' },
  { proto: 'udp', src: '8.8.8.8', srcPort: '53', dst: '192.168.1.10', dstPort: '54321', payload: 'DNS Response: 142.250.74.206', type: 'normal', label: 'Reponse DNS' },
  { proto: 'tcp', src: '192.168.1.10', srcPort: '52350', dst: '151.101.1.140', dstPort: '443', payload: 'GET /r/programming HTTP/2', type: 'normal', label: 'Navigation Reddit' },
  { proto: 'tcp', src: '192.168.1.10', srcPort: '52355', dst: '140.82.121.4', dstPort: '443', payload: 'GET /api/v3/repos HTTP/2', type: 'normal', label: 'API GitHub' },
  { proto: 'tcp', src: '192.168.1.15', srcPort: '445', dst: '192.168.1.10', dstPort: '49152', payload: 'SMB2 Session Setup Response', type: 'normal', label: 'Partage reseau' },
  { proto: 'udp', src: '192.168.1.1', srcPort: '67', dst: '192.168.1.10', dstPort: '68', payload: 'DHCP ACK', type: 'normal', label: 'DHCP' },
  { proto: 'tcp', src: '192.168.1.10', srcPort: '52380', dst: '172.217.14.99', dstPort: '443', payload: 'GET /mail HTTP/2', type: 'normal', label: 'Gmail' },
  { proto: 'icmp', src: '192.168.1.10', srcPort: '0', dst: '192.168.1.1', dstPort: '0', payload: 'Echo Request', type: 'normal', label: 'Ping gateway' },
  { proto: 'tcp', src: '192.168.1.10', srcPort: '52400', dst: '104.16.132.229', dstPort: '443', payload: 'GET /api/channels HTTP/2', type: 'normal', label: 'Discord API' },
  { proto: 'udp', src: '192.168.1.10', srcPort: '12345', dst: '192.168.1.1', dstPort: '53', payload: 'DNS Query: spotify.com A', type: 'normal', label: 'DNS Spotify' },
];

const ATTACK_TRAFFIC = [
  // Ping flood
  { proto: 'icmp', src: '10.0.0.5', srcPort: '0', dst: '192.168.1.10', dstPort: '0', payload: 'Echo Request', type: 'attack', label: 'Ping flood', attack: 'ping_flood' },
  { proto: 'icmp', src: '10.0.0.5', srcPort: '0', dst: '192.168.1.10', dstPort: '0', payload: 'Echo Request', type: 'attack', label: 'Ping flood', attack: 'ping_flood' },
  { proto: 'icmp', src: '10.0.0.5', srcPort: '0', dst: '192.168.1.10', dstPort: '0', payload: 'Echo Request', type: 'attack', label: 'Ping flood', attack: 'ping_flood' },

  // Scan de ports TCP SYN
  { proto: 'tcp', src: '10.0.0.5', srcPort: '44321', dst: '192.168.1.10', dstPort: '21', payload: '', flags: 'S', type: 'attack', label: 'Scan port FTP', attack: 'port_scan' },
  { proto: 'tcp', src: '10.0.0.5', srcPort: '44322', dst: '192.168.1.10', dstPort: '22', payload: '', flags: 'S', type: 'attack', label: 'Scan port SSH', attack: 'port_scan' },
  { proto: 'tcp', src: '10.0.0.5', srcPort: '44323', dst: '192.168.1.10', dstPort: '23', payload: '', flags: 'S', type: 'attack', label: 'Scan port Telnet', attack: 'port_scan' },
  { proto: 'tcp', src: '10.0.0.5', srcPort: '44324', dst: '192.168.1.10', dstPort: '80', payload: '', flags: 'S', type: 'attack', label: 'Scan port HTTP', attack: 'port_scan' },
  { proto: 'tcp', src: '10.0.0.5', srcPort: '44325', dst: '192.168.1.10', dstPort: '443', payload: '', flags: 'S', type: 'attack', label: 'Scan port HTTPS', attack: 'port_scan' },

  // SQL Injection via HTTP
  { proto: 'tcp', src: '10.0.0.5', srcPort: '55001', dst: '192.168.1.10', dstPort: '80', payload: "GET /search?q=' OR 1=1 -- HTTP/1.1", type: 'attack', label: 'SQL Injection', attack: 'sqli' },
  { proto: 'tcp', src: '10.0.0.5', srcPort: '55002', dst: '192.168.1.10', dstPort: '80', payload: "POST /login HTTP/1.1\r\nusername=admin'--&password=x", type: 'attack', label: 'SQL Injection Login', attack: 'sqli' },

  // Brute force SSH
  { proto: 'tcp', src: '10.0.0.5', srcPort: '56001', dst: '192.168.1.10', dstPort: '22', payload: 'SSH-2.0-libssh password:admin', type: 'attack', label: 'Brute force SSH', attack: 'brute_force' },
  { proto: 'tcp', src: '10.0.0.5', srcPort: '56002', dst: '192.168.1.10', dstPort: '22', payload: 'SSH-2.0-libssh password:root', type: 'attack', label: 'Brute force SSH', attack: 'brute_force' },
  { proto: 'tcp', src: '10.0.0.5', srcPort: '56003', dst: '192.168.1.10', dstPort: '22', payload: 'SSH-2.0-libssh password:123456', type: 'attack', label: 'Brute force SSH', attack: 'brute_force' },

  // XSS dans requête HTTP
  { proto: 'tcp', src: '10.0.0.5', srcPort: '57001', dst: '192.168.1.10', dstPort: '80', payload: 'GET /page?name=<script>alert(1)</script> HTTP/1.1', type: 'attack', label: 'XSS Reflected', attack: 'xss' },

  // DNS exfiltration
  { proto: 'udp', src: '192.168.1.50', srcPort: '53210', dst: '10.0.0.5', dstPort: '53', payload: 'DNS Query: c2server.evil.com TXT', type: 'attack', label: 'DNS Exfiltration', attack: 'dns_exfil' },
  { proto: 'udp', src: '192.168.1.50', srcPort: '53211', dst: '10.0.0.5', dstPort: '53', payload: 'DNS Query: data.evil.com TXT', type: 'attack', label: 'DNS C2 callback', attack: 'dns_exfil' },

  // FTP connexion suspecte
  { proto: 'tcp', src: '10.0.0.5', srcPort: '58001', dst: '192.168.1.10', dstPort: '21', payload: 'USER anonymous', type: 'attack', label: 'FTP anonymous', attack: 'ftp_anon' },
];

/**
 * Génère un flux de trafic mélangé (normal + attaques)
 * @param {number} count - Nombre total de paquets
 * @param {number} attackRatio - Ratio d'attaques (0.0 à 1.0)
 * @returns {Array} Paquets mélangés avec IDs
 */
function generateTraffic(count = 30, attackRatio = 0.3) {
  const packets = [];
  let id = 1;

  for (let i = 0; i < count; i++) {
    const isAttack = Math.random() < attackRatio;
    const pool = isAttack ? ATTACK_TRAFFIC : NORMAL_TRAFFIC;
    const template = pool[Math.floor(Math.random() * pool.length)];

    packets.push({
      id: id++,
      ...template,
      timestamp: new Date(Date.now() + i * 100).toISOString()
    });
  }

  return packets;
}

/**
 * Génère du trafic pour un scénario spécifique (mode guidé)
 */
function generateScenario(scenarioId) {
  const scenarios = {
    // Challenge 1: Détecter des pings
    1: {
      title: 'Detecter les pings',
      description: 'Un attaquant envoie des pings vers ton reseau. Ecris une regle pour les detecter.',
      hint: 'Protocole ICMP, de n\'importe ou vers n\'importe ou',
      expectedRule: 'alert icmp any any -> any any (msg:"Ping detecte"; sid:1000001;)',
      packets: [
        { id: 1, proto: 'tcp', src: '192.168.1.10', srcPort: '52341', dst: '93.184.216.34', dstPort: '80', payload: 'GET /index.html HTTP/1.1', type: 'normal', label: 'Trafic web' },
        { id: 2, proto: 'icmp', src: '10.0.0.5', srcPort: '0', dst: '192.168.1.10', dstPort: '0', payload: 'Echo Request', type: 'attack', label: 'Ping' },
        { id: 3, proto: 'udp', src: '192.168.1.10', srcPort: '54321', dst: '8.8.8.8', dstPort: '53', payload: 'DNS Query: google.com', type: 'normal', label: 'DNS' },
        { id: 4, proto: 'icmp', src: '10.0.0.5', srcPort: '0', dst: '192.168.1.10', dstPort: '0', payload: 'Echo Request', type: 'attack', label: 'Ping' },
        { id: 5, proto: 'tcp', src: '192.168.1.10', srcPort: '52342', dst: '151.101.1.140', dstPort: '443', payload: 'TLS Client Hello', type: 'normal', label: 'HTTPS' },
        { id: 6, proto: 'icmp', src: '10.0.0.5', srcPort: '0', dst: '192.168.1.10', dstPort: '0', payload: 'Echo Request', type: 'attack', label: 'Ping' },
      ],
      expectedDetections: 3
    },

    // Challenge 2: Scan de ports
    2: {
      title: 'Detecter un scan de ports',
      description: 'L\'attaquant scanne les ports de ta machine avec des paquets SYN. Bloque-le !',
      hint: 'Protocole TCP, flag SYN (S), depuis l\'IP 10.0.0.5',
      expectedRule: 'alert tcp 10.0.0.5 any -> any any (msg:"Scan de ports"; flags:S; sid:1000002;)',
      packets: [
        { id: 1, proto: 'tcp', src: '192.168.1.10', srcPort: '52341', dst: '93.184.216.34', dstPort: '80', payload: 'GET / HTTP/1.1', type: 'normal', label: 'Web' },
        { id: 2, proto: 'tcp', src: '10.0.0.5', srcPort: '44321', dst: '192.168.1.10', dstPort: '21', payload: '', flags: 'S', type: 'attack', label: 'Scan FTP' },
        { id: 3, proto: 'tcp', src: '10.0.0.5', srcPort: '44322', dst: '192.168.1.10', dstPort: '22', payload: '', flags: 'S', type: 'attack', label: 'Scan SSH' },
        { id: 4, proto: 'udp', src: '192.168.1.10', srcPort: '12345', dst: '8.8.8.8', dstPort: '53', payload: 'DNS Query', type: 'normal', label: 'DNS' },
        { id: 5, proto: 'tcp', src: '10.0.0.5', srcPort: '44323', dst: '192.168.1.10', dstPort: '80', payload: '', flags: 'S', type: 'attack', label: 'Scan HTTP' },
        { id: 6, proto: 'tcp', src: '10.0.0.5', srcPort: '44324', dst: '192.168.1.10', dstPort: '443', payload: '', flags: 'S', type: 'attack', label: 'Scan HTTPS' },
        { id: 7, proto: 'tcp', src: '192.168.1.15', srcPort: '445', dst: '192.168.1.10', dstPort: '49152', payload: 'SMB2 Response', type: 'normal', label: 'SMB' },
      ],
      expectedDetections: 4
    },

    // Challenge 3: SQL Injection
    3: {
      title: 'Detecter une injection SQL',
      description: 'Des requetes HTTP contiennent des tentatives d\'injection SQL. Detecte-les !',
      hint: 'Protocole TCP, port 80, cherche le contenu "OR 1=1" dans le payload',
      expectedRule: 'alert tcp any any -> any 80 (msg:"SQL Injection"; content:"OR 1=1"; sid:1000003;)',
      packets: [
        { id: 1, proto: 'tcp', src: '192.168.1.10', srcPort: '52341', dst: '192.168.1.20', dstPort: '80', payload: 'GET /products?id=5 HTTP/1.1', type: 'normal', label: 'Requete normale' },
        { id: 2, proto: 'tcp', src: '10.0.0.5', srcPort: '55001', dst: '192.168.1.20', dstPort: '80', payload: "GET /search?q=' OR 1=1 -- HTTP/1.1", type: 'attack', label: 'SQLi' },
        { id: 3, proto: 'tcp', src: '192.168.1.10', srcPort: '52342', dst: '192.168.1.20', dstPort: '80', payload: 'GET /about HTTP/1.1', type: 'normal', label: 'Page about' },
        { id: 4, proto: 'tcp', src: '10.0.0.5', srcPort: '55002', dst: '192.168.1.20', dstPort: '80', payload: "GET /users?name=' OR 1=1 -- HTTP/1.1", type: 'attack', label: 'SQLi' },
        { id: 5, proto: 'udp', src: '192.168.1.10', srcPort: '54321', dst: '8.8.8.8', dstPort: '53', payload: 'DNS Query', type: 'normal', label: 'DNS' },
        { id: 6, proto: 'tcp', src: '192.168.1.10', srcPort: '52343', dst: '192.168.1.20', dstPort: '80', payload: 'POST /login HTTP/1.1\r\nuser=admin&pass=123', type: 'normal', label: 'Login normal' },
      ],
      expectedDetections: 2
    },

    // Challenge 4: Brute force SSH
    4: {
      title: 'Detecter un brute force SSH',
      description: 'Quelqu\'un tente de forcer l\'acces SSH avec des mots de passe differents.',
      hint: 'Protocole TCP, port destination 22, contenu "SSH"',
      expectedRule: 'alert tcp any any -> any 22 (msg:"Brute force SSH"; content:"SSH"; sid:1000004;)',
      packets: [
        { id: 1, proto: 'tcp', src: '192.168.1.10', srcPort: '52341', dst: '93.184.216.34', dstPort: '80', payload: 'GET / HTTP/1.1', type: 'normal', label: 'Web' },
        { id: 2, proto: 'tcp', src: '10.0.0.5', srcPort: '56001', dst: '192.168.1.10', dstPort: '22', payload: 'SSH-2.0-libssh password:admin', type: 'attack', label: 'SSH brute' },
        { id: 3, proto: 'tcp', src: '10.0.0.5', srcPort: '56002', dst: '192.168.1.10', dstPort: '22', payload: 'SSH-2.0-libssh password:root', type: 'attack', label: 'SSH brute' },
        { id: 4, proto: 'tcp', src: '10.0.0.5', srcPort: '56003', dst: '192.168.1.10', dstPort: '22', payload: 'SSH-2.0-libssh password:123456', type: 'attack', label: 'SSH brute' },
        { id: 5, proto: 'icmp', src: '192.168.1.10', srcPort: '0', dst: '192.168.1.1', dstPort: '0', payload: 'Echo Request', type: 'normal', label: 'Ping' },
        { id: 6, proto: 'tcp', src: '10.0.0.5', srcPort: '56004', dst: '192.168.1.10', dstPort: '22', payload: 'SSH-2.0-libssh password:password', type: 'attack', label: 'SSH brute' },
      ],
      expectedDetections: 4
    },

    // Challenge 5: DNS Exfiltration
    5: {
      title: 'Detecter une exfiltration DNS',
      description: 'Un malware communique avec un serveur C2 via des requetes DNS vers evil.com.',
      hint: 'Protocole UDP, port 53, cherche "evil.com" dans le contenu',
      expectedRule: 'alert udp any any -> any 53 (msg:"DNS exfiltration"; content:"evil.com"; sid:1000005;)',
      packets: [
        { id: 1, proto: 'udp', src: '192.168.1.10', srcPort: '54321', dst: '8.8.8.8', dstPort: '53', payload: 'DNS Query: google.com A', type: 'normal', label: 'DNS normal' },
        { id: 2, proto: 'tcp', src: '192.168.1.10', srcPort: '52341', dst: '93.184.216.34', dstPort: '80', payload: 'GET / HTTP/1.1', type: 'normal', label: 'Web' },
        { id: 3, proto: 'udp', src: '192.168.1.50', srcPort: '53210', dst: '10.0.0.5', dstPort: '53', payload: 'DNS Query: c2data.evil.com TXT', type: 'attack', label: 'DNS C2' },
        { id: 4, proto: 'udp', src: '192.168.1.10', srcPort: '54322', dst: '8.8.8.8', dstPort: '53', payload: 'DNS Query: github.com A', type: 'normal', label: 'DNS normal' },
        { id: 5, proto: 'udp', src: '192.168.1.50', srcPort: '53211', dst: '10.0.0.5', dstPort: '53', payload: 'DNS Query: exfil.evil.com TXT', type: 'attack', label: 'DNS exfil' },
        { id: 6, proto: 'udp', src: '192.168.1.50', srcPort: '53212', dst: '10.0.0.5', dstPort: '53', payload: 'DNS Query: stolen.evil.com TXT', type: 'attack', label: 'DNS exfil' },
        { id: 7, proto: 'udp', src: '192.168.1.10', srcPort: '54323', dst: '8.8.8.8', dstPort: '53', payload: 'DNS Query: stackoverflow.com A', type: 'normal', label: 'DNS normal' },
      ],
      expectedDetections: 3
    }
  };

  return scenarios[scenarioId] || null;
}

module.exports = { generateTraffic, generateScenario, NORMAL_TRAFFIC, ATTACK_TRAFFIC };
