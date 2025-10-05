import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function SetupPage() {
  const [topic, setTopic] = useState(localStorage.getItem("sb_topic") || "");
  const [education, setEducation] = useState(localStorage.getItem("sb_education") || "");
  const [grade, setGrade] = useState(localStorage.getItem("sb_grade") || "");
  const navigate = useNavigate();

  useEffect(() => {
    // if there is existing saved profile you may want to prefill UI
    setTopic(localStorage.getItem("sb_topic") || "");
    setEducation(localStorage.getItem("sb_education") || "");
    setGrade(localStorage.getItem("sb_grade") || "");
  }, []);

  function saveProfile() {
    localStorage.setItem("sb_topic", topic);
    localStorage.setItem("sb_education", education);
    localStorage.setItem("sb_grade", grade);
    // optional: small confirmation or redirect
    alert("Saved: topic, education and grade.");
  }

  const handleNext = () => {
    navigate("/personalities");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      

      <h1 className="text-5xl font-bold mb-12 text-black z-10">Setup Your Study Buddy</h1>

      <div className="flex flex-col items-center w-full max-w-md z-10 space-y-6">
        {/* space-y-6 adds uniform vertical spacing of 1.5rem between all children */}
        <select 
          value={education} 
          onChange={(e) => setEducation(e.target.value)}
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
