# AI Usage Summary

## Tools Used
- **Claude (claude.ai)** — Architecture planning, prompt design, full Cursor prompt sequence
- **Cursor** — Code generation for all components, API routes, and debugging

## What AI Helped With
- Full project architecture and tech stack selection
- Prisma schema design
- OpenAI system prompt engineering for journal processing
- All React component scaffolding
- API route logic
- Seed data generation
- README writing

## Important Manual Decisions

**Chose Next.js App Router** instead of Pages Router — server components allow cleaner server-side data fetching without extra API calls.

**Chose JWT sessions** over database sessions — fewer DB queries per request, simpler for a single-user journal.

**Chose Web Speech API** over OpenAI Whisper for voice — zero latency, no audio file upload, no extra API cost. Trade-off: Chrome/Edge only.

**Flat context for memory chat** instead of vector embeddings — 60 entries fit comfortably in GPT-4o's context window. For production scale, I'd add pgvector with Supabase.

**Refined the AI journal processing prompt 3 times** — initial AI-generated prompt produced generic entries. I added explicit instructions for warmth, first-person voice, and expanding (not summarizing) the raw input.

**Rewrote the calendar component** — AI generated a dependency-heavy calendar library usage; I replaced it with a date-fns manual implementation to reduce bundle size and have full design control.

**Manually designed the seed data narrative** — gave recurring characters (Priya, Rohan, Dad, Neha) consistent story arcs across 30 entries so the demo feels like a real person's life, not random data.

## Known Limitations
- Memory chat has no streaming (full response before display)
- No image generation for entries
- Voice is Chrome-only
