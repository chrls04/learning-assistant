import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../context/UserProfileContext";

export default function SetupPage() {
  const { profile, updateProfile } = useUserProfile();
  const [topic, setTopic] = useState(profile.topic);
  const [education, setEducation] = useState(profile.education);
  const [grade, setGrade] = useState(profile.grade);
  const navigate = useNavigate();

  const handleNext = () => {
    updateProfile({ topic, education, grade });
    navigate("/personalities");
  };

  const isValid = topic.trim() && education;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      <h1 className="text-5xl font-bold mb-12 text-black z-10">Setup Your Study Buddy</h1>

      <div className="flex flex-col items-center w-full max-w-md z-10 space-y-6">
        <select 
          value={education} 
          onChange={(e) => setEducation(e.target.value)}
          className="w-full"
        >
          <option value="">Select Education Level</option>
          <option value="elementary">Elementary School</option>
          <option value="middle_school">Middle School</option>
          <option value="high_school">High School</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="graduate">Graduate</option>
          <option value="professional">Professional</option>
        </select>

        <input
          type="text"
          placeholder="Grade/Year (Optional)"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full"
        />

        <input
          type="text"
          placeholder="Main Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full"
        />

        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`px-6 py-3 font-semibold rounded-lg shadow-lg transition-all ${
            isValid 
              ? 'bg-black text-white hover:bg-gray-800 cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}