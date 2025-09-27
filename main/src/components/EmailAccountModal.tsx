import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Mail,
    User,
    Key,
    Settings,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    Plus,
    Edit,
    Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { emailAccountAPI, EmailAccount, EmailAccountFormData as APIEmailAccountFormData } from '../services/emailAccountAPI';



const emailAccountSchema = z.object({
    email: z.string().email('Invalid email address'),
    displayName: z.string().optional(),
    google: z.object({
        refreshToken: z.string().optional(), // Made optional since it can come from OAuth
        accessToken: z.string().optional(),
        expiryDate: z.string().optional(),
        scopes: z.array(z.string()).optional(),
    }),
    settings: z.object({
        syncInbox: z.boolean().default(true),
        syncCalendar: z.boolean().default(true),
    }).optional(),
});

type EmailAccountFormData = z.infer<typeof emailAccountSchema>;

interface EmailAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEmailAccountAdded?: (emailAccount: EmailAccount) => void;
}

export const EmailAccountModal: React.FC<EmailAccountModalProps> = ({
    isOpen,
    onClose,
    onEmailAccountAdded
}) => {
    const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);

    const form = useForm<EmailAccountFormData>({
        resolver: zodResolver(emailAccountSchema),
        defaultValues: {
            email: '',
            displayName: '',
            google: {
                refreshToken: '',
                accessToken: '',
                expiryDate: '',
                scopes: [],
            },
            settings: {
                syncInbox: true,
                syncCalendar: true,
            },
        },
    });

    // Fetch email accounts when modal opens
    useEffect(() => {
        console.log('EmailAccountModal isOpen changed:', isOpen);
        if (isOpen) {
            fetchEmailAccounts();
        }
    }, [isOpen]);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        console.log('EmailAccountModal URL params:', Object.fromEntries(params.entries()));
        
        // Handle Google tokens from OAuth callback
        if (params.get('google_tokens')) {
            console.log('Google tokens found in URL');
          try {
            const encodedTokens = params.get('google_tokens');
            const tokenData = JSON.parse(atob(encodedTokens!));
            
            // Pre-fill the form with Google tokens (no email - user will enter it)
            form.setValue('google.refreshToken', tokenData.refreshToken);
            form.setValue('google.accessToken', tokenData.accessToken || '');
            form.setValue('google.expiryDate', tokenData.expiryDate ? new Date(tokenData.expiryDate).toISOString() : '');
            form.setValue('google.scopes', tokenData.scopes || []);
            
            toast({ 
              title: 'Google Account Connected!', 
              description: 'Please enter your email address and display name to complete the setup.' 
            });
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error('Error parsing Google tokens:', error);
            toast({ 
              title: 'Error', 
              description: 'Failed to process Google authentication data.', 
              variant: 'destructive' 
            });
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        if (params.get('connected') === 'true') {
          toast({ title: 'Success', description: 'Google account connected successfully!' });
          fetchEmailAccounts();
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        if (params.get('error')) {
          const error = params.get('error');
          let errorMessage = 'Google authentication failed';
          
          switch (error) {
            case 'auth_failed':
              errorMessage = 'Authentication failed. Please try again.';
              break;
            case 'no_code':
              errorMessage = 'No authorization code received from Google.';
              break;
            case 'no_access_token':
              errorMessage = 'No access token received from Google.';
              break;
            case 'no_refresh_token':
              errorMessage = 'No refresh token received. Please ensure you grant all permissions.';
              break;
            case 'userinfo_failed':
              errorMessage = 'Failed to retrieve user information from Google.';
              break;
            case 'no_company':
              errorMessage = 'No company found. Please create a company profile first.';
              break;
            case 'config_error':
              errorMessage = 'Google OAuth configuration error. Please contact support.';
              break;
            default:
              errorMessage = `Authentication error: ${error}`;
          }
          
          toast({ 
            title: 'Google Authentication Error', 
            description: errorMessage, 
            variant: 'destructive' 
          });
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, []);
      

    const fetchEmailAccounts = async () => {
        setLoading(true);
        try {
            const response = await emailAccountAPI.getEmailAccounts();
            if (response.success && response.emailAccounts) {
                setEmailAccounts(response.emailAccounts);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch email accounts',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: EmailAccountFormData) => {
        setIsSubmitting(true);
        try {
            // Validate that we have a refresh token (either from OAuth or manual input)
            if (!data.google.refreshToken) {
                toast({
                    title: 'Error',
                    description: 'Please connect your Google account or provide a refresh token.',
                    variant: 'destructive',
                });
                setIsSubmitting(false);
                return;
            }

            // Validate email - must be provided by user
            if (!data.email || data.email.trim() === '') {
                toast({
                    title: 'Error',
                    description: 'Email address is required.',
                    variant: 'destructive',
                });
                setIsSubmitting(false);
                return;
            }

            // Convert form data to API format
            const apiData: APIEmailAccountFormData = {
                email: data.email.trim(),
                displayName: data.displayName,
                google: {
                    refreshToken: data.google.refreshToken,
                    accessToken: data.google.accessToken,
                    expiryDate: data.google.expiryDate,
                    scopes: data.google.scopes
                }
            };

            let response;
            if (editingAccount) {
                response = await emailAccountAPI.updateEmailAccount(editingAccount._id, apiData);
            } else {
                response = await emailAccountAPI.createEmailAccount(apiData);
            }

            if (response.success) {
                toast({
                    title: editingAccount ? 'Email Account Updated' : 'Email Account Added',
                    description: `Email account ${editingAccount ? 'updated' : 'added'} successfully.`,
                });

                await fetchEmailAccounts();
                form.reset();
                setEditingAccount(null);

                if (onEmailAccountAdded && response.emailAccount) {
                    onEmailAccountAdded(response.emailAccount);
                }
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save email account',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (account: EmailAccount) => {
        setEditingAccount(account);
        form.reset({
            email: account.email,
            displayName: account.displayName,
            google: {
                refreshToken: '', // Don't show existing tokens for security
                accessToken: '',
                expiryDate: '',
                scopes: [],
            },
            settings: {
                syncInbox: account.settings.syncInbox,
                syncCalendar: account.settings.syncCalendar,
            },
        });
    };

    const handleDelete = async (account: EmailAccount) => {
        if (window.confirm('Are you sure you want to delete this email account?')) {
            try {
                const response = await emailAccountAPI.deleteEmailAccount(account._id);
                if (response.success) {
                    toast({
                        title: 'Email Account Deleted',
                        description: 'Email account deleted successfully.',
                    });
                    await fetchEmailAccounts();
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to delete email account',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleToggleActive = async (account: EmailAccount) => {
        if (account.isActive) {
            // If already active, do nothing (can't deactivate the only active account)
            return;
        }

        try {
            await emailAccountAPI.activateEmailAccount(account._id);
            toast({
                title: 'Email Account Activated',
                description: `${account.email} is now the active email account.`,
            });
            await fetchEmailAccounts();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to activate email account.',
                variant: 'destructive',
            });
        }
    };

    const handleCancel = () => {
        form.reset();
        setEditingAccount(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-orange-500" />
                        Email Account Management
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Email Accounts List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Email Accounts</h3>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add New
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : emailAccounts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No email accounts configured</p>
                                <p className="text-sm">Add your first email account to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {emailAccounts.map((account) => (
                                    <motion.div
                                        key={account._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 border rounded-lg bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium">{account.email}</span>
                                                    {account.isActive && (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                                {account.displayName && (
                                                    <p className="text-sm text-gray-600 ml-6">{account.displayName}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 ml-6">
                                                    <div className="flex items-center gap-1">
                                                        <Settings className="h-3 w-3" />
                                                        <span className="text-xs text-gray-500">
                                                            {account.settings.syncInbox ? 'Inbox' : ''}
                                                            {account.settings.syncInbox && account.settings.syncCalendar ? ', ' : ''}
                                                            {account.settings.syncCalendar ? 'Calendar' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor={`active-${account._id}`} className="text-sm">
                                                        Active
                                                    </Label>
                                                    <Switch
                                                        id={`active-${account._id}`}
                                                        checked={account.isActive}
                                                        onCheckedChange={() => handleToggleActive(account)}
                                                        disabled={account.isActive}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => handleEdit(account)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(account)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Email Account Form */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            {editingAccount ? 'Edit Email Account' : 'Add New Email Account'}
                        </h3>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Email Address <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="sales@company.com"
                                                    className="focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="displayName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Display Name (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Sales Team"
                                                    className="focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                               

                                {form.watch('google.refreshToken') ? (
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2 text-green-800 mb-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="font-medium">Google Account Connected</span>
                                        </div>
                                        <p className="text-sm text-green-700">
                                            Google tokens have been received. Please enter your email address and display name below to complete the setup.
                                        </p>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={() => window.location.href = `http://localhost:8000/api/google/auth`}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        Connect Google Account
                                    </Button>
                                )}

                                <div className="space-y-4">
                                    <h4 className="font-medium">Sync Settings</h4>

                                    <FormField
                                        control={form.control}
                                        name="settings.syncInbox"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between">
                                                <FormLabel>Sync Inbox</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="settings.syncCalendar"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between">
                                                <FormLabel>Sync Calendar</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                {editingAccount ? 'Updating...' : 'Adding...'}
                                            </>
                                        ) : (
                                            editingAccount ? 'Update Account' : 'Add Account'
                                        )}
                                    </Button>

                                    {editingAccount && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
