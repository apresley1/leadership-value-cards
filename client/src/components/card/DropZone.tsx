import { ReactNode } from 'react';
import { useDroppable } from '@/hooks/use-draggable';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  id: string;
  children: ReactNode;
  title: string;
  subtitle?: string;
  count?: number;
  className?: string;
  maxItems?: number;
  colorScheme?: 'green' | 'blue' | 'red' | 'neutral';
}

const DropZone = ({ 
  id, 
  children, 
  title, 
  subtitle, 
  count, 
  className,
  maxItems,
  colorScheme = 'neutral'
}: DropZoneProps) => {
  const { isOver, setNodeRef } = useDroppable(id);

  const getBgColor = () => {
    switch(colorScheme) {
      case 'green': return 'bg-green-50 text-green-700';
      case 'blue': return 'bg-blue-50 text-blue-700';
      case 'red': return 'bg-red-50 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSubtitleColor = () => {
    switch(colorScheme) {
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'red': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "drop-zone bg-white border-2 border-muted rounded-lg p-4 flex flex-col",
        isOver && "border-blue-300 bg-blue-50/30",
        className
      )}
    >
      <div className={cn("text-center py-2 px-3 rounded-md mb-3", getBgColor())}>
        <h3 className="font-medium">{title}</h3>
        {subtitle && <p className={cn("text-xs mt-1", getSubtitleColor())}>{subtitle}</p>}
      </div>
      <div className="flex-grow overflow-y-auto space-y-3">
        {children}
      </div>
      <div className="mt-2 text-xs text-center text-muted-foreground">
        {count !== undefined && (
          <>
            <span>{count}</span>
            {maxItems !== undefined && <span> / {maxItems}</span>}
            <span> cards</span>
          </>
        )}
      </div>
    </div>
  );
};

export default DropZone;
