'use client'

import SubAccountDetails from '@/components/forms/SubAccountDetails'
import CustomModal from '@/components/global/custom-modal'
import { useModal } from '@/components/providers/ModalProvider'
import { Button } from '@/components/ui/button'

import { Agency, AgencySidebarOption, SubAccount, User } from '@prisma/client'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  user: User & {
    Agency:
      | (
          | Agency
          | (null & {
              SubAccount: SubAccount[]
              SideBarOption: AgencySidebarOption[]
            })
        )
      | null
  }
  id: string  // Add this line - this is the agencyId being passed from parent
  className: string
}

const CreateSubaccountButton = ({ className, user, id }: Props) => {
  const { setOpen } = useModal()
  const agencyDetails = user.Agency

  if (!agencyDetails) return

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a Subaccount"
            subheading="You can switch bettween"
          >
            <SubAccountDetails
              agencyDetails={agencyDetails}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>
        )
      }}
    >
      <PlusCircleIcon size={15} />
      Create Sub Account
    </Button>
  )
}

export default CreateSubaccountButton