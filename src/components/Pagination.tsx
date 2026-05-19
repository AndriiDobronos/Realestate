import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const { language } = useLanguage();
    const contents = language === 'en' ? allEnTexts : allUaTexts;

    if (totalPages <= 1) return null;

    const pageLabel = contents.pagination.pageOf
        .replace('{current}', String(currentPage))
        .replace('{total}', String(totalPages));

    const pageNumbers = buildPageNumbers(currentPage, totalPages);

    return (
        <nav aria-label="pagination" className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            {/* Prev */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="min-h-[44px] min-w-[44px] px-4 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                {contents.pagination.prev}
            </button>

            {/* Page numbers — desktop only */}
            <div className="hidden md:flex items-center gap-1">
                {pageNumbers.map((item, idx) =>
                    item === '...' ? (
                        <span key={`ellipsis-${idx}`} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 select-none">
                            …
                        </span>
                    ) : (
                        <button
                            key={item}
                            onClick={() => onPageChange(item as number)}
                            className={`min-h-[44px] min-w-[44px] rounded-lg border font-medium transition-colors
                                ${currentPage === item
                                    ? '!bg-blue-600 !border-blue-600 text-white'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {item}
                        </button>
                    )
                )}
            </div>

            {/* Compact label — mobile only */}
            <span className="md:hidden min-h-[44px] flex items-center px-3 text-sm text-gray-600 font-medium select-none">
                {pageLabel}
            </span>

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="min-h-[44px] min-w-[44px] px-4 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                {contents.pagination.next}
            </button>
        </nav>
    );
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    const rangeStart = Math.max(2, current - 1);
    const rangeEnd = Math.min(total - 1, current + 1);

    if (rangeStart > 2) pages.push('...');

    for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
    }

    if (rangeEnd < total - 1) pages.push('...');

    pages.push(total);

    return pages;
}
