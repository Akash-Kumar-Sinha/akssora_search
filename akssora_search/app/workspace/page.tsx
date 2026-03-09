"use client";

import { Header } from "@/components/Header";
import Upload from "@/components/upload";

const Workspace = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <Upload />
      </main>
      <img src="https://elasticbeanstalk-ap-south-1-140023393631.s3.amazonaws.com/images/1773006991_Screenshot.png"/>
    </div>
  );
};

export default Workspace;
