import { setTheme } from "@tauri-apps/api/app";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

const ThemeContext = createContext({
  currentTheme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState("dark");
  const toggleTheme = () => {
    setCurrentTheme(currentTheme === "dark" ? "light" : "dark");
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };
  useEffect(() => {
    document.documentElement.setAttribute("dark-theme", currentTheme);
  }, [currentTheme]);
  return (
    <ThemeContext.Provider value={{ currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
