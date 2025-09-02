import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

const roleSchema = z.object({
  name: z.string().min(2, 'Role name is required'),
  description: z.string().min(3, 'Description is required'),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface AddRoleModalProps {
  trigger?: React.ReactNode;
  onRoleAdded?: (role: RoleFormData) => void;
}

export function AddRoleModal({ trigger, onRoleAdded }: AddRoleModalProps) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = (data: RoleFormData) => {
    toast({ title: 'Role Created', description: data.name });
    onRoleAdded?.(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[95vw] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Role</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Support Agent / Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe permissions and responsibilities" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end"><Button type="submit">Create Role</Button></div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}


