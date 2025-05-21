import { useState, useEffect } from 'react';
import { 
  getAllMaintenanceItems, 
  getAvailableMaintenanceItems,
  getPendingItems,
  getAllSites, 
  getAllMaintenanceRecords,
  searchMaintenanceRecords,
  addMaintenanceRecord,
  updateMaintenanceRecord,
  requestNotificationPermission
} from '../services/dataService';
import Modal from './Modal';

function MaintenanceRecords() {
  const [sites, setSites] = useState([]);
  const [items, setItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [observation, setObservation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [selectedPendingItems, setSelectedPendingItems] = useState([]);
  const [additionalObservation, setAdditionalObservation] = useState('');

  useEffect(() => {
    setSites(getAllSites());
    setItems(getAllMaintenanceItems());
    setRecords(getAllMaintenanceRecords());
    requestNotificationPermission();
  }, []);

  // Update available items when site is selected
  useEffect(() => {
    if (selectedSite) {
      setItems(getAvailableMaintenanceItems(selectedSite));
      setSelectedItems([]); // Reset selected items when site changes
    } else {
      setItems(getAllMaintenanceItems());
    }
  }, [selectedSite]);

  // Update records when search term changes
  useEffect(() => {
    if (searchTerm) {
      setRecords(searchMaintenanceRecords(searchTerm));
    } else {
      setRecords(getAllMaintenanceRecords());
    }
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSite || selectedItems.length === 0) return;

    const newRecord = {
      siteId: selectedSite,
      items: selectedItems,
      observation: observation.trim(),
    };

    const updatedRecords = addMaintenanceRecord(newRecord);
    setRecords(updatedRecords);
    setShowNewModal(false);
    setItems(getAvailableMaintenanceItems(selectedSite));
    setSelectedItems([]);
    setObservation('');
  };

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handlePendingItemToggle = (itemId) => {
    setSelectedPendingItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleRecordClick = (record) => {
    setSelectedRecord(record);
    const pending = getPendingItems(record.siteId, record.date);
    setPendingItems(pending);
    setSelectedPendingItems([]);
    setAdditionalObservation('');
    setShowViewModal(true);
  };

  const handleUpdateRecord = () => {
    if (selectedPendingItems.length === 0) {
      setShowViewModal(false);
      return;
    }

    const updatedRecords = updateMaintenanceRecord(
      selectedRecord.id,
      selectedPendingItems,
      additionalObservation.trim() || undefined
    );

    setRecords(updatedRecords);
    setShowViewModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Group records by month and year
  const groupedRecords = records.reduce((groups, record) => {
    const monthYear = getMonthYear(record.date);
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(record);
    return groups;
  }, {});

  return (
    <div className="maintenance-records">
      <div className="actions-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar mantenimientos..."
          />
        </div>
        <button className="add-button" onClick={() => setShowNewModal(true)}>
          <i className="fas fa-plus"></i>
          Nuevo Mantenimiento
        </button>
      </div>

      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Nuevo Mantenimiento"
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>
              <i className="fas fa-building"></i> Sitio
            </label>
            <select 
              value={selectedSite} 
              onChange={(e) => setSelectedSite(e.target.value)}
              required
            >
              <option value="">Seleccione un sitio</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-list-check"></i> Items de mantenimiento disponibles
            </label>
            <div className="items-checklist">
              {items.map(item => (
                <label key={item.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleItemToggle(item.id)}
                  />
                  <span>{item.name}</span>
                </label>
              ))}
              {items.length === 0 && selectedSite && (
                <div className="empty-state">
                  <i className="fas fa-check-circle"></i>
                  <p>Todos los items han sido completados este mes</p>
                </div>
              )}
              {items.length === 0 && !selectedSite && (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No hay items registrados</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-comment"></i> Observaciones
            </label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Agregar observaciones..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={() => setShowNewModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="submit-button" disabled={items.length === 0}>
              <i className="fas fa-save"></i>
              Registrar Mantenimiento
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalles del Mantenimiento"
      >
        {selectedRecord && (
          <div className="record-details">
            <div className="record-header">
              <h4>
                <i className="fas fa-building"></i>
                {sites.find(s => s.id == selectedRecord.siteId)?.name}
              </h4>
              <p className="date">
                <i className="fas fa-calendar"></i>
                {formatDate(selectedRecord.date)}
              </p>
            </div>

            <div className="items-section">
              <h5>
                <i className="fas fa-check-circle"></i>
                Items Completados
              </h5>
              <ul className="items-list">
                {getAllMaintenanceItems()
                  .filter(item => selectedRecord.items.includes(item.id))
                  .map(item => (
                    <li key={item.id}>
                      <i className="fas fa-check"></i>
                      {item.name}
                    </li>
                  ))}
              </ul>
            </div>

            {selectedRecord.observation && (
              <div className="observation">
                <h5>
                  <i className="fas fa-comment"></i>
                  Observación
                </h5>
                <p>{selectedRecord.observation}</p>
              </div>
            )}

            {pendingItems.length > 0 && (
              <>
                <div className="items-section">
                  <h5>
                    <i className="fas fa-clock"></i>
                    Items Pendientes
                  </h5>
                  <div className="items-checklist">
                    {pendingItems.map(item => (
                      <label key={item.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedPendingItems.includes(item.id)}
                          onChange={() => handlePendingItemToggle(item.id)}
                        />
                        <span>{item.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedPendingItems.length > 0 && (
                  <div className="form-group">
                    <label>
                      <i className="fas fa-comment"></i> Observación Adicional
                    </label>
                    <textarea
                      value={additionalObservation}
                      onChange={(e) => setAdditionalObservation(e.target.value)}
                      placeholder="Agregar observaciones..."
                    />
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="cancel-button" onClick={() => setShowViewModal(false)}>
                    Cerrar
                  </button>
                  <button 
                    type="button" 
                    className="submit-button"
                    onClick={handleUpdateRecord}
                    disabled={selectedPendingItems.length === 0}
                  >
                    <i className="fas fa-save"></i>
                    Actualizar Mantenimiento
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <div className="records-list">
        {Object.entries(groupedRecords).map(([monthYear, monthRecords]) => (
          <div key={monthYear} className="month-group">
            <h4 className="month-title">
              <i className="fas fa-calendar"></i>
              {monthYear}
            </h4>
            {monthRecords.map(record => {
              const site = sites.find(s => s.id == record.siteId);
              const recordItems = getAllMaintenanceItems().filter(item => record.items.includes(item.id));
              return (
                <div 
                  key={record.id} 
                  className="record-card clickable"
                  onClick={() => handleRecordClick(record)}
                >
                  <div className="record-header">
                    <h4>
                      <i className="fas fa-building"></i>
                      {site?.name}
                    </h4>
                    <p className="date">
                      <i className="fas fa-clock"></i>
                      {formatDate(record.date)}
                    </p>
                  </div>
                  <div className="record-items">
                    <h5>
                      <i className="fas fa-clipboard-check"></i>
                      Items Realizados ({recordItems.length} / {items.length})
                    </h5>
                    <ul>
                      {recordItems.map(item => {
                        console.log(item);
                        return(
                          <li key={item.id}>
                            <i className="fas fa-check"></i>
                            {item.name}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                  {record.observation && (
                    <div className="observation">
                      <h5>
                        <i className="fas fa-comment"></i>
                        Observación
                      </h5>
                      <p>{record.observation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {records.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>No hay registros de mantenimiento</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaintenanceRecords; 