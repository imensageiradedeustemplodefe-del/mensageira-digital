import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider'
import { SplashScreen } from './components/SplashScreen'

const Root = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return <App />;
};

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="church-theme">
    <Root />
  </ThemeProvider>
);
