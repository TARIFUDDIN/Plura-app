'use client'

import SubAccountDetails from '@/components/forms/SubAccountDetails'
import CustomModal from '@/components/global/custom-modal'
import { useModal } from '@/components/providers/ModalProvider'
import { Button } from '@/components/ui/button'
import { Agency, AgencySidebarOption, SubAccount, User } from '@prisma/client'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'
import { twMerge } from 'tailwind-merge'

// Improved type definition with proper relationship handling
type UserWithAgency = User & {
  Agency: (Agency & {
    SubAccount: SubAccount[]
    SidebarOption: AgencySidebarOption[]
  }) | null
}

type Props = {
  user: UserWithAgency
  agencyId: string // Renamed from 'id' for clarity
  className?: string // Made optional with default
}

const CreateSubaccountButton: React.FC<Props> = ({ 
  className = '',
  user,
}) => {
  const { setOpen } = useModal()
   
  // Guard clause with better error handling
  if (!user.Agency) {
    console.warn('CreateSubaccountButton: No agency found for user')
    return null
  }

  const handleCreateSubAccount = () => {
    setOpen(
      <CustomModal
        title="Create a Subaccount"
        subheading="You can switch between subaccounts to manage different clients"
      >
        <SubAccountDetails
          agencyDetails={user.Agency!} // Non-null assertion is safe here due to guard clause
          userId={user.id}
          userName={user.name}
          // Removed agencyId prop - it's not accepted by SubAccountDetails
        />
      </CustomModal>
    )
  }

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={handleCreateSubAccount}
      type="button"
      variant="default"
    >
      <PlusCircleIcon size={15} />
      Create Sub Account
    </Button>
  )
}

export default CreateSubaccountButton