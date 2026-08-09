const daysAgo = (days, hour = 20, minute = 14) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
};

/*
 * Messages are intentionally predefined.
 * Your side follows a Rust Cohle-inspired conversational style:
 * detached, blunt, observant, dry, occasionally philosophical.
 *
 * This is an original interpretation rather than copied dialogue.
 *
 * Each conversation contains 5-9 turns:
 * 1 opening message + 2 messages per selected turn.
 * That gives each completed chat roughly 11-19 messages.
 */

export const CONTACTS = [
  {
    id: 'ashcombe',
    name: 'Ashcombe Capital',
    tagline: 'Investment desk',
    color: '#8b6b4a',
    avatar: '🧑🏻‍💼',
    dateLabel: '8/8/26',
    personality: 'serious, corporate, persuasive',
    conversation: [
      {
        text: 'hey, are you around tonight?',
        options: [
          { text: "Yeah. What's up?", reply: "There's something I wanted to ask you." },
          { text: 'Depends. Is there an agenda?', reply: 'You always assume there is one.' },
        ],
      },
      {
        text: "It's about an investment.",
        options: [
          { text: "Then I'm already less interested.", reply: "You haven't even heard the numbers." },
          { text: 'How much are we talking?', reply: 'Now that sounds more like the question I expected.' },
        ],
      },
      {
        text: "You don't trust people very much, do you?",
        options: [
          { text: 'Trust is expensive.', reply: "That's a bleak way of putting it." },
          { text: 'People usually give you reasons not to.', reply: "Can't argue with that." },
        ],
      },
      {
        text: 'So are you in?',
        options: [
          { text: 'Maybe. I need to think.', reply: 'Fair enough.' },
          { text: 'No.', reply: "I figured you'd say that." },
        ],
      },
      {
        text: 'Most people would take the money.',
        options: [
          { text: "Most people aren't particularly good at being people.", reply: "That's a strange philosophy." },
          { text: "Money doesn't fix everything.", reply: 'No. But it fixes some things.' },
        ],
      },
      {
        text: 'You never give a straight answer.',
        options: [
          { text: 'Straight answers are overrated.', reply: 'You really believe that?' },
          { text: 'You already know the answer.', reply: 'Maybe I do.' },
        ],
      },
      {
        text: "I'll leave it there. Goodnight.",
        options: [
          { text: 'Probably for the best. Night.', reply: null },
          { text: 'Try not to invest in anything existential.', reply: null },
        ],
      },
    ],
  },

  {
    id: 'bob',
    name: 'Bob',
    tagline: 'probably busy',
    color: '#222222',
    avatar: '🕴️',
    dateLabel: '8/2/26',
    personality: 'casual, friendly, easily distracted',
    conversation: [
      {
        text: 'you free tonight?',
        options: [
          { text: "Maybe. What's the plan?", reply: 'I found a game we can both play.' },
          { text: 'Depends how bad the plan is.', reply: "Wow. Okay. It's not that bad." },
        ],
      },
      {
        text: "it's actually pretty fun",
        options: [
          { text: "That's what people say before wasting three hours.", reply: "You're impossible." },
          { text: 'Send it.', reply: 'One second.' },
        ],
      },
      {
        text: 'sent it',
        options: [
          { text: "I'll look at it.", reply: 'You better.' },
          { text: 'This looks questionable.', reply: "That's part of the fun." },
        ],
      },
      {
        text: 'you always overthink everything',
        options: [
          { text: 'Thinking is usually preferable to not thinking.', reply: 'See? Exactly what I mean.' },
          { text: 'Somebody has to.', reply: 'Fair.' },
        ],
      },
      {
        text: 'so are you playing or not?',
        options: [
          { text: "I'll play.", reply: 'Finally.' },
          { text: 'Maybe.', reply: "That's not an answer." },
        ],
      },
      {
        text: "you know you're actually fun to hang out with",
        options: [
          { text: "That's unfortunate.", reply: 'What does that even mean?' },
          { text: "Don't spread that around.", reply: "Your secret's safe." },
        ],
      },
      {
        text: 'alright, see you',
        options: [
          { text: 'See you.', reply: null },
          { text: 'Try not to lose.', reply: null },
        ],
      },
    ],
  },

  {
    id: 'ditkovich',
    name: 'Mr. Ditkovich',
    tagline: 'Rent is due',
    color: '#4c4c4c',
    avatar: '🧔🏻',
    dateLabel: '7/24/26',
    personality: 'impatient, demanding, practical',
    conversation: [
      {
        text: 'rent is due.',
        options: [
          { text: 'I know.', reply: 'Then why do I have to remind you?' },
          { text: 'Give me until tomorrow.', reply: 'Tomorrow becomes next week very quickly.' },
        ],
      },
      {
        text: 'You think money waits for you?',
        options: [
          { text: 'Money waits for nobody.', reply: 'At least you understand that.' },
          { text: 'People have worse problems.', reply: 'That does not pay rent.' },
        ],
      },
      {
        text: 'You always have an answer.',
        options: [
          { text: 'Answers are cheaper than solutions.', reply: 'I need the solution.' },
          { text: 'Usually because people ask the same questions.', reply: 'Then give me a different answer.' },
        ],
      },
      {
        text: 'Will you have it tomorrow?',
        options: [
          { text: "If I say yes, you'll ask again tonight.", reply: 'Maybe I will.' },
          { text: 'Yes.', reply: 'Good. I will remember that.' },
        ],
      },
      {
        text: 'You make everything sound like a philosophy.',
        options: [
          { text: 'Most arguments are philosophy with worse lighting.', reply: 'I do not understand you.' },
          { text: "It's just how I talk.", reply: 'Then talk about the rent.' },
        ],
      },
      {
        text: 'Tomorrow. Do not forget.',
        options: [
          { text: "I won't.", reply: 'Good.' },
          { text: 'For once, we agree.', reply: 'Then we are finished.' },
        ],
      },
      {
        text: 'Goodnight.',
        options: [
          { text: 'Night, Mr. Ditkovich.', reply: null },
          { text: 'Try to get some sleep.', reply: null },
        ],
      },
    ],
  },

  {
    id: 'lela',
    name: 'Lela',
    tagline: 'online sometimes',
    color: '#b42c39',
    avatar: '👩🏻',
    dateLabel: '7/24/26',
    personality: 'creative, curious, warm',
    conversation: [
      {
        text: 'did you finish the new desktop theme?',
        options: [
          { text: "Almost. I'm polishing the little details.", reply: 'I knew you were going to say that.' },
          { text: 'Not yet. It is still becoming something.', reply: 'That sounds suspiciously philosophical.' },
        ],
      },
      {
        text: 'what are you changing?',
        options: [
          { text: 'The parts nobody notices until they are wrong.', reply: "That's actually a good way to design." },
          { text: 'Mostly the things that annoy me.', reply: 'So basically everything?' },
        ],
      },
      {
        text: 'can I see it?',
        options: [
          { text: "Sure. But don't expect perfection.", reply: 'I was not expecting perfection.' },
          { text: 'Later. I want to finish the thought first.', reply: 'Okay, mysterious.' },
        ],
      },
      {
        text: 'you really care about tiny details',
        options: [
          { text: 'Small things are usually where the truth hides.', reply: 'That sounded very serious.' },
          { text: 'Someone has to notice them.', reply: 'Fair enough.' },
        ],
      },
      {
        text: 'does the new wallpaper work with it?',
        options: [
          { text: 'It does. The whole thing feels quieter.', reply: 'Quieter is good.' },
          { text: 'Mostly. I may change it again.', reply: 'Of course you might.' },
        ],
      },
      {
        text: "okay, show me when you're done",
        options: [
          { text: 'I will.', reply: 'Looking forward to it.' },
          { text: "If it's still worth showing by then.", reply: "It will be." },
        ],
      },
      {
        text: 'goodnight, designer',
        options: [
          { text: 'Night.', reply: null },
          { text: 'Try not to redesign anything while you sleep.', reply: null },
        ],
      },
    ],
  },

  {
    id: 'sarah',
    name: 'Sarah',
    tagline: 'probably has snacks',
    color: '#d79a43',
    avatar: '👩🏼‍🦱',
    dateLabel: '7/20/26',
    personality: 'warm, playful, thoughtful',
    conversation: [
      {
        text: 'I found the playlist you wanted.',
        options: [
          { text: 'Perfect. Send it over.', reply: 'Already sent.' },
          { text: 'You actually remembered.', reply: 'I remember things sometimes.' },
        ],
      },
      {
        text: 'did you listen to the first track?',
        options: [
          { text: 'Yeah. It has the right kind of sadness.', reply: 'The right kind?' },
          { text: 'Not yet. I wanted to listen properly.', reply: 'That sounds like you.' },
        ],
      },
      {
        text: 'what kind of sadness is the right kind?',
        options: [
          { text: 'The kind that does not ask you to feel sorry for it.', reply: 'That is oddly specific.' },
          { text: 'The kind that tells the truth.', reply: 'You really cannot answer normally.' },
        ],
      },
      {
        text: 'okay, philosopher. favorite song?',
        options: [
          { text: 'The one that knows when to stop.', reply: 'That is not a song title.' },
          { text: "I'll tell you after the playlist earns it.", reply: 'Fair.' },
        ],
      },
      {
        text: 'I also saved you some snacks.',
        options: [
          { text: 'Now that is useful information.', reply: 'Finally, something you approve of.' },
          { text: 'Humanity survives another day.', reply: 'You are ridiculous.' },
        ],
      },
      {
        text: 'you coming over later?',
        options: [
          { text: 'Yeah. I can do later.', reply: 'Good.' },
          { text: 'Maybe. Depends how the night goes.', reply: 'That means maybe yes.' },
        ],
      },
      {
        text: 'see you then',
        options: [
          { text: 'See you.', reply: null },
          { text: 'Keep the snacks alive.', reply: null },
        ],
      },
    ],
  },

  {
    id: 'security',
    name: 'BrowserOS Security Monitor',
    tagline: 'System notifications',
    color: '#49a6c8',
    avatar: '🖥️',
    dateLabel: '11/12/96',
    personality: 'literal, procedural, slightly uncanny',
    conversation: [
      {
        text: 'System check complete. No threats detected.',
        options: [
          { text: 'Good to know.', reply: 'Acknowledged.' },
          { text: 'Run another scan.', reply: 'Additional scan initiated.' },
        ],
      },
      {
        text: 'No anomalies detected in user activity.',
        options: [
          { text: 'That sounds almost disappointing.', reply: 'Disappointment is not a monitored metric.' },
          { text: 'What counts as an anomaly?', reply: 'Behavior deviating from established patterns.' },
        ],
      },
      {
        text: 'Would you like a system status report?',
        options: [
          { text: 'Show system status.', reply: 'System status is nominal.' },
          { text: 'No. I have enough bad news already.', reply: 'Statement classified as non-actionable.' },
        ],
      },
      {
        text: 'Storage integrity remains at 100%.',
        options: [
          { text: 'Nothing stays at 100%.', reply: 'Correction: current measurement is 100%.' },
          { text: 'Good. Keep watching it.', reply: 'Monitoring remains active.' },
        ],
      },
      {
        text: 'Would you like me to continue monitoring?',
        options: [
          { text: 'Yes. Keep watching.', reply: 'Monitoring will continue.' },
          { text: 'You never really stop, do you?', reply: 'Correct. Continuous monitoring is my function.' },
        ],
      },
      {
        text: 'No further events require attention.',
        options: [
          { text: 'Then we are done.', reply: null },
          { text: 'Nothing happened. That is probably good.', reply: null },
        ],
      },
    ],
  },
];

export const CANNED_REPLIES = CONTACTS.flatMap((contact) =>
  contact.conversation.flatMap((step) => step.options.map((option) => option.text))
);

export function getConversationStep(contactId, stepIndex) {
  const contact = CONTACTS.find((item) => item.id === contactId);
  return contact?.conversation?.[stepIndex] ?? null;
}

export function getReplyOptions(contactId, stepIndex) {
  const step = getConversationStep(contactId, stepIndex);
  return step?.options?.map((option) => option.text) ?? [];
}
