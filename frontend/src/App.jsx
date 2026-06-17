
import './css/App.css'
import Favorites from './pages/Favorites';
import Home from "./pages/Home"
import { Routes, Route } from 'react-router-dom';
import { MovieProvider } from './contexts/MovieContext';
import NavBar from "./components/NavBar";
import { AuthProvider } from './contexts/AuthContext';
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {

  return (
    <AuthProvider>
      <MovieProvider>
        <NavBar />
        <main className='main-content'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
      </MovieProvider>
    </AuthProvider>
  );
}
export default App
