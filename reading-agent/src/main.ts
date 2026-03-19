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

// Load environment variables from a local file.
dotenv.config({ path: '.env.local' });

export default defineAgent({
  entry: async (ctx: JobContext) => {
    // Using Gemini realtime model for direct audio processing (no STT/TTS pipeline)
    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        voice: 'Puck',
        temperature: 0.7,
      }),
    });

    // Start the session
    await session.start({
      agent: new Agent(),
      room: ctx.room,
    });

    // Join the room and connect to the user
    await ctx.connect();

    // Greet the student
    session.generateReply({
      instructions: 'Say hello briefly and tell the student you are ready to help them practice reading. Keep it to one sentence.',
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
