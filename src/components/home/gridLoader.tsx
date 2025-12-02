import React from "react";
import { Loader2 } from "lucide-react";

const GridLoader: React.FC = () => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4 shadow-lg">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        <p className="text-white text-center text-sm sm:text-base font-medium">
          pls wait a moment we are verifying you
        </p>

        {/* Indeterminate progress bar */}
        <div className="w-full mt-2">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="absolute left-[-40%] top-0 h-full w-2/5 bg-gradient-to-r from-kiit-green to-campus-blue opacity-90"
              style={{ animation: "slide 1.3s cubic-bezier(.2,.7,.2,1) infinite" }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          0% { transform: translateX(0%); }
          20% { transform: translateX(100%); }
            80% { transform: translateX(180%); }
          100% { transform: translateX(280%); }
        }
      `}</style>
    </div>
  );
};

export default GridLoader;