import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

const stageSchema = z.object({
  name: z.string().min(2, 'Stage name is required'),
  order: z.string().min(1, 'Order is required'),
});

type StageFormData = z.infer<typeof stageSchema>;

interface AddStageModalProps {
  trigger?: React.ReactNode;
  onStageAdded?: (stage: StageFormData) => void;
}

export function AddStageModal({ trigger, onStageAdded }: AddStageModalProps) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<StageFormData>({
    resolver: zodResolver(stageSchema),
    defaultValues: { name: '', order: '' },
  });

  const onSubmit = (data: StageFormData) => {
    toast({ title: 'Stage Added', description: data.name });
    onStageAdded?.(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Stage
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[95vw] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Pipeline Stage</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Qualified / Negotiation ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end"><Button type="submit">Create Stage</Button></div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}


