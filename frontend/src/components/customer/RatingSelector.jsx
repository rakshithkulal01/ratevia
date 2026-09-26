import React from 'react';
import { Card } from '../ui/Card';
import { Star } from 'lucide-react';

const STAR_LABELS = {
  1: '1 star — Very poor',
  2: '2 stars — Poor',
  3: '3 stars — Okay',
  4: '4 stars — Good',
  5: '5 stars — Excellent',
};

export const RatingSelector = ({ rating, hoverRating, onSelectRating, onHoverRating }) => {
  const activeRating = hoverRating || rating;

  return (
    <Card className="p-6 text-center space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          How was your experience today?
        </h2>
        <p className="text-xs text-muted-foreground">
          Select your honest rating to help us serve you better
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
        {[1, 2, 3, 4, 5].map((starVal) => {
          const isFilled = (hoverRating || rating) >= starVal;
          return (
            <button
              key={starVal}
              type="button"
              onClick={() => onSelectRating(starVal)}
              onMouseEnter={() => onHoverRating(starVal)}
              onMouseLeave={() => onHoverRating(0)}
              className="p-1 sm:p-2 rounded-md hover:bg-muted transition-transform active:scale-95 focus:outline-none"
              aria-label={`${starVal} Star`}
            >
              <Star
                className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : 'text-border hover:text-amber-200'
                }`}
              />
            </button>
          );
        })}
      </div>

      <p className="text-xs font-mono font-medium h-4 text-muted-foreground transition-all">
        {activeRating > 0 ? STAR_LABELS[activeRating] : 'Tap a star to begin'}
      </p>
    </Card>
  );
};

export default RatingSelector;
