const STORAGE_KEY = 'elevator_maintenance_data';

const initialData = {
  maintenanceItems: [],
  sites: [],
  maintenanceRecords: []
};

const loadData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialData;
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getAllMaintenanceItems = () => {
  return loadData().maintenanceItems;
};

export const getPendingItems = (siteId, date) => {
  const data = loadData();
  const targetDate = new Date(date);
  
  // Get all items that have been maintained on the specified date
  const maintainedItems = new Set(
    data.maintenanceRecords
      .filter(record => {
        const recordDate = new Date(record.date);
        return record.siteId === siteId && 
               recordDate.getDate() === targetDate.getDate() &&
               recordDate.getMonth() === targetDate.getMonth() &&
               recordDate.getFullYear() === targetDate.getFullYear();
      })
      .flatMap(record => record.items)
  );

  // Return items that haven't been maintained
  return data.maintenanceItems.filter(item => !maintainedItems.has(item.id));
};

export const getAvailableMaintenanceItems = (siteId) => {
  const data = loadData();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get all maintenance records for the selected site in the current month
  const currentMonthRecords = data.maintenanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    return record.siteId === siteId && 
           recordDate.getMonth() === currentMonth &&
           recordDate.getFullYear() === currentYear;
  });

  // Get all items that have been maintained this month
  const maintainedItems = new Set(
    currentMonthRecords.flatMap(record => record.items)
  );

  // Return only items that haven't been maintained this month
  return data.maintenanceItems.filter(item => !maintainedItems.has(item.id));
};

export const addMaintenanceItem = (item) => {
  const data = loadData();
  data.maintenanceItems.push({ id: Date.now(), ...item });
  saveData(data);
  return data.maintenanceItems;
};

export const getAllSites = () => {
  return loadData().sites;
};

export const addSite = (site) => {
  const data = loadData();
  data.sites.push({ id: Date.now(), ...site });
  saveData(data);
  return data.sites;
};

export const getAllMaintenanceRecords = () => {
  return loadData().maintenanceRecords;
};

export const searchMaintenanceRecords = (query) => {
  const data = loadData();
  const searchTerm = query.toLowerCase();
  
  return data.maintenanceRecords.filter(record => {
    const site = data.sites.find(s => s.id === record.siteId);
    const items = data.maintenanceItems.filter(item => record.items.includes(item.id));
    
    // Search in site name
    if (site?.name.toLowerCase().includes(searchTerm)) return true;
    
    // Search in items
    if (items.some(item => item.name.toLowerCase().includes(searchTerm))) return true;
    
    // Search in observations
    if (record.observation?.toLowerCase().includes(searchTerm)) return true;
    
    // Search in date
    const date = new Date(record.date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toLowerCase();
    if (date.includes(searchTerm)) return true;
    
    return false;
  });
};

export const addMaintenanceRecord = (record) => {
  const data = loadData();
  const newRecord = {
    id: Date.now(),
    date: new Date().toISOString(),
    ...record
  };
  
  data.maintenanceRecords.push(newRecord);
  saveData(data);

  // Show notification
  if (Notification.permission === 'granted') {
    const site = data.sites.find(s => s.id === record.siteId);
    const items = data.maintenanceItems.filter(item => record.items.includes(item.id));
    
    new Notification('Nuevo Mantenimiento Registrado', {
      body: `Se ha registrado un nuevo mantenimiento en ${site?.name} con ${items.length} items.`,
      icon: '/vite.svg'
    });
  }

  return data.maintenanceRecords;
};

export const updateMaintenanceRecord = (recordId, newItems, observation) => {
  const data = loadData();
  const record = data.maintenanceRecords.find(r => r.id === recordId);
  
  if (record) {
    record.items = [...new Set([...record.items, ...newItems])];
    if (observation) {
      record.observation = observation;
    }
    saveData(data);
  }
  
  return data.maintenanceRecords;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}; 