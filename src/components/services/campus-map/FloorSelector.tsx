import { Button } from '@/components/ui/button';

interface FloorSelectorProps {
  floors: string[];
  selectedFloor: string;
  onFloorChange: (floor: string) => void;
}

export const FloorSelector = ({ floors, selectedFloor, onFloorChange }: FloorSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {floors.map((floor) => (
        <Button
          key={floor}
          variant={selectedFloor === floor ? 'default' : 'outline'}
          onClick={() => onFloorChange(floor)}
          className="min-w-[120px]"
        >
          {floor} Floor
        </Button>
      ))}
    </div>
  );
};
