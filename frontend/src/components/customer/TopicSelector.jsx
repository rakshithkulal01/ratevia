import React from 'react';
import { Card } from '../ui/Card';
import { Check, ThumbsUp, MessageSquare } from 'lucide-react';

export const TopicSelector = ({ rating, categoryConfig, selectedTopics, onToggleTopic }) => {
  if (!rating || !categoryConfig) return null;

  const isPositive = rating >= 4;
  const availableTopics = isPositive
    ? categoryConfig.positiveTopics || []
    : categoryConfig.improvementTopics || [];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        {isPositive ? (
          <ThumbsUp className="h-4 w-4 text-emerald-600" />
        ) : (
          <MessageSquare className="h-4 w-4 text-amber-600" />
        )}
        <h3 className="text-sm font-semibold text-foreground">
          {isPositive ? 'What did you enjoy most?' : 'Where could we improve?'}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTopics.map((topic) => {
          const isSelected = selectedTopics.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              onClick={() => onToggleTopic(topic)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? isPositive
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
              }`}
            >
              {isSelected && <Check className="h-3 w-3 shrink-0" />}
              <span>{topic}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default TopicSelector;
