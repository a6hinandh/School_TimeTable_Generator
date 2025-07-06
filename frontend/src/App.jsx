import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import GeneratePage from './pages/generate/GeneratePage';
import NavBar from './pages/components/NavBar';

function App() {

  return (
    <Routes>
      <Route element={<NavBar/>}>
        <Route path="/" element={<HomePage/>} />
        <Route path="/generate" element={<GeneratePage/>}/>
      </Route>
    </Routes>
  )
}

export default App
