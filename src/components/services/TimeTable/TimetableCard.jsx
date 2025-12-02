import React from 'react';

const TimetableCard = ({ data, view, onViewChange, onBack }) => {
  const { section, fullTimetable, today } = data || {};
  const currentSchedule = view === 'today' ? (today?.timetable || []) : [];
  const isTodayEmpty = today?.timetable?.length === 0;

  const renderTable = (schedule) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 text-foreground font-poppins font-semibold">Time</th>
            <th className="text-left py-4 px-4 text-foreground font-poppins font-semibold">Subject</th>
            <th className="text-left py-4 px-4 text-foreground font-poppins font-semibold ">Room</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((period, index) => {
            const isBreak = period.subject.toLowerCase().includes('break');
            const isLab = period.subject.toLowerCase().includes('lab');
            return (
              <tr
                key={index}
                className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${isBreak ? 'bg-secondary/20' : ''}`}
              >
                <td className="py-4 px-4">
                  <span className={`font-medium ${isBreak ? 'text-muted-foreground' : 'text-primary'}`}>
                    {period.time}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {isLab && <span className="text-lg"><Lab/></span>}
                    {isBreak && <span className="text-lg"><Break/></span>}
                    <span className={`font-medium ${isBreak ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                      {period.subject}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted-foreground md:table-cell">{period.room}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (view === 'today' && isTodayEmpty) {
    return (
      <div className="glass-card rounded-3xl p-8 md:p-12 w-full max-w-4xl animate-scale-in">
        <div className="text-center">
          <div className="mb-6 bounce-slow inline-block text-6xl">🎉</div>
          <h2 className="text-gradient font-poppins text-3xl md:text-4xl font-bold mb-4">
            {today?.message || "No Classes Today!"}
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Section: <span className="text-primary font-semibold">{section}</span>
          </p>
          <button
            onClick={onBack}
            className="glass-button px-8 py-3 rounded-xl font-poppins font-semibold"
          >
            ← Back to Home
          </button>
        </div>
        <button
            onClick={() => onViewChange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'week'
                ? 'glass-button scale-105'
                : 'bg-secondary/40 hover:bg-secondary/60'
              }`}
          >
            Weekly 📅
          </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6 md:p-10 w-full max-w-6xl animate-scale-in">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <button
          onClick={onBack}
          className="glass-button px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 hover:scale-105 transition-transform"
        >
          ← Back
        </button>
        <div className="text-center flex-1">
          <h2 className="text-gradient font-poppins text-3xl md:text-4xl font-bold mb-2">
            {view === 'today' ? `${today?.day}'s Schedule` : 'Weekly Schedule'}
          </h2>
          <p className="text-muted-foreground text-lg">
            Section: <span className="text-primary font-semibold text-xl">{section}</span>
          </p>
        </div>
        {/* Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => onViewChange('today')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'today'
                ? 'glass-button scale-105'
                : 'bg-secondary/40 hover:bg-secondary/60'
              }`}
          >
            Today ⏰
          </button>

          <button
            onClick={() => onViewChange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'week'
                ? 'glass-button scale-105'
                : 'bg-secondary/40 hover:bg-secondary/60'
              }`}
          >
            Weekly 📅
          </button>
        </div>

      </div>

      {view === 'today' ? (
        renderTable(currentSchedule)
      ) : (
        <div className="space-y-6">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
            const daySchedule = fullTimetable[day] || [];
            const hasClasses = daySchedule.length > 0;
            return (
              <div key={day} className={`glass-card rounded-xl p-4 ${!hasClasses ? 'opacity-50' : ''}`}>
                <h3 className="font-semibold text-lg mb-3">{day}</h3>
                {hasClasses ? renderTable(daySchedule) : <p className="text-muted-foreground text-sm">No classes</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile view - Additional info */}
      <div className="md:hidden mt-6 space-y-2">
        <p className="text-sm text-muted-foreground">💡 Tip: Rotate your device for more details</p>
      </div>

      {/* Summary - only for today view */}
      {view === 'today' && !isTodayEmpty && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">📚</div>
            <div className="text-sm text-muted-foreground">Total Classes</div>
            <div className="text-xl font-bold text-primary">
              {currentSchedule.filter((p) => !p.subject.toLowerCase().includes('break')).length}
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🔬</div>
            <div className="text-sm text-muted-foreground">Lab Sessions</div>
            <div className="text-xl font-bold text-primary">
              {currentSchedule.filter((p) => p.subject.toLowerCase().includes('lab')).length}
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">⏰</div>
            <div className="text-sm text-muted-foreground">First Class</div>
            <div className="text-lg font-semibold text-foreground">
              {currentSchedule[0]?.time.split('-')[0] || '-'}
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🏁</div>
            <div className="text-sm text-muted-foreground">Last Class</div>
            <div className="text-lg font-semibold text-foreground">
              {currentSchedule[currentSchedule.length - 1]?.time.split('-')[1] || '-'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableCard;