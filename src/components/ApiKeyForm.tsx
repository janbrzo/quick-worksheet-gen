
import React from 'react';

export interface ApiKeyFormProps {
  onSubmit: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSubmit, apiKey, setApiKey }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
      <h3 className="font-bold mb-2">Set OpenAI API Key</h3>
      <p className="text-sm text-gray-600 mb-3">
        Your API key is required to generate high-quality worksheets. It is only stored temporarily in your browser's memory.
      </p>
      
      <div className="flex gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={onSubmit}
          className="bg-edu-primary text-white px-4 py-2 rounded-md hover:bg-edu-dark"
        >
          Set Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyForm;
