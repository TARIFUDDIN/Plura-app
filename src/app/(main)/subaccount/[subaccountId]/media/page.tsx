import BlurPage from '@/components/common/BlurPage';
import MediaComponent from '@/components/media';
import { getMedia } from '@/lib/queries';
import React from 'react';

type Props = {
  params: Promise<{ subaccountId: string }>;
};

const MediaPage = async ({ params }: Props) => {
  // Await params before using its properties
  const { subaccountId } = await params;

  if (!subaccountId) {
    throw new Error('subaccountId is missing or undefined.');
  }

  const data = await getMedia(subaccountId);

  return (
    <BlurPage>
      <MediaComponent data={data} subaccountId={subaccountId} />
    </BlurPage>
  );
};

export default MediaPage;