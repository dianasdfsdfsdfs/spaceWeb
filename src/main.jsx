import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// NOTE: no React.StrictMode — it double-mounts components in dev, which makes
// the WebGL canvas initialise twice and causes flicker / context churn.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
