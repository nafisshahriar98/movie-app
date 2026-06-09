"use client";

import { MovieProvider } from "../contexts/MovieContext";

export default function Providers({ children }) {
    return <MovieProvider>{children}</MovieProvider>;
}
