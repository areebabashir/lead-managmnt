import React, { useState } from "react";
import { X, Download } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "json" | "csv") => Promise<void>;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExportClick = async () => {
    setLoading(true);
    try {
      await onExport(format);
      onClose(); // close modal after export
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export contacts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Export Contacts</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="block mb-3 text-sm font-medium">Choose Export Format:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "json" | "csv")}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
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
            onClick={handleExportClick}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} />
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
