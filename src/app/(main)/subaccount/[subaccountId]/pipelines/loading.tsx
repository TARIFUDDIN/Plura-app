import Loading from "@/components/global/loading";
import React from "react";


const PipelinesLoading: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Loading />
    </div>
  );
};

export default PipelinesLoading;