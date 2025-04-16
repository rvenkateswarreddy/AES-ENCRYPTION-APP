import CryptoJS from 'crypto-js';
import 'react-native-get-random-values';

const CHARACTER_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export function generateSecurePassword(
  length = 16,
  options = {
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
  },
) {
  try {
    // Build character pool based on options
    let pool = '';
    Object.keys(options).forEach(key => {
      if (options[key]) pool += CHARACTER_SETS[key];
    });

    if (!pool) throw new Error('At least one character set must be selected');

    // Generate cryptographically secure random bytes
    const randomBytes = CryptoJS.lib.WordArray.random(length);

    // Convert bytes to password characters
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex =
        (randomBytes.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff;
      password += pool[randomIndex % pool.length];
    }

    // Ensure password meets all selected character requirements
    const missingSets = Object.keys(options).filter(
      key =>
        options[key] && !new RegExp(`[${CHARACTER_SETS[key]}]`).test(password),
    );

    if (missingSets.length > 0) {
      // Replace random characters with required ones
      missingSets.forEach(set => {
        const randomPos = Math.floor(Math.random() * length);
        const randomChar = CHARACTER_SETS[set].charAt(
          Math.floor(Math.random() * CHARACTER_SETS[set].length),
        );
        password =
          password.substring(0, randomPos) +
          randomChar +
          password.substring(randomPos + 1);
      });
    }

    return password;
  } catch (error) {
    console.error('Password generation failed:', error);
    throw new Error('Failed to generate secure password');
  }
}

export function checkPasswordStrength(password) {
  let score = 0;

  // Length
  if (password.length >= 16) score += 3;
  else if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;

  // Character variety
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);

  const varietyCount = [
    hasLowercase,
    hasUppercase,
    hasNumbers,
    hasSymbols,
  ].filter(Boolean).length;

  score += varietyCount;

  // Common patterns
  const commonPatterns = [
    '123',
    'abc',
    'qwerty',
    'password',
    'admin',
    'welcome',
    'letmein',
  ];

  if (
    !commonPatterns.some(pattern => password.toLowerCase().includes(pattern))
  ) {
    score += 2;
  }

  // Entropy calculation
  const poolSize =
    (hasLowercase ? 26 : 0) +
    (hasUppercase ? 26 : 0) +
    (hasNumbers ? 10 : 0) +
    (hasSymbols ? 32 : 0);

  const entropy = Math.log2(Math.pow(poolSize, password.length));

  if (entropy > 100) score += 3;
  else if (entropy > 80) score += 2;
  else if (entropy > 60) score += 1;

  // Return strength level
  if (score >= 10) return {strength: 'very strong', score, color: '#4CAF50'};
  if (score >= 7) return {strength: 'strong', score, color: '#8BC34A'};
  if (score >= 5) return {strength: 'medium', score, color: '#FFC107'};
  if (score >= 3) return {strength: 'weak', score, color: '#FF9800'};
  return {strength: 'very weak', score, color: '#F44336'};
}
