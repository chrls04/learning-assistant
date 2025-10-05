import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function SetupPage() {
  const [education, setEducation] = useState("");
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/personalities");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      

      <h1 className="text-5xl font-bold mb-12 text-black z-10">Setup Your Study Buddy</h1>

      <div className="flex flex-col items-center w-full max-w-md z-10 space-y-6">
        {/* space-y-6 adds uniform vertical spacing of 1.5rem between all children */}
        <input
          type="text"
          placeholder="Education"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Grade/Year (Optional)"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
        <input
          type="text"
          placeholder=" Main Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-lg hover:bg-gray-800"
        >
          Next
        </button>
      </div>
    </div>
  );
}
