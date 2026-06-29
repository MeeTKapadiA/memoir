# Memoir — AI Memory Journal

> An AI-powered personal journal that captures, processes, and helps you search your memories.

## Live Demo
[https://memoir-ai.vercel.app](https://memoir-ai.vercel.app)

## Demo Credentials
| Field    | Value              |
|----------|--------------------|
| Email    | demo@memoir.app    |
| Password | demo123            |

## Features
- 📝 **Text & Voice Entry** — Write or dictate your journal entry
- 🤖 **AI Processing** — GPT-4o generates a beautifully written entry + extracts people, places, events, moods, and decisions
- 📅 **Timeline + Calendar** — Browse entries with an interactive calendar
- 🔍 **Memory Search** — Find entries by keyword, person, or place
- 💬 **Chat with Memories** — Ask natural language questions: "When did I meet Priya?"
- 📊 **Mood Analytics** — Track your mood trends over 30 days

## Tech Stack
| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, Framer Motion |
| Backend    | Next.js API Routes                              |
| Database   | PostgreSQL (Supabase), Prisma ORM               |
| AI         | OpenAI GPT-4o (journal processing, memory chat) |
| Voice      | Web Speech API (browser-native, Chrome/Edge)    |
| Auth       | NextAuth.js v4, JWT sessions, bcrypt            |
| Deployment | Vercel                                          |

## Architecture
- **Fullstack Next.js**: API routes serve as a lightweight BFF, keeping auth and DB logic server-side
- **AI Pipeline**: Raw journal input → GPT-4o → structured JSON (summary, content, mood, entities) → stored in PostgreSQL
- **Memory Chat**: Last 60 entries are formatted as context and injected into GPT-4o system prompt. Simple and effective at demo scale. Production would use pgvector embeddings.
- **Voice**: Uses browser-native Web Speech API for real-time transcription. No audio files stored.

## Database Schema
- **User** — auth identity
- **JournalEntry** — raw input, AI summary, AI-written content, mood, moodScore, tags, entryDate
- **ExtractedEntity** — person/place/event/decision/emotion entities linked to entries

## Running Locally

```bash
git clone https://github.com/yourusername/memoir
cd memoir
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY
npx prisma db push
npx prisma db seed
npm run dev
```

## Environment Variables

| Variable         | Description                          |
|------------------|--------------------------------------|
| DATABASE_URL     | PostgreSQL connection string         |
| NEXTAUTH_SECRET  | Random secret for JWT signing        |
| NEXTAUTH_URL     | Full URL of your deployment          |
| OPENAI_API_KEY   | OpenAI API key (GPT-4o access)       |

## Known Limitations
- Voice input requires Chrome or Edge (Web Speech API)
- Memory chat uses full-context loading (last 60 entries), not vector search — fine for demo scale
- Desktop-only design (no mobile optimization)
- No real-time collaboration (not needed for personal journal)

## Future Improvements
- pgvector semantic memory search for large entry volumes
- AI-generated visual cards per entry
- Weekly digest email with AI-generated memory summary
- Mobile app via React Native
- Export to PDF / Markdown
