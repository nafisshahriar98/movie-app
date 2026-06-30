function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-poster"></div>
            <div className="skeleton-info">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-line short"></div>
            </div>
        </div>
    );
}

export default SkeletonCard;