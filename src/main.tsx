import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ExpensesProvider } from './context/ExpensesContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ExpensesProvider>
      <App />
    </ExpensesProvider>
  </React.StrictMode>,
)
