'use client';

import { useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

type WordStatus = 'pending' | 'correct' | 'error' | 'corrected';

interface WordState {
  word: string;
  status: WordStatus;
}

interface PassageDisplayProps {
  passage: string;
  isActive: boolean;
}

export function PassageDisplay({ passage, isActive }: PassageDisplayProps) {
  const [words, setWords] = useState<WordState[]>([]);
  const room = useRoomContext();

  // Parse passage into words on mount/change
  useEffect(() => {
    const parsed = passage.split(/(\s+)/).map((segment) => ({
      word: segment,
      status: 'pending' as WordStatus,
    }));
    setWords(parsed);
  }, [passage]);

  // Register RPC handler for markWordRead
  useEffect(() => {
    if (!room) return;

    const handleMarkWordRead = async (data: { callerIdentity: string; payload: string }) => {
      try {
        const { wordIndex, status } = JSON.parse(data.payload);
        console.log('Received markWordRead RPC:', wordIndex, status);

        setWords((prev) => {
          const updated = [...prev];
          // Find the actual word at the index (accounting for whitespace segments)
          let wordCount = 0;
          for (let i = 0; i < updated.length; i++) {
            if (updated[i].word.trim().length > 0) {
              if (wordCount === wordIndex) {
                updated[i] = { ...updated[i], status };
                break;
              }
              wordCount++;
            }
          }
          return updated;
        });

        return 'ok';
      } catch (e) {
        console.error('Error handling markWordRead:', e);
        return 'error';
      }
    };

    room.localParticipant?.registerRpcMethod('markWordRead', handleMarkWordRead);

    return () => {
      room.localParticipant?.unregisterRpcMethod('markWordRead');
    };
  }, [room]);

  const getWordClassName = (status: WordStatus) => {
    switch (status) {
      case 'correct':
      case 'corrected':
        return 'text-green-400 bg-green-400/10';
      case 'error':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-zinc-100';
    }
  };

  return (
    <div className="flex-1 overflow-auto rounded-lg border border-zinc-700 bg-zinc-800 p-6">
      <p className="text-lg leading-relaxed">
        {words.map((item, index) => {
          // Whitespace segments
          if (item.word.trim().length === 0) {
            return <span key={index}>{item.word}</span>;
          }

          // Word segments
          return (
            <span
              key={index}
              className={cn(
                'rounded px-0.5 transition-colors duration-300',
                isActive && getWordClassName(item.status)
              )}
            >
              {item.word}
            </span>
          );
        })}
      </p>
    </div>
  );
}
