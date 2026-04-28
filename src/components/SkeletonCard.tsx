const SkeletonCard = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="animate-pulse bg-gray-300 rounded-2xl h-40 w-full mb-4 shadow-xl"></div>
            <div className="animate-pulse bg-gray-300 rounded-2xl h-40 w-full mb-4 shadow-xl"></div>
            <div className="animate-pulse bg-gray-300 rounded-2xl h-40 w-full mb-4 shadow-xl"></div>
        </div>
    );
};

export default SkeletonCard;
