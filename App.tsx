import React from "react";
import HomeScreen from "./src/screens/HomeScreen.tsx";
import { ThemeProvider } from "./src/context/ThemeContext.tsx";
export default function App() {
  return (
    <ThemeProvider>
      <HomeScreen />
    </ThemeProvider>
  );
}

