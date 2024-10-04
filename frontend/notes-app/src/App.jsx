import React from 'react'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import {Signup} from './pages/Signup'


const App = () => {
  return (
    
  <Router>
    <div>
      <Routes>
        <Route path="/dashboard"  element={< Home/>} />
        <Route path="/login"  element={< Login/>} />
        <Route path="/signup"  element={< Signup/>} />
      </Routes>
    </div>
  </Router>

  )
}

export default App