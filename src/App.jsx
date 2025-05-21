import { useState } from 'react'
import './App.css'
import MaintenanceItems from './components/MaintenanceItems'
import Sites from './components/Sites'
import MaintenanceRecords from './components/MaintenanceRecords'

function App() {
  const [activeTab, setActiveTab] = useState('items')

  return (
    <div className="container">
      <header className="header">
        <h1>
          {activeTab === 'items' && 'Items de Mantenimiento'}
          {activeTab === 'sites' && 'Sitios'}
          {activeTab === 'maintenance' && 'Mantenimientos'}
        </h1>
      </header>

      <main className="content">
        {activeTab === 'items' && <MaintenanceItems />}
        {activeTab === 'sites' && <Sites />}
        {activeTab === 'maintenance' && <MaintenanceRecords />}
      </main>

      <nav className="tabs">
        <button 
          className={`tab-button ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          <i className="fas fa-tools"></i>
          Items
        </button>
        <button 
          className={`tab-button ${activeTab === 'sites' ? 'active' : ''}`}
          onClick={() => setActiveTab('sites')}
        >
          <i className="fas fa-building"></i>
          Sitios
        </button>
        <button 
          className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <i className="fas fa-clipboard-list"></i>
          Registros
        </button>
      </nav>
    </div>
  )
}

export default App
