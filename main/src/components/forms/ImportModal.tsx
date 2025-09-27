import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import Papa from "papaparse";
import { CreateContactData } from "../../services/contactAPI";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contactsData: CreateContactData[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CreateContactData[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handle CSV/JSON upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    setFile(uploadedFile);

    if (uploadedFile) {
      const fileType = uploadedFile.name.split(".").pop()?.toLowerCase();

      if (fileType === "csv") {
        Papa.parse(uploadedFile, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setPreviewData(result.data as CreateContactData[]);
          },
        });
      } else if (fileType === "json") {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target?.result as string);
            setPreviewData(parsed as CreateContactData[]);
          } catch (err) {
            console.error("Invalid JSON file", err);
          }
        };
        reader.readAsText(uploadedFile);
      }
    }
  };

  const handleImportClick = async () => {
    if (!previewData.length) return;
    setLoading(true);
    try {
      await onImport(previewData);
      setFile(null);
      setPreviewData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Import Contacts</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <input
            type="file"
            accept=".csv, .json"
            onChange={handleFileChange}
            className="mb-4"
          />

          {previewData.length > 0 && (
            <div className="max-h-40 overflow-y-auto border rounded p-2 text-sm bg-gray-50">
              <p className="font-medium mb-2">Preview ({previewData.length} rows):</p>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(previewData.slice(0, 5), null, 2)}
              </pre>
              {previewData.length > 5 && <p className="text-xs text-gray-500">...and more</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleImportClick}
            disabled={loading || previewData.length === 0}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
          >
            <Upload size={16} />
            {loading ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
