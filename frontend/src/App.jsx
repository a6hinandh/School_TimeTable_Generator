import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import GeneratePage from './pages/generate/GeneratePage';
import NavBar from './pages/components/NavBar';
import DashbordPage from './pages/dashboard/DashbordPage';
import SignUpPage from './pages/auth/SignUpPage';
import LoginPage from './pages/auth/LoginPage';
import AddTeacher from './pages/generate/AddTeacher';
import TimetableDisplay from './pages/generate/TimetableDisplay'; // ✅ import it

function App() {
  return (
    <Routes>
      <Route element={<NavBar />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/generate/add-teachers" element={<AddTeacher />} />
        <Route path="/dashboard" element={<DashbordPage />} />
        <Route path="/display/:id" element={<TimetableDisplay />} /> {/* ✅ added */}
      </Route>
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
