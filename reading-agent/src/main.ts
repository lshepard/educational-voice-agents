import {
  type JobContext,
  ServerOptions,
  cli,
  defineAgent,
  voice,
} from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { Agent } from './agent';
import { WordTracker } from './word-tracker';

// Load environment variables from a local file.
dotenv.config({ path: '.env.local' });

export default defineAgent({
  entry: async (ctx: JobContext) => {
    // Join the room first to get participant info
    await ctx.connect();

    // Wait for participant and get their metadata (contains the passage)
    const participant = await ctx.waitForParticipant();
    let passage = '';

    try {
      const metadata = participant.metadata;
      if (metadata) {
        const parsed = JSON.parse(metadata);
        passage = parsed.passage || '';
      }
    } catch (e) {
      console.log('No passage metadata found');
    }

    console.log('Passage to read:', passage.substring(0, 100) + '...');

    // Create word tracker for real-time highlighting
    const wordTracker = new WordTracker(passage);
    wordTracker.setRoomAndParticipant(ctx.room, participant);

    // Using Gemini realtime model for coaching (voice interaction)
    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        voice: 'Puck',
        temperature: 0.7,
      }),
    });

    // Listen for transcription events from Gemini and track words
    session.on('user_input_transcribed', (event) => {
      console.log(`Transcription (final=${event.isFinal}): "${event.transcript}"`);
      wordTracker.processTranscript(event.transcript, event.isFinal);
    });

    // Create agent for coaching
    const agent = new Agent(passage);

    // Start the voice session
    await session.start({
      agent,
      room: ctx.room,
      participant,
    });

    // Greet the student
    const greetingInstructions = passage
      ? `Greet the student briefly. Tell them you can see they have a passage ready and you're here to help them practice reading it. Keep it to one or two sentences. Be warm and encouraging.`
      : `Greet the student briefly. Tell them you're ready to help them practice reading. Keep it to one sentence.`;

    session.generateReply({
      instructions: greetingInstructions,
    });

    // Keep the agent alive until the session closes
    await new Promise<void>((resolve) => {
      session.on('close', () => {
        resolve();
      });
    });
  },
});

// Run the agent server
cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'reading-agent',
  }),
);
