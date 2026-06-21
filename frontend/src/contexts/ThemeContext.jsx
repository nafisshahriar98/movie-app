import { createContext, useState, useContext, useEffect } from "react";
export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("dark");

    useEffect(() =>{
        document.body.classList.remove("light", "dark");
        document.body.classList.add(theme);
    },[theme]);

    const toggleTheme = () =>{
        setTheme(prev =>prev === "dark"?"light":"dark");
    };

    return (
        <ThemeContext.Provider value= {{theme,toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};
