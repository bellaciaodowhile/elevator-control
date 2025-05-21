import { useState, useEffect } from 'react';
import { getAllSites, addSite } from '../services/dataService';

function Sites() {
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState('');

  useEffect(() => {
    setSites(getAllSites());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSite.trim()) return;

    const updatedSites = addSite({ name: newSite.trim() });
    setSites(updatedSites);
    setNewSite('');
  };

  return (
    <div className="sites">
      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-group">
          <label>Nuevo Sitio</label>
          <div className="input-with-button">
            <input
              type="text"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="Ej: Residencias Marhuanta"
              required
            />
            <button type="submit">
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </form>

      <div className="section-title">
        <i className="fas fa-building"></i>
        <h3>Sitios Registrados</h3>
      </div>

      <ul className="sites-list">
        {sites.map((site) => (
          <li key={site.id}>
            <i className="fas fa-location-dot"></i>
            <span>{site.name}</span>
          </li>
        ))}
        {sites.length === 0 && (
          <li className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>No hay sitios registrados</p>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Sites; 