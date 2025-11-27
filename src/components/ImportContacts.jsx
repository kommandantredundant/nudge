import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

const ImportContacts = ({ onImport, onCancel, currentTheme, circles }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [previewContacts, setPreviewContacts] = useState([]);
  const [importStatus, setImportStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = ['.vcf', '.vcard', 'text/vcard', 'text/x-vcard'];
    const fileName = selectedFile.name.toLowerCase();
    const fileType = selectedFile.type;

    if (!fileName.endsWith('.vcf') && !fileName.endsWith('.vcard') && !validTypes.includes(fileType)) {
      setErrorMessage('Please select a valid vCard file (.vcf or .vcard)');
      setImportStatus('error');
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');
    setImportStatus(null);
    
    // Read and preview the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // TODO: Parse vCard - for now just show file info
        const preview = {
          fileName: selectedFile.name,
          fileSize: (selectedFile.size / 1024).toFixed(2) + ' KB',
          lastModified: new Date(selectedFile.lastModified).toLocaleDateString()
        };
        setPreviewContacts([preview]);
      } catch (error) {
        setErrorMessage('Failed to read file: ' + error.message);
        setImportStatus('error');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (!file) {
      setErrorMessage('Please select a file first');
      setImportStatus('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const vCardData = e.target.result;
        // TODO: Call vCard parser when implemented
        onImport(vCardData);
        setImportStatus('success');
      } catch (error) {
        setErrorMessage('Failed to import contacts: ' + error.message);
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+1234567890
EMAIL:john@example.com
BDAY:1990-01-15
NOTE:Close friend from college
END:VCARD

BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
TEL:+0987654321
EMAIL:jane@example.com
BDAY:1985-05-20
NOTE:Work colleague
END:VCARD`;

    const blob = new Blob([template], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`max-w-2xl w-full rounded-xl shadow-2xl transition-colors duration-200 ${
          currentTheme === 'dark' ? 'bg-nord1' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: currentTheme === 'dark' ? 'var(--nord3)' : 'var(--nord4)' }}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
            <Upload className="w-6 h-6" style={{ color: '#5E81AC' }} />
            Import Contacts
          </h2>
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition ${currentTheme === 'dark' ? 'text-nord4 hover:bg-nord2' : 'text-nord3 hover:bg-nord5'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Messages */}
          {importStatus === 'success' && (
            <div className={`p-4 rounded-lg border-l-4 border-nord14 ${currentTheme === 'dark' ? 'bg-nord2' : 'bg-green-50'}`}>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-nord14" />
                <span className={`font-semibold ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
                  Contacts imported successfully!
                </span>
              </div>
            </div>
          )}

          {importStatus === 'error' && (
            <div className={`p-4 rounded-lg border-l-4 border-nord11 ${currentTheme === 'dark' ? 'bg-nord2' : 'bg-red-50'}`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-nord11 mt-0.5" />
                <div>
                  <span className={`font-semibold block ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
                    Import failed
                  </span>
                  <span className={`text-sm ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>
                    {errorMessage}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-nord10 bg-opacity-10'
                : currentTheme === 'dark'
                ? 'border-nord3 hover:border-nord10'
                : 'border-nord4 hover:border-nord10'
            }`}
            style={{ backgroundColor: dragActive ? 'rgba(94, 129, 172, 0.1)' : 'transparent' }}
          >
            <Upload className={`w-16 h-16 mx-auto mb-4 ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`} />
            <p className={`text-lg mb-2 ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
              {dragActive ? 'Drop your vCard file here' : 'Drag & drop your vCard file here'}
            </p>
            <p className={`text-sm mb-4 ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>
              or click to browse
            </p>
            <input
              type="file"
              accept=".vcf,.vcard,text/vcard,text/x-vcard"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="inline-block px-6 py-3 rounded-lg cursor-pointer transition text-white font-semibold"
              style={{ backgroundColor: '#5E81AC' }}
            >
              Choose File
            </label>
          </div>

          {/* File Preview */}
          {file && previewContacts.length > 0 && (
            <div className={`p-4 rounded-lg ${currentTheme === 'dark' ? 'bg-nord2' : 'bg-nord6'}`}>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-nord10 mt-0.5" />
                <div className="flex-1">
                  <p className={`font-semibold ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
                    {previewContacts[0].fileName}
                  </p>
                  <p className={`text-sm ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>
                    Size: {previewContacts[0].fileSize} • Modified: {previewContacts[0].lastModified}
                  </p>
                </div>
                <button
                  onClick={() => { setFile(null); setPreviewContacts([]); setImportStatus(null); }}
                  className={`p-1 rounded transition ${currentTheme === 'dark' ? 'text-nord4 hover:text-nord6' : 'text-nord3 hover:text-nord0'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className={`p-4 rounded-lg ${currentTheme === 'dark' ? 'bg-nord2' : 'bg-nord6'}`}>
            <p className={`text-sm mb-2 ${currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'}`}>
              <strong>Supported format:</strong> vCard (.vcf or .vcard)
            </p>
            <p className={`text-sm mb-3 ${currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'}`}>
              vCard files can contain multiple contacts. Each contact will be imported with their name, phone, email, and birthday if available.
            </p>
            <button
              onClick={downloadTemplate}
              className="text-sm flex items-center gap-2 transition"
              style={{ color: '#5E81AC' }}
            >
              <Download className="w-4 h-4" />
              Download example template
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t" style={{ borderColor: currentTheme === 'dark' ? 'var(--nord3)' : 'var(--nord4)' }}>
          <button
            onClick={handleImport}
            disabled={!file || importStatus === 'success'}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              !file || importStatus === 'success'
                ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200'
                : 'bg-gradient-to-r from-nord10 to-nord8 text-white hover:opacity-90'
            }`}
          >
            {importStatus === 'success' ? 'Imported!' : 'Import Contacts'}
          </button>
          <button
            onClick={onCancel}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              currentTheme === 'dark'
                ? 'bg-nord2 text-nord6 hover:bg-nord3'
                : 'bg-nord5 text-nord0 hover:bg-nord4'
            }`}
          >
            {importStatus === 'success' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportContacts;
