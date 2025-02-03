
import BlurPage from '@/components/common/BlurPage'
import React from 'react'

const PipelinesLayout = ({ children }: { children: React.ReactNode }) => {
  return <BlurPage>{children}</BlurPage>
}

export default PipelinesLayout