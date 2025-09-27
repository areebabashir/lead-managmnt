import React, { useState, useEffect } from "react";
import DataTable, { TableStyles } from "react-data-table-component";
import { Eye, Edit, Trash2, Plus, Download, Upload, RefreshCw } from "lucide-react";
import { contactAPI, Contact, CreateContactData, ContactFilters } from "../../services/contactAPI";
import { toast } from "sonner";
import ContactFormModal from "../../components/forms/ContactFormModal";
import DeleteConfirmationModal from "../../components/forms/DeleteConfirmationModal";
import ExportModal from "../../components/forms/ExportModal";
import ImportModal from "../../components/forms/ImportModal";

// Contact status options
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'New', label: 'New' },
  { value: 'Existing', label: 'Existing' },
  { value: 'First-Time Buyer', label: 'First-Time Buyer' },
];

// Source options
const sourceOptions = [
  { value: '', label: 'All Sources' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'event', label: 'Event' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'zapier', label: 'Zapier' },
  { value: 'other', label: 'Other' },
];

const LeadManagerLeads: React.FC = () => {
  // State management
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Contact[]>([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Filters and search
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [leadTypeFilter, setLeadTypeFilter] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [perPage, setPerPage] = useState(10);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  
  // Export/Import
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch contacts from API
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const filters: ContactFilters = {
        page: currentPage,
        limit: perPage,
        search: searchText || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        leadType: leadTypeFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const response = await contactAPI.getContacts(filters);
      
      if (response.success) {
        setContacts(response.data);
        setTotalPages(response.pagination.pages);
        setTotalContacts(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  // Load contacts on component mount and when filters change
  useEffect(() => {
    fetchContacts();
  }, [currentPage, perPage, searchText, statusFilter, sourceFilter, leadTypeFilter]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchContacts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText, statusFilter, sourceFilter, leadTypeFilter]);

  // CRUD Operations
  const handleCreateContact = async (contactData: CreateContactData) => {
    try {
      const response = await contactAPI.createContact(contactData);
      if (response.success) {
        toast.success('Contact created successfully');
        setShowAddModal(false);
        fetchContacts();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contact');
    }
  };

  const handleUpdateContact = async (id: string, contactData: CreateContactData) => {
    try {
      const response = await contactAPI.updateContact(id, contactData);
      if (response.success) {
        toast.success('Contact updated successfully');
        setShowEditModal(false);
        setEditingContact(null);
        fetchContacts();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const response = await contactAPI.deleteContact(id);
      if (response.success) {
        toast.success('Contact deleted successfully');
        setShowDeleteModal(false);
        setDeletingContact(null);
        fetchContacts();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contact');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await contactAPI.updateContactStatus(id, status);
      if (response.success) {
        toast.success('Status updated successfully');
        fetchContacts();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleExportContacts = async (format: 'json' | 'csv') => {
    try {
      await contactAPI.exportContacts(format, {
        search: searchText || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        leadType: leadTypeFilter || undefined,
      });
      toast.success(`Contacts exported as ${format.toUpperCase()}`);
      setShowExportModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export contacts');
    }
  };

  const handleImportContacts = async (contactsData: CreateContactData[]) => {
    try {
      const response = await contactAPI.importContacts(contactsData);
      if (response.success) {
        toast.success(`Successfully imported ${response.data.imported} contacts`);
        if (response.data.errors > 0) {
          toast.warning(`${response.data.errors} contacts failed to import`);
        }
        setShowImportModal(false);
        fetchContacts();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to import contacts');
    }
  };

  // Event handlers
  const handleEditClick = (contact: Contact) => {
    setEditingContact(contact);
    setShowEditModal(true);
  };

  const handleDeleteClick = (contact: Contact) => {
    setDeletingContact(contact);
    setShowDeleteModal(true);
  };

  const handleRefresh = () => {
    fetchContacts();
  };

  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setSourceFilter("");
    setLeadTypeFilter("");
    setCurrentPage(1);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-primary/10 text-primary';
      case 'Existing':
        return 'bg-green-100 text-green-800';
      case 'First-Time Buyer':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Responsive columns
  const columns = isMobile
    ? [
        {
          name: "Name",
          selector: (row: Contact) => row.fullName,
          sortable: true,
          width: "120px",
          center: true,
        },
        {
          name: "Email",
          selector: (row: Contact) => row.email,
          width: "150px",
          center: true,
        },
        {
          name: "Status",
          cell: (row: Contact) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(row.status)}`}>
              {row.status}
            </span>
          ),
          center: true,
          width: "100px",
        },
        {
          name: "Actions",
          cell: (row: Contact) => (
            <div className="flex justify-center gap-1">
              <button 
                onClick={() => handleEditClick(row)}
                className="text-orange-500 hover:text-orange-700"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => handleDeleteClick(row)}
                className="text-red-600 hover:text-red-700"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ),
          center: true,
          width: "80px",
        },
      ]
    : [
        {
          name: "Full Name",
          selector: (row: Contact) => row.fullName,
          sortable: true,
          width: "150px",
          center: true,
        },
        {
          name: "Email",
          selector: (row: Contact) => row.email,
          sortable: true,
          width: "200px",
          center: true,
        },
        {
          name: "Phone",
          selector: (row: Contact) => row.phoneNumber,
          width: "130px",
          center: true,
        },
        {
          name: "Location",
          cell: (row: Contact) => `${row.city}, ${row.province}`,
          width: "150px",
          center: true,
        },
        {
          name: "Status",
          cell: (row: Contact) => (
            <select
              value={row.status}
              onChange={(e) => handleStatusUpdate(row._id, e.target.value)}
              className={`px-2 py-1 rounded-full text-xs font-medium border-none ${getStatusBadgeColor(row.status)}`}
            >
              {statusOptions.slice(1).map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ),
          center: true,
          width: "120px",
        },
        {
          name: "Source",
          selector: (row: Contact) => row.source,
          center: true,
          width: "100px",
        },
        {
          name: "Created",
          cell: (row: Contact) => formatDate(row.createdAt),
          sortable: true,
          center: true,
          width: "100px",
        },
        {
          name: "Actions",
          cell: (row: Contact) => (
            <div className="flex justify-center gap-2">
              <button 
                onClick={() => handleEditClick(row)}
                className="text-orange-500 hover:text-orange-700"
                title="Edit Contact"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => handleDeleteClick(row)}
                className="text-red-600 hover:text-red-700"
                title="Delete Contact"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ),
          center: true,
          width: "120px",
        },
      ];

  // ✅ Fix: Properly typed customStyles
  const customStyles: TableStyles = {
    headCells: {
      style: {
        justifyContent: "center",
        color: "#000",
      },
    },
    cells: {
      style: {
        justifyContent: "center",
        textAlign: "center",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#FFEDD5", // orange-100
        color: "#000",
        fontWeight: "600",
        fontSize: "13px",
        textTransform: "uppercase",
        fontFamily: "Oswald, sans-serif",
        borderRadius: "6px",
      },
    },
    rows: {
      style: {
        fontWeight: "500",
        color: "#000",
        fontFamily: "Oswald, sans-serif",
      },
    },
  };

  return (
    <div className="px-4 sm:px-8 pt-10">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-black">Leads Management</h2>
          <p className="text-sm text-gray-800">
            Track and manage all your leads ({totalContacts} total)
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gray-500 text-white px-4 py-2.5 rounded-md text-base font-semibold hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-4 py-2.5 rounded-md text-base font-semibold hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus size={18} />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
        >
          {sourceOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Lead Type Filter */}
        <input
          type="text"
          placeholder="Lead Type"
          value={leadTypeFilter}
          onChange={(e) => setLeadTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
        />

        {/* Action Buttons */}
        <button
          onClick={handleClearFilters}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
        >
          Clear Filters
        </button>

        <button
          onClick={() => setShowExportModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <Download size={16} />
          Export
        </button>

        <button
          onClick={() => setShowImportModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <Upload size={16} />
          Import
        </button>
      </div>

      {/* Table */}
      <div className="p-4 sm:p-5 shadow-md border border-gray-200 rounded-[10px] bg-white">
        <div className="mt-2 overflow-x-auto">
          <DataTable
            columns={columns}
            data={contacts}
            pagination
            paginationServer
            paginationTotalRows={totalContacts}
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[5, 10, 20, 50]}
            onChangePage={setCurrentPage}
            onChangeRowsPerPage={setPerPage}
            progressPending={loading}
            persistTableHead
            selectableRows
            onSelectedRowsChange={({ selectedRows }) =>
              setSelectedRows(selectedRows as Contact[])
            }
            clearSelectedRows={toggleCleared}
            customStyles={customStyles}
            responsive
            noDataComponent={
              <div className="text-center py-8">
                <p className="text-gray-500">No contacts found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters or add a new contact
                </p>
              </div>
            }
          />
        </div>
      </div>

      {/* Modals */}
      <ContactFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateContact}
        title="Add New Contact"
      />

      <ContactFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingContact(null);
        }}
        onSubmit={(data) => editingContact && handleUpdateContact(editingContact._id, data)}
        contact={editingContact}
        title="Edit Contact"
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingContact(null);
        }}
        onConfirm={() => deletingContact && handleDeleteContact(deletingContact._id)}
        contact={deletingContact}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportContacts}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportContacts}
      />
    </div>
  );
};

export default LeadManagerLeads;
