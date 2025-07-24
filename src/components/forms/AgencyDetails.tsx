'use client'

import { Agency } from '@prisma/client'
import { useForm } from 'react-hook-form'
import React, { useEffect, useState, useMemo } from 'react'
import { NumberInput } from '@tremor/react'
import { v4 } from 'uuid'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  deleteAgency,
  initUser,
  saveActivityLogsNotification,
  updateAgencyDetails,
  upsertAgency,
} from '@/lib/queries'
import { Button } from '@/components/ui/button'
import Loading from '@/components/global/loading'
import FileUpload from '../common/FileUpload'

type Props = {
  data?: Partial<Agency>
}

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Agency name must be at least 2 chars.' }),
  companyEmail: z.string().email({ message: 'Please enter a valid email address' }),
  companyPhone: z.string().min(1, { message: 'Please enter a phone number' }),
  whiteLabel: z.boolean(),
  address: z.string().min(1, { message: 'Please enter an address' }),
  city: z.string().min(1, { message: 'Please enter a city' }),
  zipCode: z.string().min(1, { message: 'Please enter a zip code' }),
  state: z.string().min(1, { message: 'Please enter a state' }),
  country: z.string().min(1, { message: 'Please enter a country' }),
  agencyLogo: z.string().min(1, { message: 'Please upload an agency logo' }),
})

const AgencyDetails = ({ data }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const [deletingAgency, setDeletingAgency] = useState(false)

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues: z.infer<typeof FormSchema> = useMemo(() => ({
    name: '',
    companyEmail: '',
    companyPhone: '',
    whiteLabel: false,
    address: '',
    city: '',
    zipCode: '',
    state: '',
    country: '',
    agencyLogo: '',
  }), [])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: 'onChange',
  })

  // Update form when data changes
  useEffect(() => {
    if (data) {
      const formData = {
        name: data.name ?? defaultValues.name,
        companyEmail: data.companyEmail ?? defaultValues.companyEmail,
        companyPhone: data.companyPhone ?? defaultValues.companyPhone,
        whiteLabel: data.whiteLabel ?? defaultValues.whiteLabel,
        address: data.address ?? defaultValues.address,
        city: data.city ?? defaultValues.city,
        zipCode: data.zipCode ?? defaultValues.zipCode,
        state: data.state ?? defaultValues.state,
        country: data.country ?? defaultValues.country,
        agencyLogo: data.agencyLogo ?? defaultValues.agencyLogo,
      }
      form.reset(formData)
    }
  }, [data, form, defaultValues])

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      let custId;
      if (!data?.id) {
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.zipCode,
            },
            name: values.name,
          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.zipCode,
          },
        };

  // In your AgencyDetails component, modify the fetch call:
try {
  console.log('Sending data:', bodyData);
  
  const customerResponse = await fetch("/api/stripe/create-customer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  });

  console.log('Response status:', customerResponse.status);
  
  // Let's see what we're actually getting back
  const responseText = await customerResponse.text();
  console.log('Raw response:', responseText);
  
  // Try to parse it as JSON only if it doesn't start with <!DOCTYPE
  if (responseText.trim().startsWith('<!DOCTYPE')) {
    throw new Error('Received HTML instead of JSON response');
  }
  
  const customerData = JSON.parse(responseText);
  custId = customerData.customerId;
} catch (error) {
  console.error('Full error:', error);
  toast({
    variant: "destructive",
    title: "Error",
    description: "Could not create customer. Please check console for details.",
  });
  return;
}

        // Initialize user only for new agencies
        const newUserData = await initUser({ role: "AGENCY_OWNER" });
        console.log('New user created:', newUserData);
      }
      
      if (!data?.customerId && !custId) return;

      await upsertAgency({
        id: data?.id ? data.id : v4(),
        customerId: data?.customerId || custId || "",
        address: values.address,
        agencyLogo: values.agencyLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        whiteLabel: values.whiteLabel,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        connectAccountId: "",
        goal: 5,
      });
      
      toast({
        title: "Created Agency",
      });
      
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oppse!",
        description: "could not create your agency",
      });
    }
  };
  
  const handleDeleteAgency = async () => {
    if (!data?.id) return
    try {
      setDeletingAgency(true)
      await deleteAgency(data.id)
      toast({
        title: 'Deleted Agency',
        description: 'Deleted your agency and all subaccounts',
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete your agency',
      })
    } finally {
      setDeletingAgency(false)
    }
  }

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
          <CardDescription>
            Lets create an agency for your business. You can edit agency settings
            later from the agency settings tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="agencyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        endpoint="agencyLogo"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your agency name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Email</FormLabel>
                      <FormControl>
                        <Input readOnly placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="whiteLabel"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                    <div>
                      <FormLabel>Whitelabel Agency</FormLabel>
                      <FormDescription>
                        Turning on whitelabel mode will show your agency logo
                        to all sub accounts by default. You can overwrite this
                        functionality through sub account settings.
                      </FormDescription>
                    </div>
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
                name="address"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 st..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Zipcode</FormLabel>
                      <FormControl>
                        <Input placeholder="Zipcode" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {data?.id && (
                <div className="flex flex-col gap-2">
                  <FormLabel>Create A Goal</FormLabel>
                  <FormDescription>
                    ✨ Create a goal for your agency. As your business grows
                    your goals grow too so dont forget to set the bar higher!
                  </FormDescription>
                  <NumberInput
                    defaultValue={data?.goal}
                    onValueChange={async (val) => {
                      if (!data?.id) return
                      await updateAgencyDetails(data.id, { goal: val })
                      await saveActivityLogsNotification({
                        agencyId: data.id,
                        description: `Updated the agency goal to | ${val} Sub Account`,
                        subaccountId: undefined,
                      })
                      router.refresh()
                    }}
                    min={1}
                    className="bg-background !border !border-input"
                    placeholder="Sub Account Goal"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? <Loading /> : 'Save Agency Information'}
              </Button>
            </form>
          </Form>

          {data?.id && (
            <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
              <div>
                <div>Danger Zone</div>
              </div>
              <div className="text-muted-foreground">
                Deleting your agency cannot be undone. This will also delete all
                sub accounts and all data related to your sub accounts. Sub
                accounts will no longer have access to funnels, contacts etc.
              </div>
              <AlertDialogTrigger
                disabled={form.formState.isSubmitting || deletingAgency}
                className="text-red-600 p-2 text-center mt-2 rounded-md hover:bg-red-600 hover:text-white whitespace-nowrap"
              >
                {deletingAgency ? 'Deleting...' : 'Delete Agency'}
              </AlertDialogTrigger>
            </div>
          )}

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This action cannot be undone. This will permanently delete the
                Agency account and all related sub accounts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingAgency}
                className="bg-destructive hover:bg-destructive"
                onClick={handleDeleteAgency}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default AgencyDetails