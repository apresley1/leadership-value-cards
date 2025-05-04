import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import ValueCard from '@/components/card/ValueCard';
import DropZone from '@/components/card/DropZone';
import { LeadershipValue, SelectedValues, SortedValues } from '@/types';
import { DndContext } from '@/hooks/use-draggable';

interface Top10SelectionStepProps {
  sortedValues: SortedValues;
  onComplete: (selectedValues: SelectedValues) => void;
  onBack: () => void;
}

const Top10SelectionStep = ({ sortedValues, onComplete, onBack }: Top10SelectionStepProps) => {
  // Combine definitely-me and mostly-me categories
  const availableValues = [...sortedValues['definitely-me'], ...sortedValues['mostly-me']];

  const [selectedValues, setSelectedValues] = useState<SelectedValues>(() => {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem('selectedTopValues');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Validate the saved state has required properties
        if (parsed.available && parsed.selected && parsed.core) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing saved top values state:', e);
      }
    }
    // Return initial state if no saved state exists or is invalid
    return {
      available: availableValues,
      selected: [],
      core: []
    };
  });

  // Save state whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedTopValues', JSON.stringify(selectedValues));
  }, [selectedValues]);

  const handleDragEnd = (result: { active: string; over: string | null }) => {
    if (!result.over) return;

    const cardId = parseInt(result.active);

    // Determine source container (available or selected)
    const sourceContainer = selectedValues.available.some(card => card.id === cardId) 
      ? 'available' 
      : 'selected';

    // If card is already in target container, do nothing
    if (sourceContainer === result.over) return;

    // If target is 'selected' and it already has 10 cards, do nothing
    if (result.over === 'selected' && selectedValues.selected.length >= 10) return;

    const cardIndex = selectedValues[sourceContainer].findIndex(card => card.id === cardId);
    const card = selectedValues[sourceContainer][cardIndex];

    // Move card to new container
    const newSelectedValues = { ...selectedValues };
    newSelectedValues[sourceContainer] = selectedValues[sourceContainer].filter(
      (_, idx) => idx !== cardIndex
    );
    newSelectedValues[result.over as keyof SelectedValues] = [
      ...selectedValues[result.over as keyof SelectedValues],
      card
    ];

    // Reset next step data when selection changes
    localStorage.removeItem('coreValues');

    setSelectedValues(newSelectedValues);
  };

  const isExactlyTenSelected = selectedValues.selected.length === 10;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-primary mb-2">Select Your Top 10 Values</h2>
          <p className="text-muted-foreground">From your "Definitely Me" and "Mostly Me" categories, drag 10 values that best describe you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Values */}
          <div>
            <h3 className="font-medium text-primary mb-3">Available Values</h3>
            <DropZone
              id="available"
              title="Available Values"
              subtitle="Drag from here to your selection"
              count={selectedValues.available.length}
              className="h-[450px] sm:h-[570px]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedValues.available.map(card => (
                  <ValueCard key={card.id} card={card} />
                ))}
              </div>
            </DropZone>
          </div>

          {/* Best Describes Me */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-primary">Best Describes Me</h3>
              <span className="text-sm font-medium text-blue-600">
                {selectedValues.selected.length}/10 selected
              </span>
            </div>
            <DropZone
              id="selected"
              title="Best Describes Me"
              subtitle="Your top 10 values"
              count={selectedValues.selected.length}
              maxItems={10}
              className="h-[450px] sm:h-[570px]"
              colorScheme="blue"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedValues.selected.map(card => (
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
            Back to Card Sorting
          </Button>
          <Button 
            disabled={!isExactlyTenSelected} 
            onClick={() => onComplete(selectedValues)}
            className="px-6 bg-blue-600 hover:bg-blue-500"
          >
            Continue to Core Values
          </Button>
        </div>
      </div>
    </DndContext>
  );
};

export default Top10SelectionStep;