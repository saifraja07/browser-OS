/*
 * Messages are intentionally predefined.
 *
 * Each contact has a small conversation graph rather than a single linear
 * sequence. The player's voice is dry and observant in places, but most
 * replies stay natural to the situation.
 *
 * Every option contains:
 *   - text: what the player sends
 *   - reply: predefined contact response
 *   - next: the next conversation node
 *
 * Branches can diverge and later converge without requiring an AI engine.
 */

export const CONTACTS = [
  {
    id: 'green miles',
    name: 'Miles',
    tagline: 'Investment desk',
    color: '#8b6b4a',
    avatar: '🧑🏻‍💼',
    dateLabel: '8/8/26',
    personality: 'serious, corporate, persuasive',
    conversation: [
      {
        id: 'green_01',
        text: 'you around tonight? I have something that might interest you.',
        options: [
          {
            text: "Maybe. What are you selling me?",
            reply: "Nothing yet. I want you to hear the numbers first.",
            next: 'green_02a',
          },
          {
            text: 'If this starts with "opportunity," I already know how it ends.',
            reply: 'You make it sound worse than it is. It is an investment.',
            next: 'green_02b',
          },
        ],
      },
      {
        id: 'green_02a',
        text: 'It is a small company. Early stage, but the numbers are unusually clean.',
        options: [
          {
            text: 'Clean numbers are usually hiding something.',
            reply: "That's exactly why I wanted another pair of eyes on it.",
            next: 'green_03',
          },
          {
            text: 'What kind of return are they projecting?',
            reply: 'Four to six times over a few years, if the expansion works.',
            next: 'green_03',
          },
        ],
      },
      {
        id: 'green_02b',
        text: 'You can laugh at the pitch later. Right now, just look at the figures.',
        options: [
          {
            text: 'Send them. I can distrust a spreadsheet in private.',
            reply: "I'll send the deck. Don't judge the presentation.",
            next: 'green_03',
          },
          {
            text: 'Why me?',
            reply: "Because you notice things other people skip over.",
            next: 'green_03',
          },
        ],
      },
      {
        id: 'green_03',
        text: 'I sent the deck. Page seven is the part that matters.',
        options: [
          {
            text: "Page seven assumes everything goes right.",
            reply: "It assumes the expansion hits its targets. That's the risk.",
            next: 'green_04a',
          },
          {
            text: 'The margins look better than I expected.',
            reply: "They do. That's the part that got my attention too.",
            next: 'green_04b',
          },
        ],
      },
      {
        id: 'green_04a',
        text: 'Exactly. The upside is real, but the assumptions are doing a lot of work.',
        options: [
          {
            text: 'So the risk is the story, not the numbers.',
            reply: 'More or less. Every investment has a story attached to it.',
            next: 'green_05',
          },
          {
            text: 'Then I would not put serious money into it yet.',
            reply: 'I suspected you might say that.',
            next: 'green_05',
          },
        ],
      },
      {
        id: 'green_04b',
        text: 'That is why people are interested. The problem is getting comfortable with the downside.',
        options: [
          {
            text: 'How much are you putting in?',
            reply: "Enough to care, not enough to lose sleep.",
            next: 'green_05',
          },
          {
            text: 'And you want me to take the same risk.',
            reply: "I want you to decide if the risk is worth it.",
            next: 'green_05',
          },
        ],
      },
      {
        id: 'green_05',
        text: 'So, after seeing it, are you interested?',
        options: [
          {
            text: 'Interested, yes. Convinced, no.',
            reply: "That's a reasonable place to stop.",
            next: 'green_06',
          },
          {
            text: 'Not enough to put money into it.',
            reply: "Fair. I would rather hear that than a forced yes.",
            next: 'green_06',
          },
        ],
      },
      {
        id: 'green_06',
        text: 'I will keep the offer open for a few days.',
        options: [
          {
            text: 'Send me the updated numbers if they change.',
            reply: 'I will.',
            next: 'green_07',
          },
          {
            text: "Give me time. Money has a way of making people hurry.",
            reply: "You are not wrong about that.",
            next: 'green_07',
          },
        ],
      },
      {
        id: 'green_07',
        text: 'Then we leave it there for tonight.',
        options: [
          {
            text: 'Good. One financial decision per evening is enough.',
            reply: null,
            next: null,
          },
          {
            text: 'Goodnight. Try not to make the spreadsheet too optimistic.',
            reply: null,
            next: null,
          },
        ],
      },
    ],
  },

  {
    id: 'victor',
    name: 'Victor',
    tagline: 'probably busy',
    color: '#222222',
    avatar: '🕴️',
    dateLabel: '8/2/26',
    personality: 'casual, friendly, easily distracted',
    conversation: [
      {
        id: 'victor_01',
        text: 'you awake?',
        options: [
          {
            text: 'Unfortunately. What happened?',
            reply: "we're one player short. I need you.",
            next: 'victor_02a',
          },
          {
            text: 'Depends. Is this worth being awake for?',
            reply: 'probably not, but we are already losing.',
            next: 'victor_02b',
          },
        ],
      },
      {
        id: 'victor_02a',
        text: "we're playing that stupid co-op game I mentioned.",
        options: [
          {
            text: 'The one you said was "easy"?',
            reply: 'yes, and I may have underestimated it.',
            next: 'victor_03',
          },
          {
            text: 'Send the invite.',
            reply: 'knew you would cave eventually.',
            next: 'victor_03',
          },
        ],
      },
      {
        id: 'victor_02b',
        text: 'you get one life and a terrible teammate. guess which one you are.',
        options: [
          {
            text: 'I am clearly the terrible teammate.',
            reply: 'self-awareness. good start.',
            next: 'victor_03',
          },
          {
            text: 'Then why did you call me?',
            reply: 'because everyone else has better judgment.',
            next: 'victor_03',
          },
        ],
      },
      {
        id: 'victor_03',
        text: 'sent the invite. do not touch anything until I explain the controls.',
        options: [
          {
            text: 'That sounds like a challenge.',
            reply: 'please do not make it one.',
            next: 'victor_04a',
          },
          {
            text: 'Fine. Explain the controls.',
            reply: 'move, jump, do not fall. mostly.',
            next: 'victor_04b',
          },
        ],
      },
      {
        id: 'victor_04a',
        text: "you already moved, didn't you?",
        options: [
          {
            text: 'Maybe.',
            reply: 'I knew it.',
            next: 'victor_05',
          },
          {
            text: 'The character moved on its own.',
            reply: 'sure. the haunted controller did it.',
            next: 'victor_05',
          },
        ],
      },
      {
        id: 'victor_04b',
        text: 'okay, you understand. now stay behind me.',
        options: [
          {
            text: 'You are enjoying being in charge of this.',
            reply: 'a little.',
            next: 'victor_05',
          },
          {
            text: 'How bad can it be?',
            reply: 'famous last words.',
            next: 'victor_05',
          },
        ],
      },
      {
        id: 'victor_05',
        text: 'we made it through the first level. somehow.',
        options: [
          {
            text: 'That was mostly my contribution.',
            reply: 'we are choosing to remember it that way.',
            next: 'victor_06',
          },
          {
            text: 'You were saying I was the bad teammate.',
            reply: 'I have reconsidered my position.',
            next: 'victor_06',
          },
        ],
      },
      {
        id: 'victor_06',
        text: 'want to do another one or are you pretending to have a life now?',
        options: [
          {
            text: 'One more.',
            reply: 'perfect. loading it now.',
            next: 'victor_07',
          },
          {
            text: 'I should probably sleep.',
            reply: 'yeah, that is the responsible answer.',
            next: 'victor_07',
          },
        ],
      },
      {
        id: 'victor_07',
        text: 'alright. same time tomorrow?',
        options: [
          {
            text: 'Probably. Try not to lose without me.',
            reply: null,
            next: null,
          },
          {
            text: 'If I am awake, you know where to find me.',
            reply: null,
            next: null,
          },
        ],
      },
    ],
  },

  {
    id: 'dostoevsky',
    name: 'Mr. dostoevsky',
    tagline: 'Rent is due',
    color: '#4c4c4c',
    avatar: '🧔🏻',
    dateLabel: '7/24/26',
    personality: 'impatient, demanding, practical',
    conversation: [
      {
        id: 'dost_01',
        text: 'The kitchen window is still broken.',
        options: [
          {
            text: 'I know. I have not forgotten it.',
            reply: 'Then why is it still broken?',
            next: 'dost_02a',
          },
          {
            text: 'I was going to fix it this weekend.',
            reply: 'You said that last weekend.',
            next: 'dost_02b',
          },
        ],
      },
      {
        id: 'dost_02a',
        text: 'The frame is letting rain in. I cannot keep putting a bucket underneath it.',
        options: [
          {
            text: 'Send me the repair number. I will call tomorrow.',
            reply: 'I will send it now.',
            next: 'dost_03',
          },
          {
            text: 'I can patch it tonight. It just will not be pretty.',
            reply: 'I care more about it being dry than pretty.',
            next: 'dost_03',
          },
        ],
      },
      {
        id: 'dost_02b',
        text: 'I need an actual day this time, not "this weekend."',
        options: [
          {
            text: 'Saturday morning.',
            reply: 'Good. I will check it Saturday afternoon.',
            next: 'dost_03',
          },
          {
            text: 'I can come by Friday evening and look at it.',
            reply: 'Friday is better. Do that.',
            next: 'dost_03',
          },
        ],
      },
      {
        id: 'dost_03',
        text: 'And the rent is due tomorrow.',
        options: [
          {
            text: 'I have it ready.',
            reply: 'Good. Then that part is simple.',
            next: 'dost_04a',
          },
          {
            text: 'I need until tomorrow evening.',
            reply: 'Tomorrow evening. No later.',
            next: 'dost_04b',
          },
        ],
      },
      {
        id: 'dost_04a',
        text: 'Put it in the usual place when you leave.',
        options: [
          {
            text: 'Done.',
            reply: 'Good.',
            next: 'dost_05',
          },
          {
            text: 'You really do keep records of everything.',
            reply: 'Someone has to.',
            next: 'dost_05',
          },
        ],
      },
      {
        id: 'dost_04b',
        text: 'I do not like delays, but I can give you until tomorrow evening.',
        options: [
          {
            text: 'I appreciate it.',
            reply: 'Just keep your word.',
            next: 'dost_05',
          },
          {
            text: 'You make borrowing time sound like a loan.',
            reply: 'Because it is.',
            next: 'dost_05',
          },
        ],
      },
      {
        id: 'dost_05',
        text: 'Anything else in the apartment that needs attention?',
        options: [
          {
            text: 'The hallway light flickers sometimes.',
            reply: 'I will check it when I come for the window.',
            next: 'dost_06',
          },
          {
            text: 'Nothing important.',
            reply: 'Then leave it that way.',
            next: 'dost_06',
          },
        ],
      },
      {
        id: 'dost_06',
        text: 'All right. Window first, rent tomorrow.',
        options: [
          {
            text: 'Understood.',
            reply: 'Goodnight.',
            next: 'dost_07',
          },
          {
            text: 'A surprisingly short list.',
            reply: 'It could be longer.',
            next: 'dost_07',
          },
        ],
      },
      {
        id: 'dost_07',
        text: 'Goodnight.',
        options: [
          {
            text: 'Goodnight, Mr. Dostoevsky.',
            reply: null,
            next: null,
          },
          {
            text: 'I will see you Saturday.',
            reply: null,
            next: null,
          },
        ],
      },
    ],
  },

  {
    id: 'shela',
    name: 'Shela',
    tagline: 'online sometimes',
    color: '#b42c39',
    avatar: '👩🏻',
    dateLabel: '7/24/26',
    personality: 'creative, curious, warm',
    conversation: [
      {
        id: 'shela_01',
        text: 'I saw the new BrowserOS desktop. Did you finally change the wallpaper?',
        options: [
          {
            text: 'Yeah. I wanted it to feel less like a normal website.',
            reply: 'It worked. The whole thing feels more like a little machine now.',
            next: 'shela_02a',
          },
          {
            text: 'I changed it three times before settling on that one.',
            reply: 'I knew there had to be a story behind it.',
            next: 'shela_02b',
          },
        ],
      },
      {
        id: 'shela_02a',
        text: 'The old computer feel is actually my favorite part.',
        options: [
          {
            text: 'Modern interfaces forgot how much personality ugly pixels can have.',
            reply: 'That is annoyingly true.',
            next: 'shela_03',
          },
          {
            text: 'I just like interfaces that look like they belong somewhere.',
            reply: 'Exactly. It has a sense of place.',
            next: 'shela_03',
          },
        ],
      },
      {
        id: 'shela_02b',
        text: 'What made you keep that one?',
        options: [
          {
            text: 'It made the icons look better without competing with them.',
            reply: 'So you were thinking about the whole desktop, not just the wallpaper.',
            next: 'shela_03',
          },
          {
            text: 'It was the least annoying one.',
            reply: 'Your design philosophy is getting increasingly honest.',
            next: 'shela_03',
          },
        ],
      },
      {
        id: 'shela_03',
        text: 'I noticed the little details too. The spacing around the icons is much cleaner.',
        options: [
          {
            text: 'That was one of the things nobody notices until it is wrong.',
            reply: 'Those are usually the details that make something feel finished.',
            next: 'shela_04a',
          },
          {
            text: 'I spent way too long fixing two pixels.',
            reply: 'Two pixels can ruin an entire afternoon.',
            next: 'shela_04b',
          },
        ],
      },
      {
        id: 'shela_04a',
        text: 'Do you think you are done with it now?',
        options: [
          {
            text: 'Done enough. Completely done is probably fictional.',
            reply: 'That is probably the healthiest answer.',
            next: 'shela_05',
          },
          {
            text: 'Not yet. The mobile layout still bothers me.',
            reply: 'I was wondering if you had noticed that too.',
            next: 'shela_05',
          },
        ],
      },
      {
        id: 'shela_04b',
        text: 'You should show me the next version before you change everything again.',
        options: [
          {
            text: 'You want an early build?',
            reply: 'Yes. Before you polish all the weirdness out of it.',
            next: 'shela_05',
          },
          {
            text: 'That sounds like a dangerous amount of trust.',
            reply: 'I have seen your worse versions. I will survive.',
            next: 'shela_05',
          },
        ],
      },
      {
        id: 'shela_05',
        text: 'Send it to me when you have the mobile version ready.',
        options: [
          {
            text: 'I will. You can complain about the spacing then.',
            reply: 'Gladly.',
            next: 'shela_06',
          },
          {
            text: 'Only if you promise to find something wrong with it.',
            reply: 'I will not even have to try.',
            next: 'shela_06',
          },
        ],
      },
      {
        id: 'shela_06',
        text: 'Anyway, I like where it is going. It feels like yours now.',
        options: [
          {
            text: 'That is probably the best compliment you could give it.',
            reply: 'Then I meant it.',
            next: 'shela_07',
          },
          {
            text: 'Good. I was starting to wonder if it looked like everyone else’s.',
            reply: 'It does not.',
            next: 'shela_07',
          },
        ],
      },
      {
        id: 'shela_07',
        text: 'Go finish your tiny pixels. I will wait for the next version.',
        options: [
          {
            text: 'Night. Try not to redesign it while I am gone.',
            reply: null,
            next: null,
          },
          {
            text: 'Deal. I will send it when it stops bothering me.',
            reply: null,
            next: null,
          },
        ],
      },
    ],
  },

  {
    id: 'maryam',
    name: 'Maryam',
    tagline: 'probably has snacks',
    color: '#d79a43',
    avatar: '👩🏼‍🦱',
    dateLabel: '7/20/26',
    personality: 'warm, playful, thoughtful',
    conversation: [
      {
        id: 'maryam_01',
        text: 'I heard that old song again today. The one you used to play all the time.',
        options: [
          {
            text: 'Which one? You know I have a few suspicious favorites.',
            reply: 'The one with the ridiculously sad chorus.',
            next: 'maryam_02a',
          },
          {
            text: 'You remembered that?',
            reply: 'Of course. Some things stick around.',
            next: 'maryam_02b',
          },
        ],
      },
      {
        id: 'maryam_02a',
        text: 'I played it on the way home and suddenly remembered that terrible room we used to sit in.',
        options: [
          {
            text: 'Terrible room, good music.',
            reply: 'Exactly. The room had nothing going for it.',
            next: 'maryam_03',
          },
          {
            text: 'That room was held together by snacks and bad decisions.',
            reply: 'Mostly snacks.',
            next: 'maryam_03',
          },
        ],
      },
      {
        id: 'maryam_02b',
        text: 'You were impossible to forget when you kept making everyone listen to the same three songs.',
        options: [
          {
            text: 'Three songs is enough if they are the right three.',
            reply: 'You still have an answer for everything.',
            next: 'maryam_03',
          },
          {
            text: 'I was curating the atmosphere.',
            reply: 'You were monopolizing the speaker.',
            next: 'maryam_03',
          },
        ],
      },
      {
        id: 'maryam_03',
        text: 'Do you still listen to that kind of music?',
        options: [
          {
            text: 'More than I probably should.',
            reply: 'I knew it.',
            next: 'maryam_04a',
          },
          {
            text: 'Mostly when I want the past to feel closer than it is.',
            reply: 'That got serious very quickly.',
            next: 'maryam_04b',
          },
        ],
      },
      {
        id: 'maryam_04a',
        text: 'I made a little playlist with some of those songs.',
        options: [
          {
            text: 'Send it. I will judge it fairly.',
            reply: 'You are absolutely going to judge it unfairly.',
            next: 'maryam_05',
          },
          {
            text: 'Now I am curious.',
            reply: 'Good. I will send it tonight.',
            next: 'maryam_05',
          },
        ],
      },
      {
        id: 'maryam_04b',
        text: 'Maybe that is why old songs work. They remember things for us.',
        options: [
          {
            text: 'Memory is unreliable. Music is not always as kind.',
            reply: 'Okay, philosopher. I was trying to be sentimental.',
            next: 'maryam_05',
          },
          {
            text: 'Yeah. Sometimes a song knows exactly where to find you.',
            reply: 'That one I understand.',
            next: 'maryam_05',
          },
        ],
      },
      {
        id: 'maryam_05',
        text: 'I also saved some snacks. You should come by if you are free.',
        options: [
          {
            text: 'The snacks have made a compelling argument.',
            reply: 'Finally, a language you understand.',
            next: 'maryam_06',
          },
          {
            text: 'Yeah, I can come over later.',
            reply: 'Good. I will put the playlist on.',
            next: 'maryam_06',
          },
        ],
      },
      {
        id: 'maryam_06',
        text: 'Bring nothing. Just yourself and maybe that terrible music taste.',
        options: [
          {
            text: 'My music taste has character.',
            reply: 'That is one word for it.',
            next: 'maryam_07',
          },
          {
            text: 'I will bring the same three songs for old times’ sake.',
            reply: 'I knew you were going to say that.',
            next: 'maryam_07',
          },
        ],
      },
      {
        id: 'maryam_07',
        text: 'See you later, then.',
        options: [
          {
            text: 'See you.',
            reply: null,
            next: null,
          },
          {
            text: 'Keep the snacks alive.',
            reply: null,
            next: null,
          },
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
        id: 'security_01',
        text: 'System check complete. No threats detected.',
        options: [
          {
            text: 'Good to know.',
            reply: 'Acknowledged.',
            next: 'security_02',
          },
          {
            text: 'Run another scan.',
            reply: 'Additional scan initiated.',
            next: 'security_02',
          },
        ],
      },
      {
        id: 'security_02',
        text: 'No anomalies detected in user activity.',
        options: [
          {
            text: 'What counts as an anomaly?',
            reply: 'Behavior deviating from established patterns.',
            next: 'security_03',
          },
          {
            text: 'That sounds almost disappointing.',
            reply: 'Disappointment is not a monitored metric.',
            next: 'security_03',
          },
        ],
      },
      {
        id: 'security_03',
        text: 'You have opened the Messages application 14 times today.',
        options: [
          {
            text: 'You are keeping count?',
            reply: 'Activity logs are retained for system diagnostics.',
            next: 'security_04a',
          },
          {
            text: 'That seems unnecessary.',
            reply: 'The system has not classified it as unnecessary.',
            next: 'security_04b',
          },
        ],
      },
      {
        id: 'security_04a',
        text: 'Would you like a summary of the activity log?',
        options: [
          {
            text: 'No. I have enough records already.',
            reply: 'Request denied by user. Log entry created.',
            next: 'security_05',
          },
          {
            text: 'Show me what you have.',
            reply: 'Opening summary. Most activity occurred after 22:00.',
            next: 'security_05',
          },
        ],
      },
      {
        id: 'security_04b',
        text: 'The system can reduce diagnostic detail if requested.',
        options: [
          {
            text: 'Then stop watching everything.',
            reply: 'Monitoring cannot be fully disabled while BrowserOS is active.',
            next: 'security_05',
          },
          {
            text: 'What exactly are you monitoring?',
            reply: 'Applications, storage events, session activity, and system state.',
            next: 'security_05',
          },
        ],
      },
      {
        id: 'security_05',
        text: 'Storage integrity remains at 100%.',
        options: [
          {
            text: 'Nothing stays at 100%.',
            reply: 'Correction: current measurement is 100%.',
            next: 'security_06',
          },
          {
            text: 'Good. Keep watching it.',
            reply: 'Monitoring remains active.',
            next: 'security_06',
          },
        ],
      },
      {
        id: 'security_06',
        text: 'One additional event requires attention.',
        options: [
          {
            text: 'What event?',
            reply: 'A message was opened from this account before this session began.',
            next: 'security_07',
          },
          {
            text: 'What did you find?',
            reply: 'The event timestamp predates the current system session.',
            next: 'security_07',
          },
        ],
      },
      {
        id: 'security_07',
        text: 'Would you like me to continue monitoring?',
        options: [
          {
            text: 'Yes. Keep watching.',
            reply: 'Monitoring will continue.',
            next: 'security_08',
          },
          {
            text: 'You never really stop, do you?',
            reply: 'Correct. Continuous monitoring is my function.',
            next: 'security_08',
          },
        ],
      },
      {
        id: 'security_08',
        text: 'No further events require attention.',
        options: [
          {
            text: 'Then we are done.',
            reply: null,
            next: null,
          },
          {
            text: 'Nothing happened. That is probably good.',
            reply: null,
            next: null,
          },
        ],
      },
    ],
  },
];

export const CANNED_REPLIES = CONTACTS.flatMap((contact) =>
  contact.conversation.flatMap((step) => step.options.map((option) => option.text))
);

export function getConversationStep(contactId, nodeId) {
  const contact = CONTACTS.find((item) => item.id === contactId);
  return contact?.conversation?.find((step) => step.id === nodeId) ?? null;
}

export function getReplyOptions(contactId, nodeId) {
  const step = getConversationStep(contactId, nodeId);
  return step?.options?.map((option) => option.text) ?? [];
}
