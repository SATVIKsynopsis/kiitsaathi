import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, User, Sparkles } from 'lucide-react';
import { DemoName } from '@/hooks/useSeniorConnect';

interface DemoNameSelectorProps {
  demoNames: DemoName[];
  onSelect: (name: string) => void;
  isLoading?: boolean;
}

const categoryColors = {
  tech: 'bg-blue-100 text-blue-800',
  bio: 'bg-green-100 text-green-800',
  math: 'bg-purple-100 text-purple-800',
  chemistry: 'bg-orange-100 text-orange-800',
  physics: 'bg-red-100 text-red-800',
  general: 'bg-gray-100 text-gray-800'
};

export function DemoNameSelector({ demoNames, onSelect, isLoading = false }: DemoNameSelectorProps) {
  const [selectedName, setSelectedName] = useState<string>('');

  const getRandomName = () => {
    if (demoNames.length === 0) return;
    const randomIndex = Math.floor(Math.random() * demoNames.length);
    const randomName = demoNames[randomIndex];
    setSelectedName(randomName.name);
  };

  const handleSelect = () => {
    if (selectedName) {
      onSelect(selectedName);
    }
  };

  // Group names by category
  const groupedNames = demoNames.reduce((acc, name) => {
    if (!acc[name.category]) {
      acc[name.category] = [];
    }
    acc[name.category].push(name);
    return acc;
  }, {} as Record<string, DemoName[]>);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <User className="w-5 h-5 text-campus-blue" />
          Choose Your Demo Name
        </CardTitle>
        <CardDescription>
          Select a fun demo name to protect your privacy during chats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Random Selection */}
        <div className="text-center space-y-3">
          <Button
            variant="outline"
            onClick={getRandomName}
            disabled={isLoading || demoNames.length === 0}
            className="flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Get Random Name
          </Button>
          
          {selectedName && (
            <div className="p-3 bg-kiit-green/10 rounded-lg border border-kiit-green/20">
              <p className="text-lg font-semibold text-kiit-green">{selectedName}</p>
            </div>
          )}
        </div>

        {/* Category-wise Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Or pick from categories:
          </h3>
          
          {Object.entries(groupedNames).map(([category, names]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium capitalize">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {names.map((name) => (
                  <Button
                    key={name.id}
                    variant={selectedName === name.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedName(name.name)}
                    className="h-auto py-2 px-3"
                  >
                    <div className="flex items-center gap-2">
                      <span>{name.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${categoryColors[category as keyof typeof categoryColors] || categoryColors.general}`}
                      >
                        {category}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Confirm Selection */}
        {selectedName && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleSelect}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-kiit-green to-campus-blue text-white"
            >
              Continue as {selectedName}
            </Button>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded-lg border">
          <p className="font-medium text-yellow-800 mb-1">🔒 Privacy Protection</p>
          <p className="text-yellow-700">
            Demo names protect your identity. Never share your real name, phone number, or personal details in chats.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}