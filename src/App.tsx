import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataMapper } from './components/DataMapper'
import { DataLineage } from './components/DataLineage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<DataMapper />} />
          <Route path="/lineage" element={<DataLineage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
