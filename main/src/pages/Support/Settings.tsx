import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Mail, MessageSquare, Bell, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useCompany } from '../../contexts/CompanyContext';
import { EmailAccountModal } from '../../components/EmailAccountModal';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  address: z.string().optional(),
  phone: z.string().optional(),
  logo: z.string().optional(),
});


const smsSchema = z.object({
  provider: z.string().min(1, 'SMS provider is required'),
  apiKey: z.string().min(1, 'API key is required'),
  senderId: z.string().min(1, 'Sender ID is required'),
});

type CompanyFormData = z.infer<typeof companySchema>;
type SMSFormData = z.infer<typeof smsSchema>;

export default function SupportSettings() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [autoOpenModal, setAutoOpenModal] = useState(false);

  // Debug modal state
  useEffect(() => {
    console.log('showEmailModal state changed:', showEmailModal);
  }, [showEmailModal]);

  const { company, loading, updateCompany, uploadLogo, deleteLogo } = useCompany();

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      logo: '',
    },
  });

  // Update form when company data is loaded
  useEffect(() => {
    if (company) {
      companyForm.reset({
        name: company.name || '',
        address: company.address || '',
        phone: company.phone || '',
        logo: company.logo || '',
      });
      
      // Set logo preview if company has a logo (prioritize server URL over local preview)
      if (company.logo) {
        setLogoPreview(company.logo);
      } else {
        setLogoPreview(null);
      }
    }
  }, [company, companyForm]);

  // Check for auto-open modal parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    console.log('URL params:', Object.fromEntries(params.entries()));
    
    if (params.get('open_modal') === 'true') {
      console.log('Opening modal automatically');
      setAutoOpenModal(true);
      setShowEmailModal(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);


  const smsForm = useForm<SMSFormData>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      provider: '',
      apiKey: '',
      senderId: '',
    },
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file (PNG, JPG, JPEG, etc.)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setIsUploadingLogo(true);
      
      try {
        const success = await uploadLogo(file);
        if (success) {
          setLogoFile(file);
          // The logo preview will be updated automatically when the company context refreshes
          // No need to set local preview as the server URL will be used
          
          toast({
            title: 'Logo Uploaded',
            description: 'Your company logo has been uploaded successfully.',
          });
        }
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: 'Failed to upload logo. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const removeLogo = async () => {
    try {
      const success = await deleteLogo();
      if (success) {
        setLogoFile(null);
        setLogoPreview(null);
        companyForm.setValue('logo', '');
        
        toast({
          title: 'Logo Removed',
          description: 'Your company logo has been removed successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Remove Failed',
        description: 'Failed to remove logo. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onCompanySubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    
    try {
      const success = await updateCompany(data);
      if (success) {
    toast({
      title: 'Profile Saved',
      description: 'Your company profile has been updated successfully.',
    });
      }
    } catch (error) {
    toast({
        title: 'Save Failed',
        description: 'Failed to save company profile. Please try again.',
        variant: 'destructive',
    });
    } finally {
      setIsSubmitting(false);
    }
  };


  const onSMSSubmit = (data: SMSFormData) => {
    console.log('Saving SMS settings:', data);
    toast({
      title: 'SMS Settings Saved',
      description: 'Your SMS configuration has been updated.',
    });
  };

  return (
    <div className="space-y-6 px-5">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground">Configure your system preferences and integrations</p>
      </div>

      {/* Equal layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Company Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex"
        >
          <Card className="dashboard-widget flex flex-col w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-orange-500" />
                Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4 h-full flex flex-col">
                  <div className="flex-1 space-y-4">
                    <FormField
                      control={companyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Company Name <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your company address"
                              {...field}
                              className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+1 (555) 123-4567"
                              {...field}
                              className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Logo Upload Field */}
                    <FormField
                      control={companyForm.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Logo</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              {/* Logo Preview */}
                              {logoPreview && (
                                <div className="relative inline-block">
                                  <img
                                    src={logoPreview}
                                    alt="Company logo preview"
                                    className="w-20 h-20 object-cover rounded-lg border border-orange-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={removeLogo}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              
                              {/* Upload Button */}
                              <div className="flex items-center gap-4">
                                <label
                                  htmlFor="logo-upload"
                                  className={`flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg border border-orange-200 hover:bg-orange-100 cursor-pointer transition-colors ${
                                    isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {isUploadingLogo ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                  {isUploadingLogo ? 'Uploading...' : (logoPreview ? 'Change Logo' : 'Upload Logo')}
                                </label>
                                <input
                                  id="logo-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoUpload}
                                  className="hidden"
                                />
                                {!logoPreview && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>PNG, JPG up to 5MB</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || loading}
                    className="w-full bg-orange-500 text-white font-semibold rounded-[10px] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Account Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex"
        >
          <Card className="dashboard-widget flex flex-col w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-orange-500" />
                Email Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Manage Email Accounts</h3>
                <p className="text-gray-600 mb-6">
                  Configure Google email accounts for inbox and calendar synchronization
                </p>
                <Button
                  onClick={() => setShowEmailModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-[10px] px-6 py-2"
                >
                  Manage Email Accounts
                </Button>
                  </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SMS Settings */}
     

        {/* Notification Settings */}
      
      </div>

      {/* Email Account Modal */}
      <EmailAccountModal
        isOpen={showEmailModal}
        onClose={() => {
          console.log('Closing email modal');
          setShowEmailModal(false);
        }}
        onEmailAccountAdded={() => {
          // Optionally refresh data or show success message
        }}
      />
    </div>
  );
}
