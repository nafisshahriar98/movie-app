  import "./globals.css";
  import "../css/App.css";
  import Providers from "./providers";
  import NavBar from "../components/NavBar";

  export const metadata = {
      title: "Movie App",
      description: "Browse and favorite your movies",
  };

  export default function RootLayout({ children }) {
      return (
          <html lang="en">
              <body>
                  <Providers>
                      <NavBar />
                      <main className="main-content">{children}</main>
                  </Providers>
              </body>
          </html>
      );
  }