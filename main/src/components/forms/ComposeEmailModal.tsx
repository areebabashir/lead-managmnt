import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';

const emailSchema = z.object({
  to: z.string().email('Valid recipient email is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Message is required'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface ComposeEmailModalProps {
  trigger?: React.ReactNode;
  onSend?: (email: EmailFormData) => void;
}

export function ComposeEmailModal({ trigger, onSend }: ComposeEmailModalProps) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { to: '', subject: '', body: '' },
  });

  const onSubmit = (data: EmailFormData) => {
    onSend?.(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="gap-2"><Plus className="h-4 w-4" />Compose</Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[95vw] sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Compose Email</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="recipient@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[200px]" placeholder="Write your message..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="submit">Send</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}


