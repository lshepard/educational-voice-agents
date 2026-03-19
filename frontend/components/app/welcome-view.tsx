'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const DEFAULT_PASSAGE = `The sun rose slowly over the mountains, painting the sky in shades of orange and pink. Birds began to sing their morning songs, welcoming the new day. A gentle breeze rustled through the leaves of the old oak tree. It was going to be a beautiful day.`;

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: (passage: string) => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [passage, setPassage] = useState(DEFAULT_PASSAGE);

  const handleStart = () => {
    onStartCall(passage);
  };

  return (
    <div ref={ref} className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-center border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Reading Coach</h1>
      </header>

      {/* Main content - two column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left side - Start button area */}
        <div className="flex w-1/2 flex-col items-center justify-center border-r border-border bg-muted/30 p-8">
          <div className="flex max-w-md flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-6 size-16 text-primary"
            >
              <path
                d="M15 24V40C15 40.7957 14.6839 41.5587 14.1213 42.1213C13.5587 42.6839 12.7956 43 12 43C11.2044 43 10.4413 42.6839 9.87868 42.1213C9.31607 41.5587 9 40.7957 9 40V24C9 23.2044 9.31607 22.4413 9.87868 21.8787C10.4413 21.3161 11.2044 21 12 21C12.7956 21 13.5587 21.3161 14.1213 21.8787C14.6839 22.4413 15 23.2044 15 24ZM22 5C21.2044 5 20.4413 5.31607 19.8787 5.87868C19.3161 6.44129 19 7.20435 19 8V56C19 56.7957 19.3161 57.5587 19.8787 58.1213C20.4413 58.6839 21.2044 59 22 59C22.7956 59 23.5587 58.6839 24.1213 58.1213C24.6839 57.5587 25 56.7957 25 56V8C25 7.20435 24.6839 6.44129 24.1213 5.87868C23.5587 5.31607 22.7956 5 22 5ZM32 13C31.2044 13 30.4413 13.3161 29.8787 13.8787C29.3161 14.4413 29 15.2044 29 16V48C29 48.7957 29.3161 49.5587 29.8787 50.1213C30.4413 50.6839 31.2044 51 32 51C32.7956 51 33.5587 50.6839 34.1213 50.1213C34.6839 49.5587 35 48.7957 35 48V16C35 15.2044 34.6839 14.4413 34.1213 13.8787C33.5587 13.3161 32.7956 13 32 13ZM42 21C41.2043 21 40.4413 21.3161 39.8787 21.8787C39.3161 22.4413 39 23.2044 39 24V40C39 40.7957 39.3161 41.5587 39.8787 42.1213C40.4413 42.6839 41.2043 43 42 43C42.7957 43 43.5587 42.6839 44.1213 42.1213C44.6839 41.5587 45 40.7957 45 40V24C45 23.2044 44.6839 22.4413 44.1213 21.8787C43.5587 21.3161 42.7957 21 42 21ZM52 17C51.2043 17 50.4413 17.3161 49.8787 17.8787C49.3161 18.4413 49 19.2044 49 20V44C49 44.7957 49.3161 45.5587 49.8787 46.1213C50.4413 46.6839 51.2043 47 52 47C52.7957 47 53.5587 46.6839 54.1213 46.1213C54.6839 45.5587 55 44.7957 55 44V20C55 19.2044 54.6839 18.4413 54.1213 17.8787C53.5587 17.3161 52.7957 17 52 17Z"
                fill="currentColor"
              />
            </svg>

            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Reading Coach
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Edit the passage on the right, then click Start to begin your reading practice session.
            </p>

            <Button
              size="lg"
              onClick={handleStart}
              className="w-48 rounded-full font-mono text-sm font-bold tracking-wider uppercase"
            >
              {startButtonText}
            </Button>
          </div>
        </div>

        {/* Right side - Passage editor */}
        <div className="flex w-1/2 flex-col bg-zinc-900 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-400">Reading Passage</span>
          </div>
          <textarea
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            placeholder="Enter the passage you want to practice reading..."
            className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-lg leading-relaxed text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
};
