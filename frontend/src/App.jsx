import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import GeneratePage from './pages/generate/GeneratePage';
import NavBar from './pages/components/NavBar';
import DashbordPage from './pages/dashboard/DashbordPage';

function App() {

  return (
    <Routes>
      <Route element={<NavBar/>}>
        <Route path="/" element={<HomePage/>} />
        <Route path="/generate" element={<GeneratePage/>}/>
        <Route path="/dashboard" element={<DashbordPage/>}/>
      </Route>
    </Routes>
  )
}

export default App
