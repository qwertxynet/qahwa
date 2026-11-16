import { createRoot } from 'react-dom/client';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
import '@fontsource/aref-ruqaa/400.css';
import '@fontsource/aref-ruqaa/700.css';
import '@fontsource/noto-naskh-arabic/400.css';
import '@fontsource/noto-naskh-arabic/600.css';
import '@fontsource/noto-naskh-arabic/700.css';
import './styles.css';
import './qahwa.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
