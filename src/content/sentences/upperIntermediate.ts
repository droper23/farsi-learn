import type { ExampleSentence } from '../types'

/** Example sentences for the Level 5 nuanced-aspect/subordination grammar
 *  concepts (imperfect/habitual past, concessive, causal, purpose clauses)
 *  — see grammar/concepts.ts for the concepts themselves. Grammatical
 *  patterns checked against dastur.info and MSU OpenBooks "Basic Persian"
 *  (see each sentence's `note`); the vocabulary used is all already
 *  `verified`/`high-confidence` elsewhere in the corpus. */
export const grammarExampleSentences: ExampleSentence[] = [
  {
    id: 's-imperfect-habitual', fa: 'هر روز به مدرسه می‌رفتم.', translit: 'har ruz be madrese miraftam.',
    en: 'I used to go to school every day.', literalEn: 'every day to school I-was-going',
    register: 'neutral', level: 5,
    words: [
      { fa: 'هر روز', translit: 'har ruz', en: 'every day', vocabId: 'time-hafte' },
      { fa: 'به مدرسه', translit: 'be madrese', en: 'to school', vocabId: 'sch-madrese' },
      { fa: 'می‌رفتم', translit: 'miraftam', en: 'I used to go', vocabId: 'verb-raftan' },
    ],
    grammarConceptIds: ['g-imperfect-past'], vocabIds: ['sch-madrese', 'verb-raftan'],
    note: 'Construction (mi- + past stem + personal ending = habitual/continuous past) confirmed against Settemila Lingue and "A Guide to Persian Verbs" (Past Imperfect); rafta/miraftam is a completely standard example pairing.',
    confidence: 'verified',
  },
  {
    id: 's-imperfect-child', fa: 'وقتی بچه بودم، فوتبال بازی می‌کردم.', translit: 'vaqti bache budam, futbāl bāzi mikardam.',
    en: 'When I was a child, I used to play soccer.', literalEn: 'when child I-was, soccer play I-used-to-do',
    register: 'neutral', level: 5,
    words: [
      { fa: 'وقتی بچه بودم', translit: 'vaqti bache budam', en: 'when I was a child' },
      { fa: 'فوتبال بازی می‌کردم', translit: 'futbāl bāzi mikardam', en: 'I used to play soccer' },
    ],
    grammarConceptIds: ['g-imperfect-past'], vocabIds: [],
    notes: 'The imperfect (می‌کردم) is the standard tense for describing repeated/habitual childhood actions — a simple past (کردم) here would sound like it happened once.',
    confidence: 'high-confidence',
  },
  {
    id: 's-concessive-cold', fa: 'اگرچه هوا سرد بود، بیرون رفتیم.', translit: 'agarche havā sard bud, birun raftim.',
    en: 'Although the weather was cold, we went outside.', literalEn: 'although weather cold was, outside we-went',
    register: 'neutral', level: 5,
    words: [
      { fa: 'اگرچه', translit: 'agarche', en: 'although', vocabId: 'exp-albate' },
      { fa: 'هوا سرد بود', translit: 'havā sard bud', en: 'the weather was cold', vocabId: 'adj-sard' },
      { fa: 'بیرون رفتیم', translit: 'birun raftim', en: 'we went outside', vocabId: 'verb-raftan' },
    ],
    grammarConceptIds: ['g-concessive-clauses'], vocabIds: ['adj-sard', 'verb-raftan'],
    note: 'اگرچه as the standard concessive conjunction ("although/even though"), taking the indicative (not subjunctive), confirmed against dastur.info §16 Conjunctions and §18.4 Adverbial Clauses.',
    confidence: 'verified',
  },
  {
    id: 's-causal-tired', fa: 'چون خسته بودم، زود خوابیدم.', translit: 'chon khaste budam, zud khābidam.',
    en: 'Because I was tired, I went to sleep early.', literalEn: 'because tired I-was, early I-slept',
    register: 'neutral', level: 5,
    words: [
      { fa: 'چون خسته بودم', translit: 'chon khaste budam', en: 'because I was tired', vocabId: 'adj-khaste' },
      { fa: 'زود خوابیدم', translit: 'zud khābidam', en: 'I went to sleep early' },
    ],
    grammarConceptIds: ['g-causal-clauses'], vocabIds: ['adj-khaste'],
    note: 'چون as the most common causal conjunction ("because") confirmed against dastur.info §16 Conjunctions (چون / چرا / زیرا).',
    confidence: 'verified',
  },
  {
    id: 's-purpose-traffic', fa: 'من زود می‌روم تا به ترافیک نخورم.', translit: 'man zud miravam tā be terāfik nakhoram.',
    en: "I'm leaving early so that I don't hit traffic.", literalEn: 'I early I-go so-that to traffic I-not-hit[subj.]',
    register: 'neutral', level: 5,
    words: [
      { fa: 'من زود می‌روم', translit: 'man zud miravam', en: "I'm going/leaving early", vocabId: 'verb-raftan' },
      { fa: 'تا', translit: 'tā', en: 'so that / in order to' },
      { fa: 'به ترافیک نخورم', translit: 'be terāfik nakhoram', en: "I don't hit traffic" },
    ],
    grammarConceptIds: ['g-purpose-clauses'], vocabIds: ['verb-raftan'],
    note: 'تا + subjunctive for purpose ("in order to / so that"), including this exact example sentence, confirmed against UT Austin Persian Online (Subjunctive) and MSU OpenBooks §8.7 Subjunctive.',
    confidence: 'verified',
  },
  {
    id: 's-purpose-class', fa: 'به کلاس فارسی می‌روم تا بهتر صحبت کنم.', translit: 'be kelās-e fārsi miravam tā behtar sohbat konam.',
    en: 'I go to Persian class in order to speak better.', literalEn: 'to class-of Persian I-go so-that better I-speak[subj.]',
    register: 'neutral', level: 5,
    words: [
      { fa: 'به کلاس فارسی می‌روم', translit: 'be kelās-e fārsi miravam', en: 'I go to Persian class', vocabId: 'sch-kelas' },
      { fa: 'تا', translit: 'tā', en: 'in order to' },
      { fa: 'بهتر صحبت کنم', translit: 'behtar sohbat konam', en: 'I speak better [subj.]' },
    ],
    grammarConceptIds: ['g-purpose-clauses'], vocabIds: ['sch-kelas'],
    notes: 'Same تا + subjunctive purpose pattern as s-purpose-traffic, applied to a everyday classroom-motivation sentence.',
    confidence: 'high-confidence',
  },
]

