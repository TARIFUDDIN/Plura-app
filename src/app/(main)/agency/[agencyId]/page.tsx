import { constructMetadata } from "@/lib/utils";
import React from "react";

const Page = async ({ params }: { params: { agencyId: string } }) => {
  // Await params to ensure it's resolved before use
  const { agencyId } = await params;

  return <div>{agencyId}</div>;
};

export default Page;

export const metadata = constructMetadata({
  title: "Dashboard - Plura",
});
