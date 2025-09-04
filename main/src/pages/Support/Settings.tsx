import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Mail, MessageSquare, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

const emailSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.string().min(1, 'Port is required'),
  smtpEncryption: z.string().min(1, 'Encryption type is required'),
  smtpUsername: z.string().min(1, 'Username is required'),
  smtpPassword: z.string().min(1, 'Password is required'),
});

const smsSchema = z.object({
  provider: z.string().min(1, 'SMS provider is required'),
  apiKey: z.string().min(1, 'API key is required'),
  senderId: z.string().min(1, 'Sender ID is required'),
});

type CompanyFormData = z.infer<typeof companySchema>;
type EmailFormData = z.infer<typeof emailSchema>;
type SMSFormData = z.infer<typeof smsSchema>;

export default function SupportSettings() {
  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: 'Vista Business Hub',
      address: '',
      phone: '',
      email: '',
    },
  });

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      smtpHost: '',
      smtpPort: '587',
      smtpEncryption: 'TLS',
      smtpUsername: '',
      smtpPassword: '',
    },
  });

  const smsForm = useForm<SMSFormData>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      provider: '',
      apiKey: '',
      senderId: '',
    },
  });

  const onCompanySubmit = (data: CompanyFormData) => {
    console.log('Saving company profile:', data);
    toast({
      title: 'Profile Saved',
      description: 'Your company profile has been updated successfully.',
    });
  };

  const onEmailSubmit = (data: EmailFormData) => {
    console.log('Saving email settings:', data);
    toast({
      title: 'Email Settings Saved',
      description: 'Your email configuration has been updated.',
    });
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
                    <FormField
                      control={companyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="contact@company.com"
                              {...field}
                              className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-500 text-white font-semibold rounded-[10px]">
                    Save Profile
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Settings */}
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
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 h-full flex flex-col">
                  <div className="flex-1 space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            SMTP Host <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="smtp.example.com"
                              {...field}
                              className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={emailForm.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Port <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="587"
                                {...field}
                                className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailForm.control}
                        name="smtpEncryption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Encryption <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="TLS"
                                {...field}
                                className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={emailForm.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Username <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your-email@example.com"
                              {...field}
                              className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Password <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-500 text-white font-semibold rounded-[10px]">
                    Save Email Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* SMS Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex"
        >
          <Card className="dashboard-widget flex flex-col w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                SMS Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <Form {...smsForm}>
                <form onSubmit={smsForm.handleSubmit(onSMSSubmit)} className="space-y-4 h-full flex flex-col">
                  <div className="flex-1 space-y-4">
                    <FormField
                      control={smsForm.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            SMS Provider <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Twilio / Zong / Custom"
                              {...field}
                              className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={smsForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            API Key <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Your SMS API Key"
                              {...field}
                              className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={smsForm.control}
                      name="senderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Sender ID <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your Business Name"
                              {...field}
                              className="focus:ring-orange-500 focus:border-orange-500 border-orange-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-500 text-white font-semibold rounded-[10px]">
                    Save SMS Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex"
        >
          <Card className="dashboard-widget flex flex-col w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="flex-1 space-y-4">
                {[
                  { label: 'New Lead Notifications', description: 'Get notified when new leads are added' },
                  { label: 'Task Reminders', description: 'Send reminders for upcoming tasks' },
                  { label: 'System Updates', description: 'Notifications about system maintenance' },
                  { label: 'Email Reports', description: 'Send daily/weekly reports via email' },
                ].map((setting, index) => (
                  <div key={setting.label} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch defaultChecked={index < 3} />
                  </div>
                ))}
              </div>
              <Button className="w-full bg-orange-500 text-white font-semibold rounded-[10px]">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