/** A short, natural multi-turn dialogue at a café — colloquial register,
 *  contractions from g-colloquial-contractions in active use. Each line is
 *  an ordinary `ExampleSentence` (individually SRS-tracked, individually
 *  glossed) with an added `speaker` label for display order/clarity. */
export const cafeDialogueSentences: ExampleSentence[] = [
  { id: 's-dlg-cafe-1', fa: 'سلام، چی میل دارید؟', translit: 'salām, chi meyl dārid?', en: 'Hi, what would you like?', literalEn: 'hello, what desire do-you-have', register: 'formal', level: 5, speaker: 'Barista', words: [{ fa: 'سلام', translit: 'salām', en: 'hi', vocabId: 'greet-salam' }, { fa: 'چی میل دارید؟', translit: 'chi meyl dārid?', en: 'what would you like?' }], vocabIds: ['greet-salam'], confidence: 'high-confidence' },
  { id: 's-dlg-cafe-2', fa: 'سلام، یه قهوه می‌خوام، لطفاً.', translit: 'salām, ye qahve mikhām, lotfan.', en: "Hi, I'd like a coffee, please.", literalEn: 'hello, a coffee I-want, please', register: 'colloquial', level: 5, speaker: 'Customer', words: [{ fa: 'سلام', translit: 'salām', en: 'hi', vocabId: 'greet-salam' }, { fa: 'یه قهوه می‌خوام', translit: 'ye qahve mikhām', en: "I'd like a coffee", vocabId: 'food-ghahve' }, { fa: 'لطفاً', translit: 'lotfan', en: 'please', vocabId: 'greet-lotfan' }], grammarConceptIds: ['g-colloquial-contractions'], vocabIds: ['food-ghahve', 'greet-lotfan'], notes: 'می‌خوام is the everyday spoken contraction of می‌خواهم — see g-colloquial-contractions.', confidence: 'high-confidence' },
  { id: 's-dlg-cafe-3', fa: 'بزرگ باشه یا کوچیک؟', translit: 'bozorg bāshe yā kuchik?', en: 'Large or small?', literalEn: 'big let-it-be or small', register: 'colloquial', level: 5, speaker: 'Barista', words: [{ fa: 'بزرگ', translit: 'bozorg', en: 'big/large', vocabId: 'adj-bozorg' }, { fa: 'باشه', translit: 'bāshe', en: 'okay/let it be' }, { fa: 'یا', translit: 'yā', en: 'or' }, { fa: 'کوچیک؟', translit: 'kuchik?', en: 'small', vocabId: 'adj-kuchik' }], vocabIds: ['adj-bozorg', 'adj-kuchik'], confidence: 'high-confidence' },
  { id: 's-dlg-cafe-4', fa: 'کوچیک خوبه، مرسی.', translit: 'kuchik khube, mersi.', en: "Small is good, thanks.", literalEn: 'small good-is, thanks', register: 'colloquial', level: 5, speaker: 'Customer', words: [{ fa: 'کوچیک خوبه', translit: 'kuchik khube', en: 'small is good', vocabId: 'adj-kuchik' }, { fa: 'مرسی', translit: 'mersi', en: 'thanks', vocabId: 'greet-mersi' }], vocabIds: ['adj-kuchik', 'greet-mersi'], confidence: 'high-confidence' },
  { id: 's-dlg-cafe-5', fa: 'چیز دیگه‌ای هم میل دارید؟', translit: 'chiz-e dige-i ham meyl dārid?', en: 'Would you like anything else?', literalEn: 'thing other too desire do-you-have', register: 'formal', level: 5, speaker: 'Barista', words: [{ fa: 'چیز دیگه‌ای هم', translit: 'chiz-e dige-i ham', en: 'anything else too' }, { fa: 'میل دارید؟', translit: 'meyl dārid?', en: 'would you like?' }], confidence: 'high-confidence' },
  { id: 's-dlg-cafe-6', fa: 'نه، همین کافیه. چقدر میشه؟', translit: 'na, hamin kāfie. cheqadr mishe?', en: "No, that's enough. How much is it?", literalEn: 'no, this-same is-enough. how-much does-it-become', register: 'colloquial', level: 5, speaker: 'Customer', words: [{ fa: 'نه، همین کافیه', translit: 'na, hamin kāfie', en: "no, that's enough", vocabId: 'greet-na' }, { fa: 'چقدر میشه؟', translit: 'cheqadr mishe?', en: 'how much is it?', vocabId: 'q-chegh' }], vocabIds: ['greet-na', 'q-chegh'], confidence: 'high-confidence' },
  { id: 's-dlg-cafe-7', fa: 'قابلی نداره، نوش جان!', translit: 'ghābeli nadāre, nush-e jān!', en: "Don't worry about it — enjoy!", literalEn: '[it] has no value, may-it-nourish-your-soul', register: 'colloquial', level: 5, speaker: 'Barista', words: [{ fa: 'قابلی نداره', translit: 'ghābeli nadāre', en: "it's nothing / don't worry about it" }, { fa: 'نوش جان!', translit: 'nush-e jān!', en: 'enjoy!', vocabId: 'exp-nooshejan' }], vocabIds: ['exp-nooshejan'], notes: 'قابلی نداره is a taarof formula (politely deflecting payment/thanks) — genuinely common at small transactions, though whether a fixed price still gets paid despite it is a real cultural nuance worth a native speaker\'s framing.', note: 'The taarof formula قابلی نداره itself is well-attested and unambiguous in meaning; flagged needs-review only for the cultural-practice nuance noted above, not the phrase\'s translation.', confidence: 'needs-review' },
]

