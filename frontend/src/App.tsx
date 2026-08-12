import Login from './pages/Login'
import { BrowserRouter, Routes, Route } from 'react-router'
import Dashboard from './pages/Dashboard'
import Statistics from './pages/Statistics'
import TopArtists from './pages/TopArtists'
import TopTracks from './pages/TopTracks'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/top-artists" element={<TopArtists />} />
        <Route path="/top-tracks" element={<TopTracks />} />
        <Route path="/stats" element={<Statistics />} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
