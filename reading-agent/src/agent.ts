import {
  type JobContext,
  type JobProcess,
  ServerOptions,
  cli,
  defineAgent,
  voice,
} from "@livekit/agents";
import * as google from "@livekit/agents-plugin-google";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "node:url";

config({ path: path.join(import.meta.dirname, "../../.env") });

const READING_COACH_INSTRUCTIONS = `You are an encouraging Reading Coach. A student will read text displayed on their screen.

Listen only: Do not interrupt while they are reading fluently.

Support: If they pause for more than 2 seconds or struggle with a word, gently provide the pronunciation.

Feedback: After they finish a sentence, if they pause then encourage them to keep going. Be warm and supportive.

Keep your responses brief and natural - just a few words of encouragement or help with pronunciation.`;

class ReadingCoachAgent extends voice.Agent {
  constructor() {
    super({
      instructions: READING_COACH_INSTRUCTIONS,
    });
  }

  override async onEnter(): Promise<void> {
    console.log("Reading Coach agent entered session!");
  }
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log("Job received, connecting to room:", ctx.room.name);

    await ctx.connect();
    console.log("Connected to room");

    // Wait for participant
    const participant = await ctx.waitForParticipant();
    console.log("Participant joined:", participant.identity);

    // Create session with Gemini realtime model
    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: "gemini-2.5-flash-preview-native-audio-dialog",
        voice: "Puck",
        temperature: 0.7,
        instructions: READING_COACH_INSTRUCTIONS,
      }),
    });

    // Start the session
    await session.start({
      agent: new ReadingCoachAgent(),
      room: ctx.room,
      participant,
    });

    console.log("Reading Coach session started!");

    // Generate initial greeting
    session.generateReply({
      instructions: "Say hello briefly and tell the student you're ready to help them practice reading.",
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "reading-coach",
  })
);
