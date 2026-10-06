import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "theme";

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme() {
  if (typeof window === "undefined") return "system";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "light" || saved === "dark" || saved === "system"
    ? saved
    : "system";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    theme === "system" ? getSystemTheme() : theme
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const nextResolved = theme === "system"
        ? (media.matches ? "dark" : "light")
        : theme;

      setResolvedTheme(nextResolved);

      const root = document.documentElement;
      root.classList.toggle("dark", nextResolved === "dark");
      root.classList.toggle("theme-dark", nextResolved === "dark");
      root.classList.toggle("theme-light", nextResolved === "light");
      root.dataset.theme = nextResolved;
      root.style.colorScheme = nextResolved;
    };

    applyTheme();

    if (theme === "system") {
      media.addEventListener?.("change", applyTheme);
      return () => media.removeEventListener?.("change", applyTheme);
    }

    return undefined;
  }, [theme]);

  const setTheme = (nextTheme) => {
    const value = nextTheme === "light" || nextTheme === "dark" || nextTheme === "system"
      ? nextTheme
      : "system";

    setThemeState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  };

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
