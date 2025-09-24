import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { companyAPI, Company } from '../services/companyAPI';

interface CompanyContextType {
  company: Company | null;
  loading: boolean;
  error: string | null;
  fetchCompany: () => Promise<void>;
  updateCompany: (companyData: any) => Promise<boolean>;
  uploadLogo: (file: File) => Promise<boolean>;
  deleteLogo: () => Promise<boolean>;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyAPI.getCompany();
      
      if (response.success && response.company) {
        setCompany(response.company);
      } else {
        setError(response.message || 'Failed to fetch company data');
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch company data');
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (companyData: any): Promise<boolean> => {
    try {
      setError(null);
      const response = await companyAPI.updateCompany(companyData);
      
      if (response.success && response.company) {
        setCompany(response.company);
        return true;
      } else {
        setError(response.message || 'Failed to update company');
        return false;
      }
    } catch (error) {
      console.error('Error updating company:', error);
      setError(error instanceof Error ? error.message : 'Failed to update company');
      return false;
    }
  };

  const uploadLogo = async (file: File): Promise<boolean> => {
    try {
      setError(null);
      const response = await companyAPI.uploadLogo(file);
      
      if (response.success) {
        // Refresh company data to get updated logo
        await fetchCompany();
        return true;
      } else {
        setError(response.message || 'Failed to upload logo');
        return false;
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload logo');
      return false;
    }
  };

  const deleteLogo = async (): Promise<boolean> => {
    try {
      setError(null);
      const response = await companyAPI.deleteLogo();
      
      if (response.success) {
        // Refresh company data to get updated logo
        await fetchCompany();
        return true;
      } else {
        setError(response.message || 'Failed to delete logo');
        return false;
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete logo');
      return false;
    }
  };

  const refreshCompany = async () => {
    await fetchCompany();
  };

  // Initialize company data on mount
  useEffect(() => {
    fetchCompany();
  }, []);

  const value: CompanyContextType = {
    company,
    loading,
    error,
    fetchCompany,
    updateCompany,
    uploadLogo,
    deleteLogo,
    refreshCompany,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};


