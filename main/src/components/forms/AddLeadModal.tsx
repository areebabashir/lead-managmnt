import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { toast } from "@/hooks/use-toast";

// ==============================
// Zod Schema & Types
// ==============================
const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  company: z.string().optional(),
  source: z.string().min(1, "Source is required"),
  status: z.enum(
    ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"],
    { required_error: "Please select a status" }
  ),
  notes: z.string().optional(),
  budget: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

interface AddLeadModalProps {
  trigger?: React.ReactNode;
  onLeadAdded?: (lead: LeadFormData) => void;
}

// ==============================
// Component
// ==============================
export function AddLeadModal({ trigger, onLeadAdded }: AddLeadModalProps) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "",
      status: "new",
      notes: "",
      budget: "",
    },
  });

  const onSubmit = (data: LeadFormData) => {
    console.log("Adding lead:", data);

    // 🔥 Trigger toast notification
    toast({
      title: "Lead Added",
      description: `${data.name} has been added to your pipeline.`,
    });

    // Callback to parent (if needed)
    onLeadAdded?.(data);

    // Reset form + close modal
    form.reset();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <SheetTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Lead
          </Button>
        )}
      </SheetTrigger>

      {/* Content */}
      <SheetContent
        side="right"
        className="w-[95vw] sm:max-w-[900px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Lead
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone + Company */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Source + Status */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Lead Source <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="website">Website Form</SelectItem>
                        <SelectItem value="google-ads">Google Ads</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="cold-call">Cold Call</SelectItem>
                        <SelectItem value="email">Email Campaign</SelectItem>
                        <SelectItem value="trade-show">Trade Show</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal Sent</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget */}
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Budget</FormLabel>
                  <FormControl>
                    <Input placeholder="$10,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about this lead..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Lead</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
