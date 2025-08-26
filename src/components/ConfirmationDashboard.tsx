import React from 'react';

interface ConfirmationDashboardProps {
  serviceName: string;
  amount: number;
  onContinue: () => void;
}

const ConfirmationDashboard: React.FC<ConfirmationDashboardProps> = ({ serviceName, amount, onContinue }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-kiit-green">Payment Successful!</h2>
        <p className="mb-2">You have purchased <span className="font-semibold">{serviceName}</span> for <span className="font-semibold">₹{amount}</span>.</p>
        <p className="mb-6">Click below to access your service.</p>
        <button
          className="bg-kiit-green text-white px-6 py-2 rounded hover:bg-kiit-green-dark"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ConfirmationDashboard;
