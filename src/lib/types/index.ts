import type {
    Contact,
    Lane,
    Notification,
    Prisma,
    Tag,
    Ticket,
    User,
    SubAccount,
    Role,
  } from "@prisma/client";
import type { _getTicketsWithAllRelations, getAuthUserDetails, getFunnels, getMedia, getPipelineDetails, getTicketsWithTags, getUserPermissions } from "../queries";
import { z } from 'zod'
import Stripe from 'stripe'

export type NotificationsWithUser =
  | ({ User: User } & Notification)[]
  | undefined;

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>

// ✅ FIXED: Properly define the user type without Promise wrapper
export type UsersWithAgencySubAccountPermissionsSidebarOptions = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
  agencyId: string | null;
  Agency: {
    id: string;
    connectAccountId: string;
    customerId: string;
    name: string;
    agencyLogo: string;
    companyEmail: string;
    companyPhone: string;
    whiteLabel: boolean;
    address: string;
    city: string;
    zipCode: string;
    state: string;
    country: string;
    goal: number;
    createdAt: Date;
    updatedAt: Date;
    SubAccount: SubAccount[];
  } | null;
  Permissions: Array<{
    id: string;
    email: string;
    subAccountId: string;
    access: boolean;
    SubAccount: SubAccount;
  }>;
} | null

export type AuthUserWithAgencySigebarOptionsSubAccounts =
  Prisma.PromiseReturnType<typeof getAuthUserDetails>

export type CreateMediaType = Prisma.MediaCreateWithoutSubaccountInput
export type GetMediaFiles = Prisma.PromiseReturnType<typeof getMedia>

// ✅ FIXED: Updated TicketAndTags to use number instead of Decimal
export type TicketAndTags = Omit<Ticket, 'value'> & {
  value: number | null  // Changed from Decimal to number
  Tags: Tag[]
  Assigned: User | null
  Customer: Contact | null
}

// ✅ FIXED: Updated LaneDetail to use the new TicketAndTags type
export type LaneDetail = Lane & {
  Tickets: TicketAndTags[]
}

export const CreatePipelineFormSchema = z.object({
  name: z.string().min(1)
})

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
})

export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<
  typeof getPipelineDetails
>

export const LaneFormSchema = z.object({
  name: z.string().min(1),
})

// ✅ FIXED: Updated TicketDetails to match the query return type
export type TicketDetails = Prisma.PromiseReturnType<
  typeof _getTicketsWithAllRelations
>

export const ContactUserFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
})

// ✅ FIXED: Updated TicketWithTags to match the query return type  
export type TicketWithTags = Prisma.PromiseReturnType<typeof getTicketsWithTags>

export type Address = {
  city: string
  country: string
  line1: string
  postal_code: string
  state: string
}

export type ShippingInfo = {
  address: Address
  name: string
}

export const currencyNumberRegex = /^\d+(\.\d{1,2})?$/

export const TicketFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.string().refine((value) => currencyNumberRegex.test(value), {
    message: 'Value must be a valid price.',
  }),
})

export type StripeCustomerType = {
  email: string
  name: string
  shipping: ShippingInfo
  address: Address
}

export type PricesList = Stripe.ApiList<Stripe.Price>

export type FunnelsForSubAccount = Prisma.PromiseReturnType<
  typeof getFunnels
>[0]

export type UpsertFunnelPage = Prisma.FunnelPageCreateWithoutFunnelInput

export const FunnelPageSchema = z.object({
  name: z.string().min(1),
  pathName: z.string().optional(),
})

// ✅ ADDED: ModalData type to fix the modal error
export type ModalData = {
  user?: {
    id: string;
    role: Role;
    name: string;
    avatarUrl: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    agencyId: string | null;
  } | undefined; // Keep as undefined to match expected type
}