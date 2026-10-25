import {createRoot} from 'react-dom/client';
import '@fontsource/cairo/index.css';
import '@fontsource/cairo/arabic.css';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
