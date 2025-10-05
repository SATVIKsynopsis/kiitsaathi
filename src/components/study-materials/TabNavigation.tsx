import { BookOpen, FileQuestion, Youtube, Users, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function TabNavigation({ activeSection, setActiveSection }: TabNavigationProps) {
  const tabs = [
    { id: "notes", label: "Notes", icon: BookOpen },
    { id: "pyqs", label: "PYQs", icon: FileQuestion },
    { id: "ppts", label: "PPTs", icon: Presentation },
    { id: "playlists", label: "Playlists", icon: Youtube },
    { id: "groups", label: "Groups", icon: Users },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeSection === tab.id ? "default" : "ghost"}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 h-12 px-6 transition-all ${
              activeSection === tab.id
                ? "bg-kiit-primary text-white shadow-md hover:bg-kiit-primary/90"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}