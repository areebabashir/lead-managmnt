import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';
import { CreateContactData } from '../../services/contactAPI';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: CreateContactData[]) => void;
  loading?: boolean;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  loading = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CreateContactData[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError('');
    setSelectedFile(file);
    
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      parseCSV(file);
    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
      parseJSON(file);
    } else {
      setError('Please select a CSV or JSON file');
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('CSV file must contain at least a header row and one data row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const contacts: CreateContactData[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length !== headers.length) continue;

          const contact: any = {};
          headers.forEach((header, index) => {
            const value = values[index];
            if (value) {
              // Map CSV headers to our contact fields
              switch (header.toLowerCase()) {
                case 'full name':
                case 'fullname':
                  contact.fullName = value;
                  break;
                case 'email':
                  contact.email = value;
                  break;
                case 'phone':
                case 'phone number':
                  contact.phoneNumber = value;
                  break;
                case 'street address':
                  contact.streetAddress = value;
                  break;
                case 'city':
                  contact.city = value;
                  break;
                case 'province':
                  contact.province = value;
                  break;
                case 'country':
                  contact.country = value;
                  break;
                case 'date of birth':
                case 'dob':
                  contact.dateOfBirth = value;
                  break;
                case 'status':
                  contact.status = value;
                  break;
                case 'source':
                  contact.source = value;
                  break;
                case 'lead type':
                  contact.leadType = value;
                  break;
                default:
                  contact[header.toLowerCase().replace(/\s+/g, '')] = value;
              }
            }
          });

          // Only add if required fields are present
          if (contact.fullName && contact.email && contact.phoneNumber) {
            contacts.push(contact);
          }
        }

        setPreviewData(contacts.slice(0, 5)); // Show first 5 for preview
      } catch (err) {
        setError('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const parseJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        let contacts: CreateContactData[] = [];
        
        if (Array.isArray(data)) {
          contacts = data;
        } else if (data.contacts && Array.isArray(data.contacts)) {
          contacts = data.contacts;
        } else if (data.data && Array.isArray(data.data)) {
          contacts = data.data;
        } else {
          setError('JSON file must contain an array of contacts');
          return;
        }

        // Validate contacts
        const validContacts = contacts.filter(contact => 
          contact.fullName && contact.email && contact.phoneNumber
        );

        setPreviewData(validContacts.slice(0, 5)); // Show first 5 for preview
      } catch (err) {
        setError('Error parsing JSON file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (selectedFile) {
      // Re-parse the full file for import
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          let contacts: CreateContactData[] = [];
          
          if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
              if (values.length !== headers.length) continue;

              const contact: any = {};
              headers.forEach((header, index) => {
                const value = values[index];
                if (value) {
                  switch (header.toLowerCase()) {
                    case 'full name':
                    case 'fullname':
                      contact.fullName = value;
                      break;
                    case 'email':
                      contact.email = value;
                      break;
                    case 'phone':
                    case 'phone number':
                      contact.phoneNumber = value;
                      break;
                    case 'street address':
                      contact.streetAddress = value;
                      break;
                    case 'city':
                      contact.city = value;
                      break;
                    case 'province':
                      contact.province = value;
                      break;
                    case 'country':
                      contact.country = value;
                      break;
                    case 'date of birth':
                    case 'dob':
                      contact.dateOfBirth = value;
                      break;
                    case 'status':
                      contact.status = value;
                      break;
                    case 'source':
                      contact.source = value;
                      break;
                    case 'lead type':
                      contact.leadType = value;
                      break;
                  }
                }
              });

              if (contact.fullName && contact.email && contact.phoneNumber) {
                contacts.push(contact);
              }
            }
          } else {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
              contacts = data;
            } else if (data.contacts && Array.isArray(data.contacts)) {
              contacts = data.contacts;
            } else if (data.data && Array.isArray(data.data)) {
              contacts = data.data;
            }
          }

          onImport(contacts);
        } catch (err) {
          setError('Error processing file for import');
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setError('');
    setDragActive(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Import Contacts</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedFile ? (
            <>
              <p className="text-gray-600 mb-6">
                Upload a CSV or JSON file to import contacts. The file should include the required fields: Full Name, Email, Phone Number, Street Address, City, Province, Country, and Date of Birth.
              </p>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your file here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV and JSON files up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Supported Format Info */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Supported Formats:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">CSV Format:</h4>
                    <p className="text-sm text-gray-600">
                      Headers: Full Name, Email, Phone Number, Street Address, City, Province, Country, Date of Birth
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">JSON Format:</h4>
                    <p className="text-sm text-gray-600">
                      Array of contact objects with required fields
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* File Selected */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-sm text-green-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {previewData.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Preview (showing first {Math.min(5, previewData.length)} contacts):
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {previewData.map((contact, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="font-medium">Name:</span> {contact.fullName}</div>
                            <div><span className="font-medium">Email:</span> {contact.email}</div>
                            <div><span className="font-medium">Phone:</span> {contact.phoneNumber}</div>
                            <div><span className="font-medium">City:</span> {contact.city}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={resetModal}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Choose Different File
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading || !!error || previewData.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Import Contacts
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
