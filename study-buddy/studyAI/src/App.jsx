import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/navbar';
import SetupPage from './components/setup';
import PersonalitiesPage from './components/PersonalitiesPage';
import { UserProfileProvider } from './context/UserProfileContext';

function App() {
  return (
    <BrowserRouter>
      <UserProfileProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/personalities" element={<PersonalitiesPage />} />
        </Routes>
      </UserProfileProvider>
    </BrowserRouter>
  )
}

export default App