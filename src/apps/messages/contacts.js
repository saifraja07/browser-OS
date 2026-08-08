const daysAgo = (days, hour = 20, minute = 14) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
};

export const CONTACTS = [
  {
    id: 'ashcombe',
    name: 'Ashcombe Capital',
    tagline: 'Investment desk',
    color: '#8b6b4a',
    avatar: '🧑🏻‍💼',
    dateLabel: '8/8/26',
    initialMessages: [
      { from: 'them', text: 'hey, are you around tonight?', ts: daysAgo(0, 20, 14) },
      { from: 'me', text: 'yeah, what is up?', ts: daysAgo(0, 20, 16) },
    ],
    replyOptions: ['yeah, what is up?', 'sure, I am free', 'maybe later', 'what did you have in mind?'],
  },
  {
    id: 'bob',
    name: 'Bob',
    tagline: 'probably busy',
    color: '#222222',
    avatar: '🕴️',
    dateLabel: '8/2/26',
    initialMessages: [
      { from: 'them', text: 'you free tonight?', ts: daysAgo(6, 20, 14) },
      { from: 'me', text: 'dash. you free tonight', ts: daysAgo(6, 20, 15) },
      { from: 'them', text: 'i found a game we can both play', ts: daysAgo(6, 20, 16) },
    ],
    replyOptions: ['what game', 'maybe. what is it', 'kinda busy', 'send me the game'],
  },
  {
    id: 'ditkovich',
    name: 'Mr. Ditkovich',
    tagline: 'Rent is due',
    color: '#4c4c4c',
    avatar: '🧔🏻',
    dateLabel: '7/24/26',
    initialMessages: [
      { from: 'them', text: 'rent is due.', ts: daysAgo(15, 9, 10) },
      { from: 'me', text: 'I know, Mr. Ditkovich.', ts: daysAgo(15, 9, 12) },
    ],
    replyOptions: ['I know.', 'I will handle it.', 'give me until tomorrow', 'please stop texting me'],
  },
  {
    id: 'lela',
    name: 'Lela',
    tagline: 'online sometimes',
    color: '#b42c39',
    avatar: '👩🏻',
    dateLabel: '7/24/26',
    initialMessages: [
      { from: 'them', text: 'did you finish the new desktop theme?', ts: daysAgo(15, 18, 30) },
      { from: 'me', text: 'almost. I am polishing the little details.', ts: daysAgo(15, 18, 34) },
    ],
    replyOptions: ['almost done', 'take a look at this', 'not yet', 'I will show you later'],
  },
  {
    id: 'sarah',
    name: 'Sarah',
    tagline: 'probably has snacks',
    color: '#d79a43',
    avatar: '👩🏼‍🦱',
    dateLabel: '7/20/26',
    initialMessages: [
      { from: 'them', text: 'I found the playlist you wanted.', ts: daysAgo(19, 17, 40) },
      { from: 'me', text: 'perfect, send it over!', ts: daysAgo(19, 17, 43) },
    ],
    replyOptions: ['perfect, thanks!', 'send it over', 'you are the best', 'I will listen tonight'],
  },
  {
    id: 'security',
    name: 'BrowserOS Security Monitor',
    tagline: 'System notifications',
    color: '#49a6c8',
    avatar: '🖥️',
    dateLabel: '11/12/96',
    initialMessages: [
      { from: 'them', text: 'System check complete. No threats detected.', ts: daysAgo(1000, 11, 12) },
      { from: 'me', text: 'good to know.', ts: daysAgo(1000, 11, 14) },
    ],
    replyOptions: ['good to know.', 'run another scan', 'show system status', 'thanks, monitor'],
  },
];

export const CANNED_REPLIES = CONTACTS.flatMap((contact) => contact.replyOptions);

export function randomReply(contactId) {
  const contact = CONTACTS.find((item) => item.id === contactId);
  const replies = contact?.replyOptions ?? CANNED_REPLIES;
  return replies[Math.floor(Math.random() * replies.length)];
}
