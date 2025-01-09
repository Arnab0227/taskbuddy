import React from "react";

const SkeletonLoader: React.FC = () => {
  return (
    <div className="animate-pulse mt-16 mx-2">
      <div className="mb-4 flex justify-end items-center">
        <div className="bg-gray-300 h-10 w-24 rounded-full"></div>
      </div>
      <div className="mb-4 mx-3">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="flex space-x-3 items-center pt-2">
          <div className="bg-gray-300 h-10 w-32 rounded-full"></div>
          <div className="bg-gray-300 h-10 w-32 rounded-full"></div>
        </div>
      </div>
      <div className="flex items-center mb-4 mx-3">
        <div className="bg-gray-300 h-10 w-full rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-lg p-4">
            <div className="bg-gray-300 h-6 w-1/3 rounded mb-4"></div>
            {[...Array(3)].map((_, taskIndex) => (
              <div key={taskIndex} className="flex items-center gap-2 mb-3">
                <div className="bg-gray-300 h-4 w-4 rounded"></div>
                <div className="bg-gray-300 h-4 w-full rounded"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
