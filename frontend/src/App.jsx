
import './css/App.css'
import Favorites from './pages/Favorites';
import Home from "./pages/Home"
import { Routes, Route } from 'react-router-dom';
import { MovieProvider } from './contexts/MovieContext';
import NavBar from "./components/NavBar";
import { AuthProvider } from './contexts/AuthContext';
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ThemeProvider } from './contexts/ThemeContext';
import MovieDetail from "./pages/MovieDetail";

function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <MovieProvider>
          <NavBar />
          <main className='main-content'>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/favorites" element={<Favorites />} />
            </Routes>
          </main>
        </MovieProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
export default App
