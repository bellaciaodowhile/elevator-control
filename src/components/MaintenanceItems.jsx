import { useState, useEffect } from 'react';
import { getAllMaintenanceItems, addMaintenanceItem } from '../services/dataService';

function MaintenanceItems() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    setItems(getAllMaintenanceItems());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const updatedItems = addMaintenanceItem({ name: newItem.trim() });
    setItems(updatedItems);
    setNewItem('');
  };

  return (
    <div className="maintenance-items">
      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-group">
          <label>Nuevo Item de Mantenimiento</label>
          <div className="input-with-button">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Ej: Limpieza de quicios"
              required
            />
            <button type="submit">
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </form>

      <div className="section-title">
        <i className="fas fa-list-check"></i>
        <h3>Items Registrados</h3>
      </div>

      <ul className="items-list">
        {items.map((item) => (
          <li key={item.id}>
            <i className="fas fa-wrench"></i>
            <span>{item.name}</span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>No hay items registrados</p>
          </li>
        )}
      </ul>
    </div>
  );
}

export default MaintenanceItems; 