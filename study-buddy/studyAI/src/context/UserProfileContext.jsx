import { createContext, useContext, useState } from 'react';

// 1. Create the Context - this is like a "data container" that can be accessed anywhere
const UserProfileContext = createContext();

// 2. Provider Component - wraps your app and provides the data to all children
export function UserProfileProvider({ children }) {
  // Store user profile data in state
  const [profile, setProfile] = useState({
    topic: '',      // What subject the user wants to learn (e.g., "Math", "Physics")
    education: '',  // Education level (e.g., "high_school", "undergraduate")
    grade: ''       // Optional grade/year (e.g., "10", "2nd year")
  });

  // Function to update the profile (used by SetupPage)
  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  // Provide both the profile data and update function to any component that needs it
  return (
    <UserProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

// 3. Custom Hook - makes it easy to use the context in any component
export function useUserProfile() {
  const context = useContext(UserProfileContext);
  
  // Error handling: make sure the hook is used inside the Provider
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  
  return context;
}
