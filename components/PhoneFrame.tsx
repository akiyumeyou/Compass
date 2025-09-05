
import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="relative mx-auto border-gray-800 bg-gray-800 border-[10px] rounded-[2.5rem] h-[800px] w-[375px] shadow-2xl">
      <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
      <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[13px] top-[100px] rounded-l-lg"></div>
      <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[13px] top-[158px] rounded-l-lg"></div>
      <div className="h-[54px] w-[3px] bg-gray-800 absolute -right-[13px] top-[120px] rounded-r-lg"></div>
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-black">
        {children}
      </div>
    </div>
  );
};

export default PhoneFrame;
