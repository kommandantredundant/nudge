import React, { useState, useEffect } from 'react';
import { Plus, Settings, WifiOff, RefreshCw, X, AlertCircle, AlertTriangle, Upload } from 'lucide-react';
import useAPI from './hooks/useAPI';
import useTheme from './hooks/useTheme';
import useNotifications from './hooks/useNotifications';
import useContacts from './hooks/useContacts';
import ContactForm from './components/ContactForm';
import ContactList from './components/ContactList';
import FilterBar from './components/FilterBar';
import SettingsPanel from './components/SettingsPanel';
import CircleManager from './components/CircleManager';
import ImportContacts from './components/ImportContacts';
import {
  DEFAULT_CIRCLES,
  DEFAULT_SETTINGS,
  filterContacts,
  getOverdueContacts,
  getBirthdayContacts
} from './utils/constants';

const ThreadApp = () => {
  const api = useAPI();
  const theme = useTheme(DEFAULT_SETTINGS.theme);
  const notifications = useNotifications();
  const contactsHook = useContacts([]);

  const [circles, setCircles] = useState(DEFAULT_CIRCLES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCircleManager, setShowCircleManager] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCircle, setFilterCircle] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredContacts = filterContacts(contactsHook.contacts, searchQuery, filterCircle, filterStatus, circles);
  const birthdayContacts = getBirthdayContacts(contactsHook.contacts);
  const overdueContacts = getOverdueContacts(contactsHook.contacts, circles);
  const hasActiveFilters = filterCircle !== null || filterStatus !== 'all';

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    theme.applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      notifications.checkAndNotify(settings, contactsHook.contacts, handleSaveData,
        () => getBirthdayContacts(contactsHook.contacts), () => getOverdueContacts(contactsHook.contacts, circles));
    }, 60000);
    notifications.checkAndNotify(settings, contactsHook.contacts, handleSaveData,
      () => getBirthdayContacts(contactsHook.contacts), () => getOverdueContacts(contactsHook.contacts, circles));
    return () => clearInterval(interval);
  }, [settings, contactsHook.contacts, circles]);

  useEffect(() => {
    const handleOnline = () => { api.setIsOnline(true); api.dismissError(); loadInitialData(); };
    const handleOffline = () => { api.setIsOnline(false); api.setError({ type: 'offline', message: 'No internet connection', details: 'Your changes will be saved when you are back online.', troubleshooting: ['Check your WiFi or mobile data connection', 'Make sure airplane mode is off'], severity: 'warning', canRetry: true }); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const initializeApp = async () => { notifications.checkNotificationPermission(); theme.applyTheme(settings.theme); await loadInitialData(); };
  const loadInitialData = async () => { const data = await api.loadData(); if (data) { contactsHook.updateAllContacts(data.contacts || []); setCircles(data.circles || DEFAULT_CIRCLES); setSettings(data.settings || DEFAULT_SETTINGS); } };
  const handleSaveData = async (newContacts, newCircles, newSettings) => { const result = await api.saveData({ contacts: newContacts || contactsHook.contacts, circles: newCircles || circles, settings: newSettings || settings }); if (result.success) { if (newContacts) contactsHook.updateAllContacts(newContacts); if (newCircles) setCircles(newCircles); if (newSettings) setSettings(newSettings); } return result; };
  const handleAddOrUpdateContact = (contactData) => { if (editingContact) { contactsHook.updateContact(editingContact.id, contactData); } else { contactsHook.addContact(contactData); } handleSaveData(contactsHook.contacts); setShowAddContact(false); setEditingContact(null); };
  const handleEditContact = (contact) => { setEditingContact(contact); setShowAddContact(true); setShowSettings(false); };
  const handleDeleteContact = (contactId) => { if (window.confirm('Are you sure you want to delete this contact?')) { contactsHook.deleteContact(contactId); handleSaveData(contactsHook.contacts); } };
  const handleMarkContacted = (contactId) => { contactsHook.markAsContacted(contactId); handleSaveData(contactsHook.contacts); };
  const handleCancelForm = () => { setShowAddContact(false); setEditingContact(null); };
  const handleUpdateCircle = (circleId, updates) => { const updatedCircles = circles.map(c => c.id === circleId ? { ...c, ...updates } : c); setCircles(updatedCircles); handleSaveData(contactsHook.contacts, updatedCircles); };
  const handleUpdateSettings = (newSettings) => { setSettings(newSettings); handleSaveData(contactsHook.contacts, circles, newSettings); };
  const handleClearFilters = () => { setSearchQuery(''); setFilterCircle(null); setFilterStatus('all'); };
  const handleImport = (vCardData) => { console.log('Importing vCard data:', vCardData); setShowImport(false); };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme.currentTheme === 'dark' ? 'bg-nord0' : 'bg-nord6'}`}>
      <style>{`:root{--nord0:#2E3440;--nord1:#3B4252;--nord2:#434C5E;--nord3:#4C566A;--nord4:#D8DEE9;--nord5:#E5E9F0;--nord6:#ECEFF4;--nord7:#8FBCBB;--nord8:#88C0D0;--nord9:#81A1C1;--nord10:#5E81AC;--nord11:#BF616A;--nord12:#D08770;--nord13:#EBCB8B;--nord14:#A3BE8C;--nord15:#B48EAD;}`}</style>
      <div className={`shadow-md sticky top-0 z-10 transition-colors duration-200 ${theme.currentTheme === 'dark' ? 'bg-nord1' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-nord10 to-nord8 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'#BF616A'}}><path d="M 7 9 Q 12 5, 17 9 Q 19 12, 17 15 Q 12 19, 7 15 Q 5 12, 7 9 Z" fill="none" stroke="currentColor"/><circle cx="7" cy="9" r="1.5" fill="currentColor"/><circle cx="17" cy="9" r="1.5" fill="currentColor"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>
              </div>
              <div><h1 className={`text-2xl font-bold ${theme.currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>Thread</h1><p className={`text-xs ${theme.currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>Stay connected</p></div>
            </div>
            <div className="flex gap-2 items-center">
              {!api.isOnline && <div className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2" style={{backgroundColor:theme.currentTheme==='dark'?'rgba(208,135,112,0.2)':'rgba(208,135,112,0.15)',color:'#D08770'}}><WifiOff className="w-4 h-4"/>Offline</div>}
              {birthdayContacts.length>0 && <div className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1" style={{backgroundColor:theme.currentTheme==='dark'?'rgba(180,142,173,0.2)':'rgba(180,142,173,0.15)',color:'#B48EAD'}}>🎂 {birthdayContacts.length} birthday{birthdayContacts.length>1?'s':''}</div>}
              {overdueContacts.length>0 && <div className="px-3 py-2 rounded-lg text-sm font-semibold" style={{backgroundColor:theme.currentTheme==='dark'?'rgba(191,97,106,0.2)':'rgba(191,97,106,0.15)',color:'#BF616A'}}>{overdueContacts.length} overdue</div>}
              {notifications.permission!=='granted'&&!api.error && <button onClick={notifications.requestPermission} className="px-4 py-2 rounded-lg text-sm hover:opacity-90 transition" style={{backgroundColor:'#EBCB8B',color:'#2E3440'}}>Enable Notifications</button>}
              <button onClick={()=>{setShowSettings(!showSettings);if(showSettings)setShowCircleManager(false);}} className={`p-2 rounded-lg transition ${theme.currentTheme==='dark'?'text-nord4 hover:bg-nord2':'text-nord3 hover:bg-nord5'}`}><Settings className="w-6 h-6"/></button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {api.error&&<div className={`mb-6 rounded-xl shadow-lg p-5 border-l-4 transition-all duration-200 ${api.error.severity==='error'?theme.currentTheme==='dark'?'bg-nord1 border-nord11':'bg-red-50 border-nord11':api.error.severity==='warning'?theme.currentTheme==='dark'?'bg-nord1 border-nord12':'bg-orange-50 border-nord12':theme.currentTheme==='dark'?'bg-nord1 border-nord8':'bg-blue-50 border-nord8'}`}><div className="flex items-start gap-4"><div className="flex-shrink-0 mt-1">{api.error.severity==='error'?<AlertCircle className="w-6 h-6" style={{color:'#BF616A'}}/>:api.error.severity==='warning'?<AlertTriangle className="w-6 h-6" style={{color:'#D08770'}}/>:<AlertCircle className="w-6 h-6" style={{color:'#88C0D0'}}/>}</div><div className="flex-1 min-w-0"><h3 className={`font-bold text-lg mb-1 ${theme.currentTheme==='dark'?'text-nord6':'text-nord0'}`}>{api.error.message}</h3><p className={`text-sm mb-3 ${theme.currentTheme==='dark'?'text-nord4':'text-nord3'}`}>{api.error.details}</p>{api.error.troubleshooting&&api.error.troubleshooting.length>0&&<div className={`mt-3 p-3 rounded-lg ${theme.currentTheme==='dark'?'bg-nord2':'bg-white'}`}><p className={`text-sm font-semibold mb-2 ${theme.currentTheme==='dark'?'text-nord6':'text-nord0'}`}>💡 Troubleshooting Tips:</p><ul className={`text-sm space-y-1 ${theme.currentTheme==='dark'?'text-nord4':'text-nord3'}`}>{api.error.troubleshooting.map((tip,i)=><li key={i} className="flex items-start gap-2"><span className="text-nord10 mt-0.5">•</span><span>{tip}</span></li>)}</ul></div>}<div className="flex gap-2 mt-4">{api.error.canRetry&&<button onClick={()=>loadInitialData()} className="px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 text-white" style={{backgroundColor:'#5E81AC'}}><RefreshCw className="w-4 h-4"/>Retry</button>}<button onClick={api.dismissError} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${theme.currentTheme==='dark'?'bg-nord3 text-nord6 hover:bg-nord2':'bg-nord5 text-nord0 hover:bg-nord4'}`}>Dismiss</button></div></div><button onClick={api.dismissError} className={`flex-shrink-0 p-1 rounded transition ${theme.currentTheme==='dark'?'text-nord4 hover:text-nord6':'text-nord3 hover:text-nord0'}`}><X className="w-5 h-5"/></button></div></div>}
        {api.isLoading&&!api.error&&<div className={`mb-6 rounded-xl shadow-lg p-8 transition-colors duration-200 ${theme.currentTheme==='dark'?'bg-nord1':'bg-white'}`}><div className="flex flex-col items-center justify-center gap-4"><div className="animate-spin rounded-full h-12 w-12 border-4 border-nord10 border-t-transparent"></div><p className={`text-sm ${theme.currentTheme==='dark'?'text-nord4':'text-nord3'}`}>Loading your contacts...</p></div></div>}
        {showSettings&&<SettingsPanel settings={settings} onUpdateSettings={handleUpdateSettings} onToggleCircleManager={()=>setShowCircleManager(!showCircleManager)} showCircleManager={showCircleManager} notificationPermission={notifications.permission} onRequestNotificationPermission={notifications.requestPermission} currentTheme={theme.currentTheme}/>}
        {showCircleManager&&<CircleManager circles={circles} contacts={contactsHook.contacts} onUpdateCircle={handleUpdateCircle} currentTheme={theme.currentTheme}/>}
        {showAddContact&&<ContactForm contact={editingContact} circles={circles} onSave={handleAddOrUpdateContact} onCancel={handleCancelForm} currentTheme={theme.currentTheme}/>}
        {showImport&&<ImportContacts onImport={handleImport} onCancel={()=>setShowImport(false)} currentTheme={theme.currentTheme} circles={circles}/>}
        {!showAddContact&&<div className="flex gap-3 mb-6"><button onClick={()=>{setShowAddContact(true);setEditingContact(null);setShowSettings(false);}} className="flex-1 px-6 py-4 bg-gradient-to-r from-nord10 to-nord8 text-white rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"><Plus className="w-5 h-5"/>Add New Contact</button><button onClick={()=>{setShowImport(true);setShowSettings(false);setShowAddContact(false);}} className="px-6 py-4 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg" style={{backgroundColor:'#B48EAD',color:'white'}}><Upload className="w-5 h-5"/>Import</button></div>}
        <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} filterCircle={filterCircle} onFilterCircleChange={setFilterCircle} filterStatus={filterStatus} onFilterStatusChange={setFilterStatus} showFilters={showFilters} onToggleFilters={()=>setShowFilters(!showFilters)} circles={circles} hasActiveFilters={hasActiveFilters} onClearFilters={handleClearFilters} currentTheme={theme.currentTheme}/>
        <ContactList contacts={filteredContacts} circles={circles} onEditContact={handleEditContact} onDeleteContact={handleDeleteContact} onMarkContacted={handleMarkContacted} hasFilters={hasActiveFilters||searchQuery.trim()!==''} onClearFilters={handleClearFilters} currentTheme={theme.currentTheme}/>
      </div>
    </div>
  );
};

export default ThreadApp;
