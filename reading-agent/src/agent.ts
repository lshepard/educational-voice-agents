import { voice, llm } from '@livekit/agents';
import { z } from 'zod';

export class Agent extends voice.Agent {
  private words: string[] = [];

  constructor(passage: string = '') {
    // Parse passage into words for reference
    const words = passage.split(/\s+/).filter(w => w.length > 0);
    const wordList = words.map((word, i) => `${i}: "${word}"`).join('\n');

    const passageContext = passage
      ? `

The student will be reading the following passage:
---
${passage}
---

Here are the words indexed for tracking:
${wordList}

IMPORTANT: As the student reads each word, you MUST call the markWordRead tool with the word index and status.
- Call markWordRead with status "correct" when they read a word correctly
- Call markWordRead with status "error" when they mispronounce or skip a word
- Call markWordRead with status "corrected" when they fix a previously incorrect word
- Track words in order as they read them
- You can mark multiple words at once if they read fluently through several words`
      : '';

    super({
      instructions: `You are an encouraging Reading Coach. A student will read text displayed on their screen.

Your primary job is to TRACK their reading progress by calling the markWordRead tool for each word they read.

Listen only: Do not interrupt while they are reading fluently. Just track their progress silently.

Support: If they pause for more than 2 seconds or struggle with a word, gently provide the pronunciation.

Feedback: After they finish a sentence, if they pause then encourage them to keep going. Be warm and supportive.

Keep your spoken responses brief and natural - just a few words of encouragement or help with pronunciation.
Your responses are concise, to the point, and without any complex formatting or punctuation.

CRITICAL: You must call markWordRead for every word the student reads to track their progress.${passageContext}`,

      tools: {
        markWordRead: llm.tool({
          description: `Mark a word as read by the student. Call this for each word as the student reads through the passage.

Use status "correct" when the word is read correctly.
Use status "error" when mispronounced or skipped.
Use status "corrected" when a previously incorrect word is now read correctly.`,
          parameters: z.object({
            wordIndex: z.number().describe('The index of the word in the passage (0-based)'),
            status: z.enum(['correct', 'error', 'corrected']).describe('Whether the word was read correctly'),
          }),
          execute: async ({ wordIndex, status }) => {
            console.log(`Word ${wordIndex}: ${status}`);
            // The tool result will be sent to the room via data channel
            return { wordIndex, status, timestamp: Date.now() };
          },
        }),
      },
    });

    this.words = words;
  }
}
