import type { Passage } from '../types'

/** Level 6 reading passages — see `src/content/sentences/passages.ts` for
 *  the sentences themselves (each individually SRS-tracked and glossed) and
 *  `types.ts` for why a Passage is a thin composition layer over
 *  `ExampleSentence` rather than a parallel content type. All four are
 *  original composed practice text, not claimed excerpts from a real
 *  published source — see that file's top comment for why. */
export const passages: Passage[] = [
  {
    id: 'passage-tehran-life', title: 'Daily Life in Tehran', titleFa: 'زندگی روزمره در تهران',
    level: 6, register: 'formal',
    sentenceIds: ['s-p1-1', 's-p1-2', 's-p1-3', 's-p1-4', 's-p1-5', 's-p1-6'],
    comprehensionQuestions: [
      { id: 'pq-tehran-1', question: 'How does Maryam prefer to get to work?', options: ['By car', 'By metro', 'By bus', 'On foot'], correctIndex: 1 },
      { id: 'pq-tehran-2', question: 'What does Maryam do with her friends in the evenings?', options: ['Goes to the gym', 'Sits at a café and drinks tea', 'Studies Persian', 'Watches a movie'], correctIndex: 1 },
      { id: 'pq-tehran-3', question: "According to the passage, what is Tehran's traffic usually like?", options: ['Light', 'Heavy', 'Nonexistent', 'Unpredictable'], correctIndex: 1 },
    ],
    confidence: 'high-confidence',
  },
  {
    id: 'passage-letter-friend', title: 'A Letter from a Friend', titleFa: 'نامه‌ای از یک دوست',
    level: 6, register: 'literary',
    sentenceIds: ['s-p2-1', 's-p2-2', 's-p2-3', 's-p2-4', 's-p2-5', 's-p2-6'],
    comprehensionQuestions: [
      { id: 'pq-letter-1', question: 'Why did the writer feel lonely at first?', options: ['They missed their family', "They didn't know anyone in the new city", 'The weather was bad', 'They lost their job'], correctIndex: 1 },
      { id: 'pq-letter-2', question: 'What do the writer and their new friend have in common?', options: ['They both moved recently', 'They both love books', 'They are neighbors from before', 'They both work in the same office'], correctIndex: 1 },
      { id: 'pq-letter-3', question: 'What helped the writer feel less lonely?', options: ['Getting a pet', 'Getting to know the neighbors', 'Going back home', 'Finding a new job'], correctIndex: 1 },
    ],
    confidence: 'high-confidence',
  },
  {
    id: 'passage-seasons-iran', title: 'Weather and Seasons in Iran', titleFa: 'هوا و فصل‌ها در ایران',
    level: 6, register: 'formal',
    sentenceIds: ['s-p3-1', 's-p3-2', 's-p3-3', 's-p3-4', 's-p3-5'],
    comprehensionQuestions: [
      { id: 'pq-seasons-1', question: "Which season does the passage say is many Iranians' favorite?", options: ['Spring', 'Summer', 'Autumn', 'Winter'], correctIndex: 2 },
      { id: 'pq-seasons-2', question: 'Why is that season a favorite, according to the passage?', options: ['It rains the most', 'The weather is cool and the sky is clear', "It's the hottest season", 'Schools are closed'], correctIndex: 1 },
      { id: 'pq-seasons-3', question: 'What is summer like in the north of the country?', options: ['Dry and cold', 'More humid', 'Snowy', 'Identical to the south'], correctIndex: 1 },
    ],
    confidence: 'high-confidence',
  },
  {
    id: 'passage-old-man-garden', title: 'Short Story: The Old Man and His Garden', titleFa: 'داستان کوتاه: پیرمرد و باغش',
    level: 6, register: 'literary',
    sentenceIds: ['s-p4-1', 's-p4-2', 's-p4-3', 's-p4-4', 's-p4-5', 's-p4-6'],
    comprehensionQuestions: [
      { id: 'pq-garden-1', question: 'What did the old man do every morning?', options: ['Read a book', 'Watered the flowers in his garden', 'Visited the neighbor', 'Went to the market'], correctIndex: 1 },
      { id: 'pq-garden-2', question: 'Why did the old man care so much about the garden?', options: ["It was his only source of income", "It was a keepsake from his late wife", 'He wanted to sell it', 'The neighbor asked him to'], correctIndex: 1 },
      { id: 'pq-garden-3', question: 'What does "اگرچه پیر و خسته بود، هرگز از کار در باغ دست نمی‌کشید" tell us about the old man?', options: ['He hired help for the garden', 'He gave up gardening when he got old', 'He kept working in the garden despite being old and tired', 'He never worked in the garden'], correctIndex: 2 },
    ],
    confidence: 'high-confidence',
  },
]
