import React, { useState } from 'react';
import { Download, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const ExportContacts = ({ contacts, circles, onClose, currentTheme }) => {
  const [exportFormat, setExportFormat] = useState('vcard');
  const [selectedCircles, setSelectedCircles] = useState([]);
  const [exportStatus, setExportStatus] = useState(null);
  const [includeAllData, setIncludeAllData] = useState(true);

  const getFilteredContacts = () => {
    if (selectedCircles.length === 0) {
      return contacts;
    }
    return contacts.filter(c => selectedCircles.includes(c.circleId));
  };

  const toggleCircle = (circleId) => {
    setSelectedCircles(prev => 
      prev.includes(circleId) 
        ? prev.filter(id => id !== circleId)
        : [...prev, circleId]
    );
  };

  const handleExport = () => {
    const filteredContacts = getFilteredContacts();
    
    if (filteredContacts.length === 0) {
      setExportStatus('error');
      return;
    }

    try {
      let fileContent;
      let fileName;
      let mimeType;

      if (exportFormat === 'vcard') {
        fileContent = generateVCard(filteredContacts);
        fileName = `thread-contacts-${Date.now()}.vcf`;
        mimeType = 'text/vcard';
      } else if (exportFormat === 'csv') {
        fileContent = generateCSV(filteredContacts);
        fileName = `thread-contacts-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else {
        fileContent = generateJSON(filteredContacts);
        fileName = `thread-contacts-${Date.now()}.json`;
        mimeType = 'application/json';
      }

      downloadFile(fileContent, fileName, mimeType);
      setExportStatus('success');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    }
  };

  const generateVCard = (contactList) => {
    return contactList.map(contact => {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
      
      if (contact.name) lines.push(`FN:${contact.name}`);
      if (contact.phone) lines.push(`TEL:${contact.phone}`);
      if (contact.email) lines.push(`EMAIL:${contact.email}`);
      if (contact.birthday) lines.push(`BDAY:${contact.birthday}`);
      if (includeAllData && contact.notes) lines.push(`NOTE:${contact.notes.replace(/\n/g, '\\n')}`);
      
      lines.push('END:VCARD');
      return lines.join('\r\n');
    }).join('\r\n\r\n');
  };

  const generateCSV = (contactList) => {
    const headers = ['Name', 'Phone', 'Email', 'Birthday'];
    if (includeAllData) {
      headers.push('Circle', 'Notes', 'Last Contact');
    }
    
    const rows = [headers.join(',')];
    
    contactList.forEach(contact => {
      const circle = circles.find(c => c.id === contact.circleId);
      const row = [
        escapeCSV(contact.name),
        escapeCSV(contact.phone),
        escapeCSV(contact.email),
        escapeCSV(contact.birthday)
      ];
      
      if (includeAllData) {
        row.push(
          escapeCSV(circle?.name || ''),
          escapeCSV(contact.notes),
          escapeCSV(contact.lastContact ? new Date(contact.lastContact).toLocaleDateString() : '')
        );
      }
      
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  };

  const generateJSON = (contactList) => {
    const exportData = contactList.map(contact => {
      const circle = circles.find(c => c.id === contact.circleId);
      const data = {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        birthday: contact.birthday
      };
      
      if (includeAllData) {
        data.circle = circle?.name || '';
        data.notes = contact.notes;
        data.lastContact = contact.lastContact;
      }
      
      return data;
    });
    
    return JSON.stringify(exportData, null, 2);
  };

  const escapeCSV = (value) => {
    if (!value) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredCount = getFilteredContacts().length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-2xl w-full rounded-xl shadow-2xl transition-colors duration-200 ${currentTheme === 'dark' ? 'bg-nord1' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: currentTheme === 'dark' ? 'var(--nord3)' : 'var(--nord4)' }}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
            <Download className="w-6 h-6" style={{ color: '#A3BE8C' }} />
            Export Contacts
          </h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition ${currentTheme === 'dark' ? 'text-nord4 hover:bg-nord2' : 'text-nord3 hover:bg-nord5'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Messages */}
          {exportStatus === 'success' && (
            <div className={`p-4 rounded-lg border-l-4 border-nord14 ${currentTheme === 'dark' ? 'bg-nord2' : 'bg-green-50'}`}>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-nord14" />
                <span className={`font-semibold ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
                  Contacts exported successfully!
                </span>
              </div>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className={`p-4 rounded-lg border-l-4 border-nord11 ${currentTheme === 'dark' ? 'bg-nord2' : 'bg-red-50'}`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-nord11 mt-0.5" />
                <div>
                  <span className={`font-semibold block ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
                    Export failed
                  </span>
                  <span className={`text-sm ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>
                    No contacts selected or an error occurred
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Export Format */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportFormat('vcard')}
                className={`p-4 rounded-lg border-2 transition ${
                  exportFormat === 'vcard'
                    ? 'border-nord14'
                    : currentTheme === 'dark' ? 'border-nord3 hover:border-nord14' : 'border-nord4 hover:border-nord14'
                }`}
                style={{ backgroundColor: exportFormat === 'vcard' ? 'rgba(163, 190, 140, 0.1)' : 'transparent' }}
              >
                <FileText className={`w-6 h-6 mx-auto mb-2 ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`} />
                <span className={`text-sm font-medium block ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>vCard</span>
                <span className={`text-xs ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>.vcf</span>
              </button>
              <button
                onClick={() => setExportFormat('csv')}
                className={`p-4 rounded-lg border-2 transition ${
                  exportFormat === 'csv'
                    ? 'border-nord14'
                    : currentTheme === 'dark' ? 'border-nord3 hover:border-nord14' : 'border-nord4 hover:border-nord14'
                }`}
                style={{ backgroundColor: exportFormat === 'csv' ? 'rgba(163, 190, 140, 0.1)' : 'transparent' }}
              >
                <FileText className={`w-6 h-6 mx-auto mb-2 ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`} />
                <span className={`text-sm font-medium block ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>CSV</span>
                <span className={`text-xs ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>.csv</span>
              </button>
              <button
                onClick={() => setExportFormat('json')}
                className={`p-4 rounded-lg border-2 transition ${
                  exportFormat === 'json'
                    ? 'border-nord14'
                    : currentTheme === 'dark' ? 'border-nord3 hover:border-nord14' : 'border-nord4 hover:border-nord14'
                }`}
                style={{ backgroundColor: exportFormat === 'json' ? 'rgba(163, 190, 140, 0.1)' : 'transparent' }}
              >
                <FileText className={`w-6 h-6 mx-auto mb-2 ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`} />
                <span className={`text-sm font-medium block ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>JSON</span>
                <span className={`text-xs ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>.json</span>
              </button>
            </div>
          </div>

          {/* Filter by Circle */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
              Filter by Circle (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {circles.map(circle => (
                <button
                  key={circle.id}
                  onClick={() => toggleCircle(circle.id)}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                    selectedCircles.includes(circle.id)
                      ? 'ring-2 ring-nord14'
                      : currentTheme === 'dark' ? 'bg-nord2 hover:bg-nord3' : 'bg-nord5 hover:bg-nord4'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: circle.color }}></div>
                  <span className={`text-sm ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
                    {circle.name}
                  </span>
                </button>
              ))}
            </div>
            <p className={`text-xs mt-2 ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>
              {selectedCircles.length === 0 ? 'All circles selected' : `${selectedCircles.length} circle(s) selected`}
            </p>
          </div>

          {/* Options */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAllData}
                onChange={(e) => setIncludeAllData(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#A3BE8C' }}
              />
              <span className={`text-sm ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
                Include extended data (circles, notes, last contact)
              </span>
            </label>
          </div>

          {/* Summary */}
          <div className={`p-4 rounded-lg ${currentTheme === 'dark' ? 'bg-nord2' : 'bg-nord6'}`}>
            <div className="flex items-center justify-between">
              <span className={`font-semibold ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
                Contacts to export:
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: '#A3BE8C', color: 'white' }}>
                {filteredCount}
              </span>
            </div>
            <p className={`text-xs mt-2 ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>
              {exportFormat === 'vcard' && 'vCard format is compatible with most contact apps and phones'}
              {exportFormat === 'csv' && 'CSV format can be opened in Excel, Google Sheets, and other spreadsheet apps'}
              {exportFormat === 'json' && 'JSON format is ideal for backups and programmatic access'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t" style={{ borderColor: currentTheme === 'dark' ? 'var(--nord3)' : 'var(--nord4)' }}>
          <button
            onClick={handleExport}
            disabled={filteredCount === 0}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              filteredCount === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200'
                : 'text-white hover:opacity-90'
            }`}
            style={{ backgroundColor: filteredCount > 0 ? '#A3BE8C' : undefined }}
          >
            <Download className="w-5 h-5" />
            {exportStatus === 'success' ? 'Exported!' : `Export ${filteredCount} Contact${filteredCount !== 1 ? 's' : ''}`}
          </button>
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              currentTheme === 'dark' ? 'bg-nord2 text-nord6 hover:bg-nord3' : 'bg-nord5 text-nord0 hover:bg-nord4'
            }`}
          >
            {exportStatus === 'success' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportContacts;
