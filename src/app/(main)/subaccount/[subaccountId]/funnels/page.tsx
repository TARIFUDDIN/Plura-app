import React from "react";
import { PlusCircle } from "lucide-react";

import { getFunnels } from "@/lib/queries";

import FunnelForm from '@/components/forms/funnel-form'
import BlurPage from "@/components/common/BlurPage";
import FunnelsDataTable from "./data-table";
import { columns } from "./columns";
import { constructMetadata } from "@/lib/utils";

interface FunnelsPageProps {
  params: Promise<{
    subaccountId: string;
  }>;
}

const FunnelsPage: React.FC<FunnelsPageProps> = async ({ params }) => {
  // Await params before using its properties
  const { subaccountId } = await params;
  
  const funnels = await getFunnels(subaccountId);

  if (!funnels) return null;

  return (
    <BlurPage>
      <FunnelsDataTable
        actionButtonText={
          <>
            <PlusCircle className="w-4 h-4" />
            Create Funnel
          </>
        }
        modalChildren={<FunnelForm subAccountId={subaccountId} />}
        filterValue="name"
        columns={columns}
        data={funnels}
      />
    </BlurPage>
  );
};

export default FunnelsPage;

export const metadata = constructMetadata({
  title: "Funnels - Plura",
});