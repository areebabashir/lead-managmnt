import React, { useState } from 'react';
import { Download, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'json' | 'csv') => void;
  loading?: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  loading = false
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv'>('csv');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Export Contacts</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Choose the format you want to export your contacts in. The export will include all contacts matching your current filters.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <input
                type="radio"
                id="csv"
                name="format"
                value="csv"
                checked={selectedFormat === 'csv'}
                onChange={(e) => setSelectedFormat(e.target.value as 'csv')}
                className="mr-3"
              />
              <label htmlFor="csv" className="flex-1">
                <div className="font-medium text-gray-900">CSV Format</div>
                <div className="text-sm text-gray-500">Spreadsheet format, compatible with Excel and Google Sheets</div>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="json"
                name="format"
                value="json"
                checked={selectedFormat === 'json'}
                onChange={(e) => setSelectedFormat(e.target.value as 'json')}
                className="mr-3"
              />
              <label htmlFor="json" className="flex-1">
                <div className="font-medium text-gray-900">JSON Format</div>
                <div className="text-sm text-gray-500">Structured data format for developers and APIs</div>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Export includes:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Full Name, Email, Phone Number</li>
              <li>• Address Information (Street, City, Province, Country)</li>
              <li>• Date of Birth, Status, Source</li>
              <li>• Lead Type, Search Area, Price Range</li>
              <li>• Anniversary, Referral Information</li>
              <li>• Creation and Last Interaction Dates</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onExport(selectedFormat)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export as {selectedFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
