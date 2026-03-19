import type { Room, RemoteParticipant } from '@livekit/rtc-node';

/**
 * Tracks words as they're spoken and matches them against a passage.
 * Sends RPC updates to the frontend for highlighting.
 */
export class WordTracker {
  private passageWords: string[] = [];
  private currentIndex = 0;
  private room: Room | null = null;
  private participant: RemoteParticipant | null = null;
  private lastProcessedText = '';

  constructor(passage: string) {
    // Normalize and split passage into words
    this.passageWords = passage
      .split(/\s+/)
      .filter(w => w.length > 0)
      .map(w => this.normalizeWord(w));

    console.log(`WordTracker initialized with ${this.passageWords.length} words`);
  }

  setRoomAndParticipant(room: Room, participant: RemoteParticipant) {
    this.room = room;
    this.participant = participant;
  }

  /**
   * Normalize a word for comparison (lowercase, remove punctuation)
   */
  private normalizeWord(word: string): string {
    return word.toLowerCase().replace(/[^a-z0-9']/g, '');
  }

  /**
   * Process a transcript string and match words against the passage
   */
  processTranscript(transcript: string, isFinal: boolean): void {
    // Skip if we've already processed this exact text
    if (transcript === this.lastProcessedText) {
      return;
    }

    // Get the new part of the transcript (for incremental processing)
    const newText = transcript.startsWith(this.lastProcessedText)
      ? transcript.slice(this.lastProcessedText.length)
      : transcript;

    // Split into words
    const spokenWords = newText
      .split(/\s+/)
      .filter(w => w.length > 0)
      .map(w => this.normalizeWord(w));

    if (spokenWords.length === 0) {
      return;
    }

    console.log(`Processing ${spokenWords.length} new words: ${spokenWords.join(', ')}`);

    // Match spoken words against passage words starting from currentIndex
    for (const spokenWord of spokenWords) {
      if (this.currentIndex >= this.passageWords.length) {
        console.log('Reached end of passage');
        break;
      }

      const expectedWord = this.passageWords[this.currentIndex];

      // Check if the spoken word matches the expected word
      if (this.wordsMatch(spokenWord, expectedWord)) {
        this.markWord(this.currentIndex, 'correct');
        this.currentIndex++;
      } else if (this.currentIndex + 1 < this.passageWords.length &&
                 this.wordsMatch(spokenWord, this.passageWords[this.currentIndex + 1])) {
        // Student might have skipped a word - mark current as error and move on
        this.markWord(this.currentIndex, 'error');
        this.currentIndex++;
        this.markWord(this.currentIndex, 'correct');
        this.currentIndex++;
      } else {
        // Check if it's a partial match or close enough
        const similarity = this.calculateSimilarity(spokenWord, expectedWord);
        if (similarity > 0.6) {
          // Close enough - might be an accent or slight mispronunciation
          this.markWord(this.currentIndex, 'correct');
          this.currentIndex++;
        }
        // Otherwise skip - might be a filler word or mishearing
      }
    }

    // Update last processed text for final transcripts
    if (isFinal) {
      this.lastProcessedText = transcript;
    }
  }

  /**
   * Check if two words match (with some fuzzy tolerance)
   */
  private wordsMatch(spoken: string, expected: string): boolean {
    if (spoken === expected) return true;
    if (spoken.length === 0 || expected.length === 0) return false;

    // Handle common variations
    // e.g., numbers spoken as words
    const numberWords: Record<string, string> = {
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
    };
    if (numberWords[spoken] === expected || spoken === numberWords[expected]) {
      return true;
    }

    return false;
  }

  /**
   * Calculate similarity between two words (simple Levenshtein-based)
   */
  private calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    // Simple character overlap ratio
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    let matches = 0;
    for (const char of shorter) {
      if (longer.includes(char)) {
        matches++;
      }
    }

    return matches / longer.length;
  }

  /**
   * Send word status update to frontend via RPC
   */
  private markWord(wordIndex: number, status: 'correct' | 'error' | 'corrected'): void {
    console.log(`Word ${wordIndex} ("${this.passageWords[wordIndex]}"): ${status}`);

    if (this.room && this.participant) {
      this.room.localParticipant?.performRpc({
        destinationIdentity: this.participant.identity,
        method: 'markWordRead',
        payload: JSON.stringify({ wordIndex, status }),
      }).catch(() => {
        // Ignore RPC errors
      });
    }
  }

  /**
   * Get current progress
   */
  getProgress(): { current: number; total: number } {
    return {
      current: this.currentIndex,
      total: this.passageWords.length,
    };
  }

  /**
   * Reset tracking to start
   */
  reset(): void {
    this.currentIndex = 0;
    this.lastProcessedText = '';
  }
}
