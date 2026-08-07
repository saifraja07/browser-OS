export const CONTACTS = [
  { id: 'nova', name: 'Nova', tagline: 'Product designer', color: '#ff8b5e' },
  { id: 'byte', name: 'Byte', tagline: 'Backend engineer', color: '#6fcf97' },
  { id: 'pixel', name: 'Pixel', tagline: 'QA & bugs', color: '#d84f57' },
  { id: 'echo', name: 'Echo', tagline: 'Says hi a lot', color: '#8ab4f8' },
];

export const CANNED_REPLIES = [
  'Got it 👍',
  'Sounds good!',
  'Nice, tell me more.',
  'Haha, true.',
  "I'm on it.",
  'Let me check and get back to you.',
  'Makes sense to me.',
  "That's a good point.",
  'Cool, thanks for the update.',
  '🙂',
];

export function randomReply() {
  return CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
}
