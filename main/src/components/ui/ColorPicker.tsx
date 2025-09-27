import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { THEME_COLORS } from '@/contexts/ThemeContext';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  className = '',
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="grid grid-cols-5 gap-3">
          {THEME_COLORS.map((color) => (
            <Button
              key={color.value}
              variant="outline"
              size="sm"
              className="relative h-12 w-full p-0 rounded-lg border-2 hover:scale-105 transition-transform"
              style={{
                backgroundColor: color.hex,
                borderColor: selectedColor === color.value ? 'hsl(var(--foreground))' : 'transparent',
              }}
              onClick={() => onColorSelect(color.value)}
            >
              {selectedColor === color.value && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="sr-only">{color.name}</span>
            </Button>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground text-center">
          Choose your preferred theme color
        </div>
      </CardContent>
    </Card>
  );
};
