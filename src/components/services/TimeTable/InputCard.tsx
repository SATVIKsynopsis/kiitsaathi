import { useState } from "react";

interface InputCardProps {
  onSubmit: (rollNumber: string, view: "today" | "week") => void;
}

const InputCard: React.FC<InputCardProps> = ({ onSubmit }) => {
  const [rollNumber, setRollNumber] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState<"today" | "week">("today");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rollNumber.trim()) {
      setError("Please enter your roll number");
      return;
    }

    if (!/^\d{6,8}$/.test(rollNumber.trim())) {
      setError("Please enter a valid 6-8 digit roll number");
      return;
    }

    setError("");
    onSubmit(rollNumber.trim(), view);
  };

  return (
    <div className="glass-card rounded-3xl mt-5 p-8 md:p-12 w-full max-w-2xl float">
      <div className="text-center mb-8">
        <h1 className="text-gradient font-poppins text-4xl md:text-5xl font-bold mb-4">
          Time Table Saathi
        </h1>
        <p className="text-muted-foreground text-lg">
          Your Smart Timetable Companion
        </p>
      </div>

      {/* VIEW SELECTOR */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => setView("today")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            view === "today"
              ? "glass-button scale-105"
              : "bg-secondary/40 hover:bg-secondary/60"
          }`}
        >
          Today
        </button>

        <button
          type="button"
          onClick={() => setView("week")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            view === "week"
              ? "glass-button scale-105"
              : "bg-secondary/40 hover:bg-secondary/60"
          }`}
        >
          Weekly
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="rollNumber"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            Enter Your Roll Number
          </label>

          <input
            id="rollNumber"
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="e.g., 2305070 or 22051001"
            maxLength={8}
            className="w-full px-6 py-4 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-lg"
          />

          {error && (
            <p className="text-destructive text-sm mt-2 animate-fade-in">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="glass-button w-full py-4 rounded-xl font-poppins font-semibold text-lg text-foreground glow-green"
        >
          {view === "today"
            ? "Get Today's Timetable 📚"
            : "Get Weekly Timetable 📅"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          Try roll numbers like: 2305070, 23051001
        </p>
      </div>
    </div>
  );
};

export default InputCard;
