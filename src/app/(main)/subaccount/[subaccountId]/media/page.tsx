import BlurPage from '@/components/common/BlurPage';
import MediaComponent from '@/components/media';
import { getMedia } from '@/lib/queries';
import React from 'react';

type Props = {
  params: { subaccountId: string };
};

const MediaPage = async ({ params }: Props) => {
  const subaccountId = await Promise.resolve(params?.subaccountId); // Ensure async resolution

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
