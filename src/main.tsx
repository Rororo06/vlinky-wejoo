
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add marquee animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
  
  @keyframes marquee2 {
    0% { transform: translateX(100%); }
    100% { transform: translateX(0); }
  }
  
  .animate-marquee {
    animation: marquee 25s linear infinite;
  }
  
  .animate-marquee2 {
    animation: marquee2 25s linear infinite;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
