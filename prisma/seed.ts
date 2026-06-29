import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

type SeedEntity = {
  type: string
  value: string
  context: string
}

type SeedEntry = {
  rawInput: string
  summary: string
  content: string
  mood: string
  moodScore: number
  tags: string[]
  inputType: string
  entryDate: Date
  entities: SeedEntity[]
}

const entries: SeedEntry[] = [
  {
    rawInput: 'Back to work after New Year. Rohan and I talked about building a small AI journaling thing after office. Felt motivated but also unsure if we can keep it going.',
    summary: 'Arjun returned to work after the New Year and had an energizing conversation with Rohan about starting a side project. The idea felt exciting, even though there was uncertainty about finding the discipline to continue.',
    content: `The first proper workday of the year had that strange quiet energy that comes after holidays. Everyone was still half in vacation mode, but Rohan and I ended up in a long conversation near the pantry about building something of our own.

We kept circling back to the idea of a small AI journaling app, something that could help people preserve their memories without making journaling feel like homework. I could feel a spark in me as we spoke, the kind that usually appears before I talk myself out of things.

Tonight I am choosing not to dismiss it. Maybe it becomes nothing, but maybe it becomes the first real side project I have cared about in a long time.`,
    mood: 'motivated',
    moodScore: 8,
    tags: ['work', 'side-project', 'rohan'],
    inputType: 'text',
    entryDate: new Date('2026-01-05T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Rohan', context: 'Colleague who discussed starting a side project' },
      { type: 'event', value: 'Started side project idea', context: 'Discussed building an AI journaling app after work' },
      { type: 'emotion', value: 'Motivation', context: 'Felt a spark about building something independently' },
    ],
  },
  {
    rawInput: 'Dad called about his chest tightness. He said it was probably acidity but I panicked. Neha and I argued about whether to take him to the doctor immediately.',
    summary: 'A health scare with Dad left Arjun anxious and protective. He and Neha disagreed at first, but the fear came from how much they both cared.',
    content: `Dad called in the afternoon and mentioned chest tightness as casually as if he were talking about the weather. He insisted it was acidity, but my mind immediately ran to the worst possible places.

Neha and I went back and forth on the phone, both of us sounding sharper than we meant to. She thought we should wait and watch, while I wanted him checked immediately. Under the argument was the same fear, just wearing different clothes.

By evening he agreed to see the doctor tomorrow. I am trying to breathe, but it is hard when the people who raised you suddenly seem fragile.`,
    mood: 'anxious',
    moodScore: 3,
    tags: ['family', 'dad', 'health'],
    inputType: 'text',
    entryDate: new Date('2026-01-12T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Dad', context: 'Father had chest tightness and caused a health scare' },
      { type: 'person', value: 'Neha', context: 'Sister argued with Arjun about how urgently to act' },
      { type: 'event', value: 'Dad health scare', context: 'Family worried about chest tightness' },
      { type: 'emotion', value: 'Anxiety', context: 'Fear about Dad becoming vulnerable' },
    ],
  },
  {
    rawInput: 'Doctor said Dad is okay. Lifestyle changes needed. Priya checked in twice and made me laugh by saying dads are impossible patients.',
    summary: 'Dad received reassuring medical news, though he needs to make lifestyle changes. Priya helped lighten the mood and reminded Arjun he was not alone.',
    content: `The doctor said Dad is okay, which felt like someone opening a window in a room that had become too small. There are medicines now, and a list of lifestyle changes that Dad has already started pretending are optional.

Priya checked in twice today. She made me laugh by saying fathers are the worst patients because they believe stubbornness is a medical degree. It was exactly the kind of joke I needed.

I am grateful for the ordinary relief of this evening: Dad at home, Neha calmer, and the family WhatsApp group returning to bad forwards.`,
    mood: 'grateful',
    moodScore: 8,
    tags: ['family', 'relief', 'priya'],
    inputType: 'text',
    entryDate: new Date('2026-01-20T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Dad', context: 'Father received reassuring test results' },
      { type: 'person', value: 'Priya', context: 'Best friend checked in and made Arjun laugh' },
      { type: 'person', value: 'Neha', context: 'Sister felt calmer after the doctor visit' },
      { type: 'event', value: 'Doctor follow-up', context: 'Dad was advised medicines and lifestyle changes' },
    ],
  },
  {
    rawInput: 'Long rainy-ish evening at Marine Drive even though monsoon is far away. Thought about Kavya and how empty weekends feel now.',
    summary: 'A quiet evening at Marine Drive brought up memories of Kavya and the loneliness after the breakup. The city felt beautiful, but Arjun felt the ache of absence.',
    content: `I went to Marine Drive after work because I did not want to go straight home. The air had a strange dampness, almost like Mumbai was rehearsing for monsoon months in advance.

I thought about Kavya more than I expected to. Not in the dramatic way, not with anger, just with the hollow surprise of remembering that someone used to occupy so much space in my weekends.

The sea was restless and silver. I sat there until the lights came on across the curve, trying to accept that missing someone is not the same as needing them back.`,
    mood: 'melancholy',
    moodScore: 4,
    tags: ['breakup', 'mumbai', 'reflection'],
    inputType: 'text',
    entryDate: new Date('2026-01-27T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Kavya', context: 'Ex-partner Arjun was missing after the breakup' },
      { type: 'place', value: 'Marine Drive', context: 'Place where Arjun sat and reflected in the evening' },
      { type: 'event', value: 'Breakup with Kavya', context: 'Ongoing emotional aftermath of the breakup' },
      { type: 'emotion', value: 'Melancholy', context: 'Felt the emptiness of weekends after the relationship ended' },
    ],
  },
  {
    rawInput: 'Rohan and I finally made a Trello board for the side project. Priya says I sound alive when I talk about it. That stayed with me.',
    summary: 'The side project with Rohan moved from vague idea to a real plan. Priya noticed how alive Arjun sounded, which made the project feel emotionally important.',
    content: `Rohan and I created a Trello board today, which somehow made the side project feel less like a fantasy and more like a promise. We wrote down features, debated names, and assigned tasks as if we were a tiny startup of two.

Later I told Priya about it and she said, "You sound alive when you talk about this." It stopped me for a second because I knew exactly what she meant.

Maybe I have been waiting for work to make me feel that way, when the answer was to build something small and honest on the side.`,
    mood: 'excited',
    moodScore: 9,
    tags: ['side-project', 'rohan', 'priya'],
    inputType: 'text',
    entryDate: new Date('2026-02-03T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Rohan', context: 'Colleague and side project collaborator' },
      { type: 'person', value: 'Priya', context: 'Best friend noticed Arjun sounded alive about the project' },
      { type: 'event', value: 'Side project planning', context: 'Created a Trello board and feature list' },
      { type: 'decision', value: 'Commit to side project tasks', context: 'Moved from idea to assigned work' },
    ],
  },
  {
    rawInput: 'Kavya texted about exchanging a book. It was polite and painful. I did not spiral, which feels like progress.',
    summary: 'Kavya reached out for a practical reason, stirring old pain without overwhelming Arjun. He noticed his ability to stay steady as a quiet sign of healing.',
    content: `Kavya texted today about returning a book, and for a few minutes the phone felt heavier than it should. The message was polite, almost administrative, which somehow made it hurt more.

I replied calmly. No extra lines, no hidden invitation for a longer conversation, no attempt to reopen a door that closed for a reason.

Afterward I felt sad, but I did not spiral. That has to count as progress, even if progress sometimes looks like sitting quietly with an ache and not feeding it.`,
    mood: 'sad',
    moodScore: 4,
    tags: ['breakup', 'healing', 'kavya'],
    inputType: 'text',
    entryDate: new Date('2026-02-10T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Kavya', context: 'Ex-partner texted about returning a book' },
      { type: 'event', value: 'Book exchange message', context: 'Polite contact after the breakup' },
      { type: 'emotion', value: 'Sadness', context: 'Old pain resurfaced without becoming overwhelming' },
    ],
  },
  {
    rawInput: 'Difficult job interview prep. Rohan mocked my over-prepared notes in a helpful way. I am scared I will blank out.',
    summary: 'Arjun prepared intensely for a difficult job interview and worried about freezing under pressure. Rohan helped him lighten up, even while the anxiety remained.',
    content: `I spent most of the evening preparing for the interview and slowly turning my notes into a monument to fear. Every question led to three more questions, and soon I was preparing for conversations no human interviewer would ever have.

Rohan called and laughed at the number of bullet points I had written. He was kind about it, but he also reminded me that interviews are conversations, not courtroom trials.

I am still scared I will blank out. But I also know I have done the work, and maybe tomorrow the best thing I can do is sound like myself.`,
    mood: 'stressed',
    moodScore: 3,
    tags: ['interview', 'work', 'rohan'],
    inputType: 'text',
    entryDate: new Date('2026-02-16T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Rohan', context: 'Colleague helped Arjun prepare and calm down' },
      { type: 'event', value: 'Difficult job interview preparation', context: 'Prepared intensely and worried about blanking out' },
      { type: 'emotion', value: 'Stress', context: 'Fear of failing the interview' },
    ],
  },
  {
    rawInput: 'Interview happened. It was hard but not a disaster. I answered system design decently, messed up one behavioral answer. Priya said celebrate surviving.',
    summary: 'The difficult job interview was challenging but not disastrous. Priya helped Arjun see survival itself as worth celebrating.',
    content: `The interview is finally over. It was hard in exactly the way I expected and also easier in the ways anxiety never predicts. The system design round went better than I feared, and I found myself explaining tradeoffs with surprising calm.

I did mess up one behavioral answer. I rambled, lost the thread, and watched the interviewer politely wait for me to land the plane. That moment will replay in my head for a while.

Priya told me to celebrate surviving instead of performing an autopsy on every sentence. I ordered biryani and tried to listen.`,
    mood: 'reflective',
    moodScore: 6,
    tags: ['interview', 'priya', 'growth'],
    inputType: 'text',
    entryDate: new Date('2026-02-22T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Priya', context: 'Best friend encouraged Arjun to celebrate surviving the interview' },
      { type: 'event', value: 'Difficult job interview', context: 'Interview included system design and behavioral questions' },
      { type: 'emotion', value: 'Reflection', context: 'Processed what went well and what did not' },
    ],
  },
  {
    rawInput: 'Neha came over and forced me to clean the apartment. We ordered vada pav after. Felt normal and light for the first time in days.',
    summary: 'Neha helped Arjun reset his apartment and his mood. A simple evening with food and sibling banter brought comfort.',
    content: `Neha came over with the energy of a cyclone and declared my apartment emotionally uninhabitable. She opened windows, reorganized the table, and made fun of the pile of cables I keep pretending is a system.

We ordered vada pav afterward and sat on the floor because the sofa was covered with laundry she was making me fold. It was ridiculous and exactly what I needed.

There is a special kind of comfort in being bullied gently by a sibling who knows when you are slipping. Tonight the house feels like mine again.`,
    mood: 'content',
    moodScore: 7,
    tags: ['home', 'neha', 'family'],
    inputType: 'text',
    entryDate: new Date('2026-02-28T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Neha', context: "Sister helped clean the apartment and lift Arjun's mood" },
      { type: 'place', value: 'Arjun apartment', context: 'Cleaned and reset after a difficult week' },
      { type: 'emotion', value: 'Comfort', context: 'Felt cared for through sibling support' },
    ],
  },
  {
    rawInput: 'Goa planning started. Priya found a tiny guesthouse near Assagao. Dad thinks Goa means I will forget sunscreen and common sense.',
    summary: 'Planning for the Goa trip began with Priya finding a quiet guesthouse near Assagao. Dad teased Arjun with practical warnings, making the trip feel real and close.',
    content: `Priya found a small guesthouse near Assagao today, the kind with white walls, too many plants, and photos that make you suspicious because they look too peaceful. We booked it anyway.

Dad heard about the plan and immediately moved into advisory mode. Sunscreen, hydration, not renting a scooter after sunset, not trusting seafood shacks that look too empty. His concern comes disguised as a lecture.

The trip suddenly feels real. I can already imagine the slower mornings, the smell of wet earth, and the relief of being somewhere that does not ask me to be productive.`,
    mood: 'happy',
    moodScore: 8,
    tags: ['goa', 'travel', 'priya'],
    inputType: 'text',
    entryDate: new Date('2026-03-05T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Priya', context: 'Best friend helped find the Goa guesthouse' },
      { type: 'person', value: 'Dad', context: 'Father gave practical travel warnings' },
      { type: 'place', value: 'Goa', context: 'Destination for upcoming trip' },
      { type: 'place', value: 'Assagao', context: 'Area near the booked guesthouse' },
      { type: 'event', value: 'Goa trip planning', context: 'Booked guesthouse and planned travel' },
    ],
  },
  {
    rawInput: 'Freelance client replied yes. Small landing page project. Rohan says this is proof I should stop underselling myself.',
    summary: 'Arjun landed a freelance client for a landing page project. Rohan encouraged him to see it as evidence of his value rather than luck.',
    content: `The freelance client said yes today. It is a small landing page project, nothing dramatic, but the email still made me sit up straighter.

Rohan was more excited than I expected. He said this is proof I need to stop pricing myself like I am apologizing for existing. He is probably right, though confidence still feels like an oversized shirt.

I am proud of this. Not because the project is huge, but because I asked for the work, named a price, and did not immediately retreat.`,
    mood: 'motivated',
    moodScore: 8,
    tags: ['freelance', 'work', 'rohan'],
    inputType: 'text',
    entryDate: new Date('2026-03-12T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Rohan', context: 'Colleague encouraged Arjun to stop underselling himself' },
      { type: 'event', value: 'Got freelance client', context: 'Client accepted a landing page project proposal' },
      { type: 'decision', value: 'Take freelance landing page project', context: 'Accepted paid work outside regular job' },
    ],
  },
  {
    rawInput: 'In Goa. Priya and I rode through paddy fields near Aldona. Ate fish thali, sat at the beach until dark. Felt free.',
    summary: 'The Goa trip brought a day of paddy fields, food, and quiet beach time with Priya. Arjun felt unusually free and present.',
    content: `Goa has a way of slowing the body before the mind agrees. Priya and I rode through paddy fields near Aldona, past sleepy houses and dogs that seemed personally offended by scooters.

Lunch was a fish thali that tasted like someone had solved a problem I did not know I had. Later we sat by the beach until the sky turned violet and the shacks began switching on their lights.

For once I did not check work messages every ten minutes. I felt free in a simple, physical way, like my shoulders had finally remembered how to drop.`,
    mood: 'joyful',
    moodScore: 9,
    tags: ['goa', 'priya', 'travel'],
    inputType: 'voice',
    entryDate: new Date('2026-03-18T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Priya', context: 'Best friend traveled with Arjun in Goa' },
      { type: 'place', value: 'Goa', context: 'Travel destination where Arjun felt free' },
      { type: 'place', value: 'Aldona', context: 'Area with paddy fields they rode through' },
      { type: 'event', value: 'Goa beach evening', context: 'Sat by the beach until dark' },
      { type: 'emotion', value: 'Freedom', context: 'Felt present and away from work pressure' },
    ],
  },
  {
    rawInput: 'Back from Goa. Train ride home made me quiet. Priya slept most of the way. I kept thinking I need more days like that.',
    summary: 'Returning from Goa left Arjun quiet and reflective. The trip made him realize how badly he needs more spacious, unhurried days.',
    content: `The train back from Goa felt like a soft closing bracket. Priya slept for most of the journey with her headphones still on, while I watched the landscape turn gradually back into city edges.

I kept replaying small moments: the paddy fields, the beach lights, the guesthouse cat that behaved like it owned our room. None of it was grand, which is why it mattered.

I do not want vacations to be the only place where I remember myself. That feels like the lesson I am bringing home, tucked somewhere between dirty clothes and receipts.`,
    mood: 'reflective',
    moodScore: 7,
    tags: ['goa', 'return', 'reflection'],
    inputType: 'text',
    entryDate: new Date('2026-03-25T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Priya', context: 'Best friend slept during the train ride back' },
      { type: 'place', value: 'Goa', context: 'Trip Arjun returned from' },
      { type: 'event', value: 'Returning from Goa', context: 'Train journey home after the trip' },
      { type: 'decision', value: 'Make room for slower days', context: 'Realized vacations should not be the only time he feels present' },
    ],
  },
  {
    rawInput: 'Freelance client sent confusing feedback and I got frustrated. Rohan helped me turn it into clear tasks. Need to learn patience.',
    summary: 'Confusing client feedback left Arjun frustrated, but Rohan helped translate it into manageable tasks. The day became a lesson in patience and communication.',
    content: `The freelance client sent feedback that felt like a maze drawn by someone who had never seen a map. I read the email three times and still could not tell what they actually wanted.

I complained to Rohan, who very calmly helped me convert the chaos into a task list. Header copy, mobile spacing, form placement, testimonials. Suddenly the monster had names.

I still felt irritated, but less helpless. Maybe professionalism is not the absence of frustration; maybe it is learning how to move through it without setting everything on fire.`,
    mood: 'frustrated',
    moodScore: 4,
    tags: ['freelance', 'client', 'rohan'],
    inputType: 'text',
    entryDate: new Date('2026-04-01T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Rohan', context: 'Helped Arjun convert confusing client feedback into tasks' },
      { type: 'event', value: 'Freelance client feedback', context: 'Received unclear landing page changes' },
      { type: 'emotion', value: 'Frustration', context: 'Felt irritated by ambiguous feedback' },
    ],
  },
  {
    rawInput: 'Arjun birthday. Priya organized dinner at Bombay Canteen. Neha brought embarrassing childhood photos. Dad gave a quiet hug.',
    summary: 'Arjun celebrated his birthday with dinner organized by Priya, childhood photos from Neha, and a quiet hug from Dad. The celebration felt warm, funny, and deeply grounding.',
    content: `My birthday dinner at The Bombay Canteen was louder and warmer than I expected. Priya organized everything with the confidence of someone who knows exactly how much fuss I can tolerate before pretending to hate it.

Neha arrived with childhood photos that should probably be illegal to share in public. Everyone laughed, including me, even though I threatened revenge at least twice.

Dad did not say much, but when he hugged me before leaving, he held on a second longer than usual. That was the gift I will remember.`,
    mood: 'joyful',
    moodScore: 9,
    tags: ['birthday', 'family', 'friends'],
    inputType: 'text',
    entryDate: new Date('2026-04-08T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Priya', context: 'Best friend organized birthday dinner' },
      { type: 'person', value: 'Neha', context: 'Sister brought embarrassing childhood photos' },
      { type: 'person', value: 'Dad', context: 'Father gave Arjun a meaningful hug' },
      { type: 'place', value: 'The Bombay Canteen', context: 'Restaurant where birthday dinner happened' },
      { type: 'event', value: 'Arjun birthday celebration', context: 'Dinner with friends and family' },
    ],
  },
  {
    rawInput: 'Side project demo worked locally. Rohan and I high-fived like children. Still ugly UI but it saves entries.',
    summary: 'The side project reached a small but meaningful milestone when the local demo worked. Arjun and Rohan celebrated the progress despite the unfinished UI.',
    content: `The side project saved its first entry today. The UI is still ugly enough to need an apology, but the core flow worked, and for a moment that was all that mattered.

Rohan and I high-fived like children after the demo ran locally. It was funny and pure, the kind of small celebration that corporate work rarely gives permission for.

There is still a long way to go, but tonight the project feels real in a new way. It exists outside our conversations now.`,
    mood: 'excited',
    moodScore: 9,
    tags: ['side-project', 'rohan', 'milestone'],
    inputType: 'text',
    entryDate: new Date('2026-04-14T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Rohan', context: 'Side project collaborator who celebrated the demo' },
      { type: 'event', value: 'Side project local demo', context: 'App successfully saved its first entry locally' },
      { type: 'emotion', value: 'Excitement', context: 'Felt the project become real' },
    ],
  },
  {
    rawInput: 'Quiet Sunday with Dad. He made chai and asked about Kavya without pushing. I told him I am okay-ish.',
    summary: 'A quiet Sunday with Dad gave Arjun space to talk gently about Kavya. The conversation was tender because Dad listened without forcing advice.',
    content: `Dad made chai in the evening and asked about Kavya with unusual softness. He did not interrogate, did not offer immediate solutions, did not make it about what I should have done.

I told him I am okay-ish, which is probably the most honest answer I have. He nodded as if okay-ish was a perfectly acceptable stage of healing.

Sometimes love is not dramatic. Sometimes it is your father refilling your cup and letting silence do half the work.`,
    mood: 'calm',
    moodScore: 7,
    tags: ['dad', 'breakup', 'family'],
    inputType: 'text',
    entryDate: new Date('2026-04-20T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Dad', context: 'Father listened gently over chai' },
      { type: 'person', value: 'Kavya', context: 'Ex-partner Dad asked about without pushing' },
      { type: 'emotion', value: 'Calm', context: 'Felt supported by quiet family presence' },
    ],
  },
  {
    rawInput: 'Neha had a rough day and came over. We watched a terrible thriller and ate noodles. I liked being useful.',
    summary: 'Neha came over after a rough day, and Arjun supported her with comfort food and a bad movie. Being useful to his sister brought quiet satisfaction.',
    content: `Neha had one of those days where every small thing seems to join a conspiracy. She came over carrying irritation like an extra bag and collapsed on the sofa without asking.

We watched a terrible thriller that became funny by accident and made noodles that were mostly soy sauce. She talked in bursts, then went quiet, then talked again.

I liked being useful without needing to fix everything. Sometimes the best help is simply making space for someone to be messy in peace.`,
    mood: 'content',
    moodScore: 7,
    tags: ['neha', 'family', 'support'],
    inputType: 'text',
    entryDate: new Date('2026-04-26T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Neha', context: 'Sister came over after a rough day' },
      { type: 'event', value: 'Comfort movie night', context: 'Watched a bad thriller and ate noodles' },
      { type: 'emotion', value: 'Usefulness', context: 'Felt good being there for Neha' },
    ],
  },
  {
    rawInput: 'Freelance landing page went live. Client happy. Priya sent too many clapping emojis. I feel quietly proud.',
    summary: 'The freelance landing page went live and the client was happy. Priya celebrated enthusiastically, while Arjun felt a quieter, deeper pride.',
    content: `The freelance landing page went live today. I refreshed it several times, partly to check for bugs and partly because seeing my work in the world still feels a little unreal.

The client sent a kind message, which I screenshotted immediately like a person who pretends not to need validation. Priya responded with an unreasonable number of clapping emojis.

I feel quietly proud. It is not fireworks, more like a lamp being switched on in a room I had forgotten was mine.`,
    mood: 'grateful',
    moodScore: 8,
    tags: ['freelance', 'client', 'priya'],
    inputType: 'text',
    entryDate: new Date('2026-05-02T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Priya', context: 'Best friend celebrated the freelance launch' },
      { type: 'event', value: 'Freelance landing page launch', context: 'Client approved and site went live' },
      { type: 'emotion', value: 'Pride', context: 'Felt proud seeing paid work in the world' },
    ],
  },
  {
    rawInput: 'Rohan wants to add voice input to the side project. I worry we are over-scoping but it also sounds useful.',
    summary: 'Rohan suggested adding voice input to the side project, which made Arjun both cautious and curious. The tension between ambition and focus became clear.',
    content: `Rohan suggested voice input for the side project today, and I immediately felt two things at once: yes, that would be useful, and please do not let us turn this into a spaceship.

We talked through the feature after work. Voice could make journaling easier for people who do not want to type at the end of a long day, but it could also distract us from making the basic flow excellent.

I think the real decision is not whether the idea is good. It is whether now is the right time to build it.`,
    mood: 'reflective',
    moodScore: 6,
    tags: ['side-project', 'voice', 'rohan'],
    inputType: 'text',
    entryDate: new Date('2026-05-08T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Rohan', context: 'Suggested adding voice input to the side project' },
      { type: 'decision', value: 'Evaluate voice input scope', context: 'Debated whether to add voice now or later' },
      { type: 'event', value: 'Side project feature planning', context: 'Discussed potential voice input feature' },
    ],
  },
  {
    rawInput: 'Interview rejection arrived. I thought I was ready but it hurt. Priya said disappointment is data, not identity.',
    summary: 'The interview rejection hurt more than Arjun expected. Priya helped him frame the disappointment as feedback rather than a judgment of his worth.',
    content: `The rejection email arrived this morning, clean and polite and completely uninterested in how much space it would take up in my head. I thought I was prepared for it, but apparently preparation does not make disappointment painless.

I kept replaying the behavioral answer I messed up, as if finding the exact wrong sentence would make the outcome easier to accept. It did not.

Priya said disappointment is data, not identity. I am writing that down because it sounds like something future me will need again.`,
    mood: 'sad',
    moodScore: 4,
    tags: ['interview', 'rejection', 'priya'],
    inputType: 'text',
    entryDate: new Date('2026-05-14T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Priya', context: 'Best friend helped reframe the rejection' },
      { type: 'event', value: 'Job interview rejection', context: 'Received rejection from difficult interview' },
      { type: 'emotion', value: 'Disappointment', context: 'Felt hurt by the rejection email' },
    ],
  },
  {
    rawInput: 'Dad skipped his walk again. I got annoyed and then felt guilty. Health scare should have changed things more.',
    summary: 'Arjun felt frustrated that Dad was not sticking to healthier habits after the scare. The irritation was mixed with fear and guilt.',
    content: `Dad skipped his walk again today and I reacted more sharply than I wanted to. He made a joke, I did not laugh, and suddenly the room had that brittle silence families know too well.

My frustration is not really about the walk. It is about fear wearing the mask of discipline. I want him to take care of himself because I am not ready to imagine the alternative.

I apologized later, but I still feel guilty. Loving parents as an adult is strange because you can see their choices clearly and still cannot make those choices for them.`,
    mood: 'frustrated',
    moodScore: 4,
    tags: ['dad', 'health', 'family'],
    inputType: 'text',
    entryDate: new Date('2026-05-20T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Dad', context: 'Father skipped his health walk after earlier scare' },
      { type: 'event', value: 'Dad skipped walk', context: 'Triggered worry and frustration about health habits' },
      { type: 'emotion', value: 'Guilt', context: 'Felt bad after reacting sharply' },
    ],
  },
  {
    rawInput: 'Monsoon evening in Mumbai. Office windows foggy, traffic glowing red, chai with Rohan downstairs. City felt cinematic.',
    summary: 'A monsoon evening in Mumbai made the city feel cinematic and alive. Chai with Rohan turned an ordinary workday into a memorable scene.',
    content: `The monsoon arrived with full drama today. Office windows turned foggy, traffic lights smeared red across the wet road, and everyone suddenly had weather opinions.

Rohan and I went downstairs for chai and stood under the awning watching people negotiate puddles like they were moral dilemmas. The city was chaotic, damp, and strangely beautiful.

Some evenings do not need anything big to happen. Mumbai simply changes the lighting, and the day becomes worth remembering.`,
    mood: 'calm',
    moodScore: 7,
    tags: ['monsoon', 'mumbai', 'rohan'],
    inputType: 'voice',
    entryDate: new Date('2026-05-26T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Rohan', context: 'Had chai with Arjun during the monsoon evening' },
      { type: 'place', value: 'Mumbai', context: 'City felt cinematic during monsoon rain' },
      { type: 'place', value: 'Office', context: 'Watched rain and traffic from work' },
      { type: 'event', value: 'Monsoon evening in Mumbai', context: 'Rainy evening with chai and glowing traffic' },
    ],
  },
  {
    rawInput: 'Priya and I had a small fight. I cancelled plans twice and she finally called it out. She was right.',
    summary: 'Priya confronted Arjun about repeatedly cancelling plans, leading to a small but honest fight. He realized she was right and that friendship needs attention too.',
    content: `Priya and I fought today, not dramatically, but enough for the silence afterward to feel uncomfortable. She called me out for cancelling plans twice and then pretending it was no big deal.

My first instinct was to defend myself with work, tiredness, deadlines, all the usual shields. But underneath that I knew she was right. I have been treating friendship like it will patiently wait in the corner forever.

I apologized properly by evening. I hope I remember that people do not only need us during emergencies; they need us in ordinary plans too.`,
    mood: 'stressed',
    moodScore: 5,
    tags: ['priya', 'friendship', 'repair'],
    inputType: 'text',
    entryDate: new Date('2026-06-01T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Priya', context: 'Best friend confronted Arjun about cancelling plans' },
      { type: 'event', value: 'Fight with Priya', context: 'Small conflict about neglected plans' },
      { type: 'decision', value: 'Apologize properly to Priya', context: 'Acknowledged that she was right' },
    ],
  },
  {
    rawInput: 'Neha got shortlisted for her course. We screamed on video call. Dad pretended not to cry.',
    summary: 'Neha was shortlisted for her course, sparking a joyful family celebration. Dad tried to hide his emotion, making the moment even sweeter.',
    content: `Neha got shortlisted for her course today, and the video call immediately turned into screaming. She tried to act composed for about five seconds before giving up and laughing.

Dad pretended not to cry, which is how we knew he was absolutely crying. He kept clearing his throat and saying practical things about documents.

It felt good to have family news that was uncomplicatedly happy. For once, the group call did not need managing; it just needed volume.`,
    mood: 'happy',
    moodScore: 9,
    tags: ['neha', 'family', 'celebration'],
    inputType: 'text',
    entryDate: new Date('2026-06-07T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Neha', context: 'Sister got shortlisted for her course' },
      { type: 'person', value: 'Dad', context: 'Father became emotional during the family call' },
      { type: 'event', value: 'Neha course shortlist', context: 'Family celebrated Neha being shortlisted' },
    ],
  },
  {
    rawInput: 'Design workshop today. Met Anjali during a prototyping exercise. She asked sharp questions and somehow made everyone less nervous.',
    summary: 'Arjun attended a design workshop and met Anjali during a prototyping exercise. Her sharp questions and calming presence made a strong first impression.',
    content: `The design workshop was better than I expected. I went in prepared to feel slightly out of place, but the room had a warm, curious energy that made it easier to participate.

I met Anjali during a prototyping exercise. She asked sharp questions without making anyone feel small, which is rarer than it should be. At one point she reframed our entire idea with a single sentence.

I left feeling energized, not just by the workshop but by the reminder that new people can still enter your life without warning and change the texture of a day.`,
    mood: 'motivated',
    moodScore: 8,
    tags: ['workshop', 'anjali', 'design'],
    inputType: 'text',
    entryDate: new Date('2026-06-12T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Anjali', context: 'New friend met during a design workshop' },
      { type: 'event', value: 'Design workshop', context: 'Workshop where Arjun met Anjali' },
      { type: 'event', value: 'Prototyping exercise', context: 'Activity where Anjali impressed the group' },
      { type: 'emotion', value: 'Motivation', context: 'Left the workshop energized' },
    ],
  },
  {
    rawInput: 'Coffee with Anjali after workshop follow-up. We talked about design, cities, and why adults forget how to play. Felt easy.',
    summary: 'Arjun met Anjali for coffee after the workshop and found the conversation easy and wide-ranging. Their connection felt new, light, and unforced.',
    content: `Anjali and I met for coffee today after exchanging a few workshop follow-up messages. I expected a quick conversation about design resources, but we somehow moved from prototyping to cities to why adults forget how to play.

There was an ease to it that surprised me. No performance, no careful positioning, just curiosity moving from one topic to another.

I am trying not to rush to define what new connections mean. For now, it is enough that the afternoon felt open and kind.`,
    mood: 'content',
    moodScore: 8,
    tags: ['anjali', 'coffee', 'friendship'],
    inputType: 'text',
    entryDate: new Date('2026-06-17T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Anjali', context: 'New friend met for coffee after the workshop' },
      { type: 'place', value: 'Coffee shop', context: 'Place where Arjun and Anjali talked' },
      { type: 'event', value: 'Coffee with Anjali', context: 'Follow-up meeting after design workshop' },
      { type: 'emotion', value: 'Ease', context: 'Conversation felt natural and unforced' },
    ],
  },
  {
    rawInput: 'Anjali joined our side project feedback call with Rohan. She gave brutal but useful notes. Rohan loved her immediately.',
    summary: 'Anjali joined a feedback call for the side project and offered direct, useful critique. Rohan responded well, and Arjun felt the project sharpen because of her input.',
    content: `Anjali joined our side project feedback call today, and within ten minutes she had identified three problems Rohan and I had been politely avoiding. Her notes were direct, but never careless.

Rohan loved her immediately, mostly because she challenged our onboarding flow with the exact kind of clarity we needed. I felt slightly exposed and very grateful.

The project feels sharper tonight. It is humbling to let someone new look at your work, but it is also how the work grows up.`,
    mood: 'grateful',
    moodScore: 8,
    tags: ['anjali', 'rohan', 'side-project'],
    inputType: 'text',
    entryDate: new Date('2026-06-21T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Anjali', context: 'New friend gave useful feedback on the side project' },
      { type: 'person', value: 'Rohan', context: "Side project collaborator appreciated Anjali's critique" },
      { type: 'event', value: 'Side project feedback call', context: 'Anjali reviewed and critiqued the project' },
      { type: 'decision', value: 'Improve onboarding flow', context: 'Feedback identified onboarding as a weak point' },
    ],
  },
  {
    rawInput: 'Felt exhausted today. Too many tabs open in my brain. Anjali sent a kind design article but I could barely reply. Did nothing after work except make dal rice and sleep early.',
    summary: 'Arjun felt mentally exhausted and chose a quiet evening of dal rice and rest. Even a thoughtful message from Anjali had to wait because the day was less about achievement and more about accepting tiredness.',
    content: `Today felt like having too many browser tabs open in my brain, all of them playing different audio. Nothing terrible happened, but every small task seemed to require more effort than it should.

Anjali sent a thoughtful design article in the evening, and I appreciated it even though I barely had the energy to reply properly. After work I made dal rice, ignored most messages for a while, and let the apartment be quiet.

I am going to sleep early and call that a success. Some days the bravest thing is not pushing for one more useful hour.`,
    mood: 'tired',
    moodScore: 5,
    tags: ['rest', 'work', 'self-care'],
    inputType: 'voice',
    entryDate: new Date('2026-06-24T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Anjali', context: 'New friend sent a thoughtful design article while Arjun was exhausted' },
      { type: 'emotion', value: 'Exhaustion', context: 'Felt mentally overloaded after work' },
      { type: 'decision', value: 'Sleep early', context: 'Chose rest over productivity' },
      { type: 'event', value: 'Quiet evening at home', context: 'Made dal rice and rested' },
    ],
  },
  {
    rawInput: 'Priya, Rohan, Anjali, and I tested the side project together. It still breaks but people laughed while using it. That feels promising.',
    summary: 'Arjun tested the side project with Priya, Rohan, and Anjali, discovering bugs but also real delight. The laughter during testing made the project feel promising.',
    content: `We tested the side project together today: Priya, Rohan, Anjali, and me on a call that was equal parts product review and comedy show. The app broke twice, once in a way that made Rohan cover his face.

But people laughed while using it. Priya said the entry summary felt unexpectedly tender, and Anjali pointed out that the emotional tone was the real strength, not the features.

I know there is still a lot to fix. But tonight I believe there is something alive inside this little project, and that belief feels precious.`,
    mood: 'joyful',
    moodScore: 9,
    tags: ['side-project', 'friends', 'testing'],
    inputType: 'text',
    entryDate: new Date('2026-06-28T10:00:00.000Z'),
    entities: [
      { type: 'person', value: 'Priya', context: 'Best friend tested the side project and liked the tender summary' },
      { type: 'person', value: 'Rohan', context: 'Side project collaborator joined testing call' },
      { type: 'person', value: 'Anjali', context: 'New friend gave feedback about emotional tone' },
      { type: 'event', value: 'Side project testing call', context: 'Group tested the app and found bugs' },
      { type: 'emotion', value: 'Joy', context: 'Felt encouraged by people laughing while using the project' },
    ],
  },
]

async function main() {
  // Delete existing demo user and cascade
  await prisma.user.deleteMany({ where: { email: 'demo@memoir.app' } })

  const password = await bcrypt.hash('demo123', 10)
  const user = await prisma.user.create({
    data: {
      name: 'Arjun Mehta',
      email: 'demo@memoir.app',
      password,
    },
  })

  for (const entry of entries) {
    const { entities, ...entryData } = entry
    const created = await prisma.journalEntry.create({
      data: { ...entryData, userId: user.id },
    })
    if (entities?.length) {
      await prisma.extractedEntity.createMany({
        data: entities.map((e: any) => ({ ...e, entryId: created.id })),
      })
    }
  }

  console.log('Seeded 30 entries for demo@memoir.app')
}

main().catch(console.error).finally(() => prisma.$disconnect())
