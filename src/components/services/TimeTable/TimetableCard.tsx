import React from "react";

// If you have icons, import like this:
// import { Lab, Break } from "../icons"; 
// Or use emoji fallback if not defined
const LabIcon = () => <span>🔬</span>;
const BreakIcon = () => <span>🍽️</span>;

interface Period {
  time: string;
  subject: string;
  room: string;
  faculty?: string;
}

interface TodayData {
  day: string;
  timetable: Period[];
  message?: string;
}

interface TimetableData {
  section: string;
  fullTimetable: Record<string, Period[]>;
  today: TodayData;
}

interface TimetableCardProps {
  data: TimetableData;
  view: "today" | "week";
  onViewChange: (type: "today" | "week") => void;
  onBack: () => void;
}

const TimetableCard: React.FC<TimetableCardProps> = ({
  data,
  view,
  onViewChange,
  onBack,
}) => {
  const { section, fullTimetable, today } = data || {};
  const currentSchedule = view === "today" ? today?.timetable || [] : [];
  const isTodayEmpty = today?.timetable?.length === 0;

  // ------------------ TABLE RENDER FUNCTION -------------------
  const renderTable = (schedule: Period[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 font-semibold">Time</th>
            <th className="text-left py-4 px-4 font-semibold">Subject</th>
            <th className="text-left py-4 px-4 font-semibold">Room</th>
          </tr>
        </thead>

        <tbody>
          {schedule.map((period, index) => {
            const isBreak = period.subject.toLowerCase().includes("break");
            const isLab = period.subject.toLowerCase().includes("lab");

            return (
              <tr
                key={index}
                className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${
                  isBreak ? "bg-secondary/20" : ""
                }`}
              >
                <td className="py-4 px-4 font-medium text-primary">
                  {period.time}
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {isLab && <LabIcon />}
                    {isBreak && <BreakIcon />}
                    <span
                      className={`font-medium ${
                        isBreak ? "text-muted-foreground italic" : ""
                      }`}
                    >
                      {period.subject}
                    </span>
                  </div>
                </td>

                <td className="py-4 px-4 text-muted-foreground">
                  {period.room || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ------------------ NO CLASS TODAY -------------------
  if (view === "today" && isTodayEmpty) {
    return (
      <div className="glass-card rounded-3xl p-10 w-full max-w-4xl animate-scale-in">
        <div className="text-center">
          <div className="text-6xl mb-6">🎉</div>

          <h2 className="text-4xl font-bold mb-2">
            {today?.message || "No Classes Today!"}
          </h2>

          <p className="text-lg text-muted-foreground mb-6">
            Section: <span className="font-semibold">{section}</span>
          </p>

          <button onClick={onBack} className="glass-button px-6 py-3 rounded-xl">
            ← Back to Home
          </button>

          <button
            onClick={() => onViewChange("week")}
            className="block mx-auto mt-4 px-4 py-2 rounded-lg bg-secondary/40 hover:bg-secondary/60"
          >
            Weekly 📅
          </button>
        </div>
      </div>
    );
  }

  // ------------------ MAIN CARD -------------------
  return (
    <div className="glass-card rounded-3xl p-6 md:p-10 w-full max-w-6xl animate-scale-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <button
          onClick={onBack}
          className="glass-button px-4 py-2 rounded-lg text-sm hover:scale-105"
        >
          ← Back
        </button>

        <div className="text-center flex-1">
          <h2 className="text-4xl font-bold">
            {view === "today" ? `${today?.day}'s Schedule` : "Weekly Schedule"}
          </h2>
          <p className="text-lg text-muted-foreground">
            Section: <span className="font-semibold">{section}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => onViewChange("today")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              view === "today"
                ? "glass-button scale-105"
                : "bg-secondary/40 hover:bg-secondary/60"
            }`}
          >
            Today ⏰
          </button>

          <button
            onClick={() => onViewChange("week")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              view === "week"
                ? "glass-button scale-105"
                : "bg-secondary/40 hover:bg-secondary/60"
            }`}
          >
            Weekly 📅
          </button>
        </div>
      </div>

      {/* BODY */}
      {view === "today" ? (
        renderTable(currentSchedule)
      ) : (
        <div className="space-y-6">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => {
            const daySchedule = fullTimetable?.[day] || [];
            return (
              <div key={day} className="glass-card p-4 rounded-xl">
                <h3 className="font-bold text-xl mb-3">{day}</h3>
                {daySchedule.length > 0 ? (
                  renderTable(daySchedule)
                ) : (
                  <p className="text-muted-foreground">No classes</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimetableCard;
