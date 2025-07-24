'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import {
  type Plan,
  type Agency,
  type Contact,
  type User,
} from "@prisma/client";
import type { PricesList, TicketDetails } from '@/lib/types';

export interface ModalData {
  user?: User;
  agency?: Agency;
  contact?: Contact;
  ticket?: TicketDetails[0];
  plans?: {
    defaultPriceId: Plan;
    plans: PricesList["data"];
  };
}

type ModalContextType = {
  data: ModalData
  isOpen: boolean
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<ModalData>) => void
  setClose: () => void
}

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: () => {}, // ✅ FIXED: Removed unused parameters
  setClose: () => {},
})

export const ModalProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<ModalData>({})
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setOpen: ModalContextType["setOpen"] = async (modal, fetch) => {
    if (modal) {
      if (fetch) {
        const newData = await fetch();
        setData(Object.assign({}, data, newData || {}));
      }
      setShowingModal(modal)
      setIsOpen(true)
    }
  };

  const setClose = () => {
    setIsOpen(false);
    setData({});
  };

  return (
    <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }}>
      {children}
      {isMounted && showingModal}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within the modal provider')
  }
  return context
}

export default ModalProvider