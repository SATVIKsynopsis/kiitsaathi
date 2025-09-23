import { BookOpen, FileQuestion, Youtube, Users, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function TabNavigation({ activeSection, setActiveSection }: TabNavigationProps) {
  const tabs = [
    { id: "notes", label: "Notes", icon: BookOpen, color: "from-blue-500 to-blue-600" },
    { id: "pyqs", label: "PYQs", icon: FileQuestion, color: "from-green-500 to-green-600" },
    { id: "ppts", label: "PPTs", icon: Presentation, color: "from-orange-500 to-orange-600" },
    { id: "playlists", label: "Playlists", icon: Youtube, color: "from-red-500 to-red-600" },
    { id: "groups", label: "Groups", icon: Users, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="glass-card p-2 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveSection(tab.id)}
              className={`group relative flex items-center gap-3 h-14 px-6 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-kiit-primary to-kiit-secondary text-white shadow-lg transform scale-105"
                  : "hover:bg-accent/80 text-muted-foreground hover:text-foreground hover:scale-105"
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                isActive 
                  ? "bg-white/20" 
                  : "bg-gradient-to-r " + tab.color + " text-white group-hover:shadow-lg"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-kiit-primary/20 to-kiit-secondary/20 -z-10 blur-xl"></div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}