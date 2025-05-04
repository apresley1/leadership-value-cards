import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import ValueCard from '@/components/card/ValueCard';
import DropZone from '@/components/card/DropZone';
import { LeadershipValue, SelectedValues } from '@/types';
import { DndContext } from '@/hooks/use-draggable';

interface CoreValuesStepProps {
  selectedValues: SelectedValues;
  onComplete: (coreValues: SelectedValues) => void;
  onBack: () => void;
}

const CoreValuesStep = ({ selectedValues, onComplete, onBack }: CoreValuesStepProps) => {
  const [coreValues, setCoreValues] = useState<SelectedValues>(() => {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem('coreValues');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Validate that we have all required categories
        if (parsed.available && parsed.selected && parsed.core) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing saved core values state:', e);
      }
    }
    // Return initial state if no saved state exists or is invalid
    return {
      available: selectedValues.selected,
      selected: [],
      core: []
    };
  });

  // Save state whenever it changes
  useEffect(() => {
    localStorage.setItem('coreValues', JSON.stringify(coreValues));
  }, [coreValues]);

  const handleDragEnd = (result: { active: string; over: string | null }) => {
    if (!result.over) return;
    
    const cardId = parseInt(result.active);

    // Determine source container
    const sourceContainer = coreValues.available.some(card => card.id === cardId) 
      ? 'available' 
      : 'core';
    
    // If card is already in target container, do nothing
    if (sourceContainer === result.over) return;

    // If target is 'core' and it already has 5 cards, do nothing
    if (result.over === 'core' && coreValues.core.length >= 5) return;
    
    const cardIndex = coreValues[sourceContainer].findIndex(card => card.id === cardId);
    const card = coreValues[sourceContainer][cardIndex];
    
    // Move card to new container
    const newCoreValues = { ...coreValues };
    newCoreValues[sourceContainer] = coreValues[sourceContainer].filter(
      (_, idx) => idx !== cardIndex
    );
    newCoreValues[result.over as keyof SelectedValues] = [
      ...coreValues[result.over as keyof SelectedValues],
      card
    ];
    
    setCoreValues(newCoreValues);
  };

  const isExactlyFiveSelected = coreValues.core.length === 5;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-primary mb-2">Select Your Top 5 Core Values</h2>
          <p className="text-muted-foreground">From your top 10 values, select the 5 that are most important to you as a leader.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 10 Values */}
          <div>
            <h3 className="font-medium text-primary mb-3">Your Top 10 Values</h3>
            <DropZone
              id="available"
              title="Your Top 10 Values"
              subtitle="Drag from here to your core values"
              count={coreValues.available.length}
              className="h-[450px] sm:h-[570px]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coreValues.available.map(card => (
                  <ValueCard key={card.id} card={card} />
                ))}
              </div>
            </DropZone>
          </div>

          {/* Core Values */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-primary">My Top 5 Core Values</h3>
              <span className="text-sm font-medium text-blue-600">
                {coreValues.core.length}/5 selected
              </span>
            </div>
            <DropZone
              id="core"
              title="My Top 5 Core Values"
              subtitle="These define you as a leader"
              count={coreValues.core.length}
              maxItems={5}
              className="h-[450px] sm:h-[570px] border-blue-200"
              colorScheme="blue"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coreValues.core.map(card => (
                  <ValueCard key={card.id} card={card} />
                ))}
              </div>
            </DropZone>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="px-6"
          >
            Back to Top 10 Selection
          </Button>
          <Button 
            disabled={!isExactlyFiveSelected} 
            onClick={() => onComplete(coreValues)}
            className="px-6 bg-blue-600 hover:bg-blue-500"
          >
            Complete Selection
          </Button>
        </div>
      </div>
    </DndContext>
  );
};

export default CoreValuesStep;