/** A short catch-up dialogue between friends, leaning on the Level 5
 *  discourse-marker vocabulary (راستش, یعنی, خب, فکر کنم...). */
export const catchupDialogueSentences: ExampleSentence[] = [
  { id: 's-dlg-catchup-1', fa: 'به به، چه خبر؟ خیلی وقته ندیدمت!', translit: 'bah bah, che khabar? kheyli vaghte nadidamet!', en: "Hey, what's up? Haven't seen you in ages!", literalEn: 'wow, what news? much time I-haven\'t-seen-you', register: 'colloquial', level: 5, speaker: 'Ali', words: [{ fa: 'چه خبر؟', translit: 'che khabar?', en: "what's up?", vocabId: 'exp-che-khabar' }, { fa: 'خیلی وقته ندیدمت', translit: 'kheyli vaghte nadidamet', en: "haven't seen you in a while" }], vocabIds: ['exp-che-khabar'], confidence: 'high-confidence' },
  { id: 's-dlg-catchup-2', fa: 'سلامتی! راستش این چند ماه خیلی سرم شلوغ بود.', translit: 'salāmati! rāstesh in chand māh kheyli saram sholuq bud.', en: "All good! Actually, I've been really busy these past few months.", literalEn: 'health! its-truth these few months very my-head crowded was', register: 'colloquial', level: 5, speaker: 'Sara', words: [{ fa: 'سلامتی!', translit: 'salāmati!', en: 'all good!', vocabId: 'exp-salamati' }, { fa: 'راستش', translit: 'rāstesh', en: 'actually', vocabId: 'exp-rastesh' }, { fa: 'این چند ماه خیلی سرم شلوغ بود', translit: 'in chand māh kheyli saram sholuq bud', en: "these past few months I've been really busy" }], vocabIds: ['exp-salamati', 'exp-rastesh'], confidence: 'high-confidence' },
  { id: 's-dlg-catchup-3', fa: 'یعنی چیکار می‌کردی؟', translit: 'ya\'ni chikār mikardi?', en: 'I mean, what were you up to?', literalEn: 'that-is-to-say what-work were-you-doing', register: 'colloquial', level: 5, speaker: 'Ali', words: [{ fa: 'یعنی', translit: "ya'ni", en: 'I mean', vocabId: 'exp-yani' }, { fa: 'چیکار می‌کردی؟', translit: 'chikār mikardi?', en: 'what were you up to?', vocabId: 'exp-chekar-mikoni' }], grammarConceptIds: ['g-imperfect-past'], vocabIds: ['exp-yani', 'exp-chekar-mikoni'], confidence: 'high-confidence' },
  { id: 's-dlg-catchup-4', fa: 'خب، کار جدید شروع کردم، برای همین وقت نداشتم.', translit: 'khob, kār-e jadid shoru\' kardam, barāye hamin vaght nadāshtam.', en: "Well, I started a new job, so I didn't have time.", literalEn: 'well, work-of new start I-did, for this-same time I-didn\'t-have', register: 'colloquial', level: 5, speaker: 'Sara', words: [{ fa: 'خب', translit: 'khob', en: 'well', vocabId: 'exp-khob' }, { fa: 'کار جدید شروع کردم', translit: 'kār-e jadid shoru\' kardam', en: 'I started a new job', vocabId: 'adj-jadid' }, { fa: 'برای همین وقت نداشتم', translit: 'barāye hamin vaght nadāshtam', en: "so I didn't have time" }], vocabIds: ['exp-khob', 'adj-jadid'], confidence: 'high-confidence' },
  { id: 's-dlg-catchup-5', fa: 'فکر کنم کار جدیدت رو دوست داری.', translit: 'fekr konam kār-e jadidet ro dust dāri.', en: 'I bet you like your new job.', literalEn: 'I-think work-of new-your [obj.] friend you-have', register: 'colloquial', level: 5, speaker: 'Ali', words: [{ fa: 'فکر کنم', translit: 'fekr konam', en: 'I think / I bet', vocabId: 'exp-fekr-konam' }, { fa: 'کار جدیدت رو دوست داری', translit: 'kār-e jadidet ro dust dāri', en: 'you like your new job' }], vocabIds: ['exp-fekr-konam'], confidence: 'high-confidence' },
  { id: 's-dlg-catchup-6', fa: 'واقعاً همینطوره! به هر حال، بریم یه چایی بخوریم؟', translit: "vāghe'an hamintorie! be har hāl, berim ye chāyi bokhorim?", en: "Really, that's exactly it! Anyway, shall we go get some tea?", literalEn: "truly that-is-how-it-is! in every case, let's-go a tea let's-drink", register: 'colloquial', level: 5, speaker: 'Sara', words: [{ fa: 'واقعاً همینطوره!', translit: "vāghe'an hamintorie!", en: "really, that's it!", vocabId: 'exp-vaghean' }, { fa: 'به هر حال', translit: 'be har hāl', en: 'anyway', vocabId: 'exp-behar-hal' }, { fa: 'بریم یه چایی بخوریم؟', translit: 'berim ye chāyi bokhorim?', en: 'shall we go get tea?', vocabId: 'food-chay' }], vocabIds: ['exp-vaghean', 'exp-behar-hal', 'food-chay'], confidence: 'high-confidence' },
  { id: 's-dlg-catchup-7', fa: 'حتماً، بریم!', translit: 'hatman, berim!', en: "Definitely, let's go!", literalEn: 'certainly, let\'s-go', register: 'colloquial', level: 5, speaker: 'Ali', words: [{ fa: 'حتماً', translit: 'hatman', en: 'definitely' }, { fa: 'بریم!', translit: 'berim!', en: "let's go!" }], confidence: 'high-confidence' },
]
