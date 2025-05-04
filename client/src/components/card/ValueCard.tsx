import { useDraggable } from '@/hooks/use-draggable';
import { LeadershipValue } from '@/types';
import { cn } from '@/lib/utils';

interface ValueCardProps {
  card: LeadershipValue;
  dragDisabled?: boolean;
  index?: number;
  className?: string;
}

const ValueCard = ({ card, dragDisabled = false, index, className }: ValueCardProps) => {
  const { value, description } = card;
  const { isDragging, attributes, listeners, setNodeRef, style } = useDraggable(card.id.toString(), !dragDisabled);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "draggable-card bg-white border border-muted rounded-md p-3 shadow-sm",
        isDragging && "opacity-50",
        !dragDisabled && "hover:shadow-md transition-all cursor-grab",
        dragDisabled && "cursor-default",
        className
      )}
    >
      {index !== undefined && (
        <div className="w-7 h-7 mb-2 flex items-center justify-center bg-blue-500 text-white rounded-full font-medium">
          {index + 1}
        </div>
      )}
      <h4 className="font-semibold text-primary">{value}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default ValueCard;
