// ============================================
// Moteur de règles Snort simplifié
// Parse et applique des règles au format Snort
// ============================================

/**
 * Parse une règle Snort en objet exploitable
 * Format: action proto src_ip src_port -> dst_ip dst_port (options)
 * Ex: alert tcp any any -> 192.168.1.0/24 80 (msg:"HTTP detecte"; content:"GET"; sid:1000001;)
 */
function parseRule(ruleStr) {
  const trimmed = ruleStr.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  // Regex pour parser le header de la règle
  const headerMatch = trimmed.match(
    /^(alert|log|pass|drop)\s+(tcp|udp|icmp|ip)\s+(\S+)\s+(\S+)\s+->\s+(\S+)\s+(\S+)\s+\((.+)\)$/
  );

  if (!headerMatch) return null;

  const [, action, protocol, srcIp, srcPort, dstIp, dstPort, optionsStr] = headerMatch;

  // Parser les options entre parenthèses
  const options = {};
  const optRegex = /(\w+)\s*:\s*"?([^";]*)"?\s*;/g;
  let match;
  while ((match = optRegex.exec(optionsStr)) !== null) {
    options[match[1]] = match[2].trim();
  }

  return {
    action,
    protocol,
    srcIp,
    srcPort,
    dstIp,
    dstPort,
    options,
    raw: trimmed
  };
}

/**
 * Vérifie si une IP correspond à un pattern (any, IP exacte, ou CIDR)
 */
function matchIp(pattern, ip) {
  if (pattern === 'any') return true;
  if (!ip) return false;

  // CIDR basique
  if (pattern.includes('/')) {
    const [net, bits] = pattern.split('/');
    const mask = ~(Math.pow(2, 32 - parseInt(bits)) - 1) >>> 0;
    const netParts = net.split('.').map(Number);
    const ipParts = ip.split('.').map(Number);
    const netNum = ((netParts[0] << 24) | (netParts[1] << 16) | (netParts[2] << 8) | netParts[3]) >>> 0;
    const ipNum = ((ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]) >>> 0;
    return (netNum & mask) === (ipNum & mask);
  }

  return pattern === ip;
}

/**
 * Vérifie si un port correspond
 */
function matchPort(pattern, port) {
  if (pattern === 'any') return true;
  return String(pattern) === String(port);
}

/**
 * Applique une règle parsée à un paquet
 * Retourne un objet alerte si match, null sinon
 */
function matchPacket(rule, packet) {
  if (!rule || !packet) return null;

  // Vérifier le protocole
  if (rule.protocol !== 'ip' && rule.protocol !== packet.proto) return null;

  // Vérifier src
  if (!matchIp(rule.srcIp, packet.src)) return null;
  if (!matchPort(rule.srcPort, packet.srcPort)) return null;

  // Vérifier dst
  if (!matchIp(rule.dstIp, packet.dst)) return null;
  if (!matchPort(rule.dstPort, packet.dstPort)) return null;

  // Vérifier content (si spécifié)
  if (rule.options.content) {
    const content = rule.options.content.toLowerCase();
    const payload = (packet.payload || '').toLowerCase();
    if (!payload.includes(content)) return null;
  }

  // Vérifier flags TCP (si spécifié)
  if (rule.options.flags && packet.flags) {
    if (!packet.flags.includes(rule.options.flags)) return null;
  }

  return {
    action: rule.action,
    msg: rule.options.msg || 'Alerte sans message',
    sid: rule.options.sid || '0',
    priority: rule.options.priority || '0',
    rule: rule.raw,
    packet: {
      proto: packet.proto,
      src: `${packet.src}:${packet.srcPort}`,
      dst: `${packet.dst}:${packet.dstPort}`,
      payload: packet.payload ? packet.payload.substring(0, 100) : ''
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Analyse un ensemble de paquets avec un ensemble de règles
 */
function analyze(rules, packets) {
  const parsedRules = rules
    .split('\n')
    .map(parseRule)
    .filter(Boolean);

  const alerts = [];

  for (const packet of packets) {
    for (const rule of parsedRules) {
      const alert = matchPacket(rule, packet);
      if (alert) {
        alerts.push(alert);
        break; // Un seul match par paquet
      }
    }
  }

  return { alerts, rulesCount: parsedRules.length, packetsCount: packets.length };
}

module.exports = { parseRule, matchPacket, analyze };
