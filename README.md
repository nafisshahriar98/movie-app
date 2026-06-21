# 🎬 Movie Discovery App

  A full-stack movie discovery web application built with React and .NET. Users can search for movies, watch trailers,
  save favorites, and manage their account — all powered by the TMDB API.

  ---

  ## Features

  - Browse popular movies on the homepage
  - Live search with debounced autocomplete (top 5 suggestions)
  - Movie detail page with full info
  - YouTube trailer playback in a modal
  - Add/remove movies to a personal Favorites list
  - User registration and login with persistent sessions
  - Dark / Light theme toggle
  - Fully responsive design

  ---

  ## Tech Stack

  **Frontend**
  - React 19 (Vite)
  - React Router v7
  - React Player
  - Context API (state management)
  - Vanilla CSS with CSS variables

  **Backend**
  - .NET 10 / ASP.NET Core
  - MongoDB
  - JWT Bearer Authentication
  - BCrypt password hashing

  **External API**
  - [TMDB (The Movie Database)](https://www.themoviedb.org/)

  ---

  ## Getting Started

  ### Prerequisites
  - [Node.js](https://nodejs.org/) (v18+)
  - [.NET SDK 10](https://dotnet.microsoft.com/)
  - [MongoDB](https://www.mongodb.com/) (local or Atlas)
  - TMDB API key — get one free at [themoviedb.org](https://www.themoviedb.org/settings/api)

  ### 1. Clone the repository
  ```bash
  git clone https://github.com/your-username/movie-app.git
  cd movie-app
  ```

  ### 2. Frontend setup
  ```bash
  cd frontend
  npm install
  ```

  Create a `.env` file inside the `frontend/` folder:
  ```
  VITE_TMDB_API_KEY=your_tmdb_api_key_here
  ```

  Start the frontend:
  ```bash
  npm run dev
  ```

  ### 3. Backend setup

  Open `Backend/appsettings.json` and fill in your values:
  ```json
  {
    "MongoDbSettings": {
      "ConnectionString": "your_mongodb_connection_string",
      "DatabaseName": "MovieAppDb"
    },
    "JwtSettings": {
      "SecretKey": "your_jwt_secret_key",
      "Issuer": "MovieApp",
      "Audience": "MovieAppUsers"
    }
  }
  ```

  Start the backend:
  ```bash
  cd Backend
  dotnet run
  ```

  The backend runs at `https://localhost:7198` by default.

  ---

  ## Project Structure

  ```
  movie-app/
  ├── frontend/
  │   ├── src/
  │   │   ├── components/      # MovieCard, NavBar, TrailerModal
  │   │   ├── pages/           # Home, MovieDetail, Login, Register, Favorites
  │   │   ├── contexts/        # MovieContext, AuthContext, ThemeContext
  │   │   ├── services/        # TMDB API calls, Auth API calls
  │   │   └── css/             # Component stylesheets
  │   └── vite.config.js
  │
  └── Backend/
      ├── Controllers/          # AuthController
      ├── Services/             # AuthService, JwtService, MongoDbService
      ├── Models/               # User entity, DTOs
      └── Program.cs
  ```

  ---

  ## Environment Variables

  | Variable | Location | Description |
  |---|---|---|
  | `VITE_TMDB_API_KEY` | `frontend/.env` | Your TMDB API key |
  | `MongoDbSettings:ConnectionString` | `appsettings.json` | MongoDB connection |
  | `JwtSettings:SecretKey` | `appsettings.json` | JWT signing secret |

  > Never commit `.env` or secrets to GitHub. Add `.env` to your `.gitignore`.

  ---

  ## Future Improvements

  - Pagination for search results
  - Movie categories / genre filtering
  - User profile page
  - Store favorites in the database instead of localStorage
  - Next.js version (in progress)

  ---

  ## License

  This project is open source and available under the [MIT License](LICENSE).
