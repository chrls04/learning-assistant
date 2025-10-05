import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import './styles/styles.css'
import './styles/otherStyle.css'
import NavBar from './components/navbar'
import ChatBox from './components/chatbox.jsx'
import SetupPage from './components/setup';
import PersonalitiesPage from './components/PersonalitiesPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <div className='wrapper'>
        <NavBar />
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/chat" element={<ChatBox/>} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/personalities" element={<PersonalitiesPage />} /> {/* new route */}
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
