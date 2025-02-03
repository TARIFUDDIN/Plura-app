'use client'

import ContactUserForm from '@/components/forms/contactUserForm'
import CustomModal from '@/components/global/custom-modal'
import { useModal } from '@/components/providers/ModalProvider'
import { Button } from '@/components/ui/button'

import React from 'react'

type Props = {
  subaccountId: string
}

const CraeteContactButton = ({ subaccountId }: Props) => {
  const { setOpen } = useModal()

  const handleCreateContact = async () => {
    setOpen(
      <CustomModal
        title="Create Or Update Contact information"
        subheading="Contacts are like customers."
      >
        <ContactUserForm subaccountId={subaccountId} />
      </CustomModal>
    )
  }

  return <Button onClick={handleCreateContact}>Create Contact</Button>
}

export default CraeteContactButton