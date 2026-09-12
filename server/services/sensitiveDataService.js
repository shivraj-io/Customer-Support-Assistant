const SENSITIVE_PATTERNS = [
  {
    name: 'card number',
    regex: /\b(?:\d[ -]*?){13,19}\b/g,
    replacement: '[REDACTED CARD NUMBER]',
  },
  {
    name: 'password or secret',
    regex: /\b(?:password|passcode|secret)\s*[:=]\s*\S+/gi,
    replacement: '[REDACTED PASSWORD]',
  },
  {
    name: 'OTP',
    regex: /\b(?:otp|one[- ]time password)\s*[:=\-]?\s*\d{4,8}\b/gi,
    replacement: '[REDACTED OTP]',
  },
  {
    name: 'API key',
    regex: /\b(?:sk-[A-Za-z0-9_-]+|AIza[A-Za-z0-9_-]+)\b/g,
    replacement: '[REDACTED API KEY]',
  },
  {
    name: 'Aadhaar number',
    regex: /\b\d{4}[ -]\d{4}[ -]\d{4}\b/g,
    replacement: '[REDACTED AADHAAR NUMBER]',
  },
  {
    name: 'PAN number',
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/gi,
    replacement: '[REDACTED PAN NUMBER]',
  },
  {
    name: 'CVV',
    regex: /\b(?:cvv|cvc|security code)\s*[:=]\s*\d{3,4}\b/gi,
    replacement: '[REDACTED SECURITY CODE]',
  },
];

export function sanitizeSensitiveData(value = '') {
  let sanitizedText = value;
  const detectedTypes = [];

  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(sanitizedText)) {
      detectedTypes.push(pattern.name);
      pattern.regex.lastIndex = 0;
      sanitizedText = sanitizedText.replace(pattern.regex, pattern.replacement);
    }
  }

  return { sanitizedText, detectedTypes };
}
