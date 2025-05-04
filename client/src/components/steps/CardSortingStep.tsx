import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ValueCard from '@/components/card/ValueCard';
import DropZone from '@/components/card/DropZone';
import { LeadershipValue, SortedValues } from '@/types';
import { DndContext } from '@/hooks/use-draggable';

interface CardSortingStepProps {
  leadershipValues: LeadershipValue[];
  onComplete: (sortedValues: SortedValues) => void;
}

const CardSortingStep = ({ leadershipValues, onComplete }: CardSortingStepProps) => {
  const [sortedValues, setSortedValues] = useState<SortedValues>(() => {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem('sortedValues');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Validate that we have all required categories
        if (parsed['card-pile'] && parsed['definitely-me'] && 
            parsed['mostly-me'] && parsed['not-me']) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing saved state:', e);
      }
    }
    // Return initial state if no saved state exists or is invalid
    return {
      'card-pile': [...leadershipValues],
      'definitely-me': [],
      'mostly-me': [],
      'not-me': []
    };
  });

  const handleDragEnd = (result: { active: string; over: string | null }) => {
    if (!result.over) return;

    const cardId = parseInt(result.active);
    const sourceContainer = Object.keys(sortedValues).find(
      key => sortedValues[key as keyof SortedValues].some(card => card.id === cardId)
    ) as keyof SortedValues;

    // If the card is already in the target container, do nothing
    if (sourceContainer === result.over) return;

    const cardIndex = sortedValues[sourceContainer].findIndex(card => card.id === cardId);
    const card = sortedValues[sourceContainer][cardIndex];

    // Create new state with card moved to target container
    const newSortedValues = { ...sortedValues };
    newSortedValues[sourceContainer] = newSortedValues[sourceContainer].filter(
      (_, idx) => idx !== cardIndex
    );
    newSortedValues[result.over as keyof SortedValues] = [
      ...newSortedValues[result.over as keyof SortedValues],
      card
    ];

    setSortedValues(newSortedValues);
    // Reset next steps data when sorting changes
    localStorage.removeItem('selectedTopValues');
    localStorage.removeItem('coreValues');
    localStorage.setItem('sortedValues', JSON.stringify(newSortedValues));
  };

  const isAllCardsSorted = sortedValues['card-pile'].length === 0;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-primary mb-2">Sort Your Leadership Value Cards</h2>
          <p className="text-muted-foreground">Drag each card into one of the three categories based on how well it describes you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Card Pile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 h-full">
              <h3 className="font-medium text-primary mb-4 text-center">
                Remaining Cards: <span className="font-semibold text-blue-500">{sortedValues['card-pile'].length}</span>
              </h3>
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto p-2">
                {sortedValues['card-pile'].map(card => (
                  <ValueCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          </div>

          {/* Buckets */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              <DropZone 
                id="definitely-me" 
                title="Definitely Me" 
                subtitle="This is exactly who I am"
                count={sortedValues['definitely-me'].length}
                className="h-[450px] sm:h-[500px]"
                colorScheme="green"
              >
                {sortedValues['definitely-me'].map(card => (
                  <ValueCard key={card.id} card={card} />
                ))}
              </DropZone>

              <DropZone 
                id="mostly-me" 
                title="Mostly Me" 
                subtitle="This somewhat describes me"
                count={sortedValues['mostly-me'].length}
                className="h-[450px] sm:h-[500px]"
                colorScheme="blue"
              >
                {sortedValues['mostly-me'].map(card => (
                  <ValueCard key={card.id} card={card} />
                ))}
              </DropZone>

              <DropZone 
                id="not-me" 
                title="Not Me" 
                subtitle="This doesn't describe me"
                count={sortedValues['not-me'].length}
                className="h-[450px] sm:h-[500px]"
                colorScheme="red"
              >
                {sortedValues['not-me'].map(card => (
                  <ValueCard key={card.id} card={card} />
                ))}
              </DropZone>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            disabled={!isAllCardsSorted} 
            onClick={() => onComplete(sortedValues)}
            className="px-6 bg-blue-600 hover:bg-blue-500"
          >
            Continue to Top 10 Selection
          </Button>
        </div>
      </div>
    </DndContext>
  );
};

export default CardSortingStep;