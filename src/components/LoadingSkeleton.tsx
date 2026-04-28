import SkeletonCard from "./SkeletonCard";

const LoadingSkeleton = () => {
    return (
        <div className="p-4">
            {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
};

export default LoadingSkeleton;
