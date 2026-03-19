'use client';

import { useEffect, useRef } from 'react';
import { type ReceivedMessage } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

interface MiniTranscriptProps {
  messages: ReceivedMessage[];
  className?: string;
}

export function MiniTranscript({ messages, className }: MiniTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={cn('border-t border-zinc-700 bg-zinc-900/80 backdrop-blur-sm', className)}>
      <div className="px-4 py-2">
        <span className="text-xs font-medium text-zinc-500">Transcript</span>
      </div>
      <div
        ref={scrollRef}
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700 max-h-32 overflow-y-auto px-4 pb-3"
      >
        <div className="space-y-2">
          {messages.map((msg) => {
            const isUser = msg.from?.isLocal;
            return (
              <div
                key={msg.id}
                className={cn('flex gap-2 text-sm', isUser ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-1.5',
                    isUser ? 'bg-blue-600/20 text-blue-200' : 'bg-zinc-700/50 text-zinc-300'
                  )}
                >
                  <span className="text-[10px] font-medium tracking-wide uppercase opacity-60">
                    {isUser ? 'You' : 'Coach'}
                  </span>
                  <p className="mt-0.5 leading-snug">{msg.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
