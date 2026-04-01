"use client";

import React, { useRef, useState, useEffect, forwardRef } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import { useRouter } from "next/navigation";
import { API_URL } from "../../app/lib/api";

interface ReaderProps {
  bookId: string;
  totalPages: number;
  title: string;
  author?: string;
  coverImage?: string;
  description?: string;
  source?: string;
}

const PAGE_WIDTH = 450;
const PAGE_HEIGHT = 650;

// Every child of HTMLFlipBook MUST be a forwardRef div — no fragments
const FlipPage = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  (props, ref) => (
    <div ref={ref} style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, overflow: "hidden" }}>
      {props.children}
    </div>
  )
);
FlipPage.displayName = "FlipPage";

function splitTextIntoPages(text: string, charsPerPage = 1200): string[] {
  const pages: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= charsPerPage) {
      pages.push(remaining.trim());
      break;
    }
    let cutIdx = remaining.lastIndexOf(". ", charsPerPage);
    if (cutIdx === -1 || cutIdx < charsPerPage * 0.5) cutIdx = charsPerPage;
    pages.push(remaining.substring(0, cutIdx + 1).trim());
    remaining = remaining.substring(cutIdx + 1);
  }
  return pages;
}

function buildPages(props: ReaderProps) {
  const { bookId, totalPages, title, author, coverImage, description, source } = props;
  const isApiBook = source === "api";
  const descPages = isApiBook
    ? splitTextIntoPages(description || "No preview text available for this book.", 800)
    : [];

  const allPages: React.ReactNode[] = [];

  // Cover page
  allPages.push(
    <FlipPage key="cover">
      <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center p-8 text-center">
        {coverImage ? (
          <img src={coverImage} alt={title} className="w-36 h-52 object-cover rounded-lg shadow-xl ring-1 ring-white/20 mb-4" />
        ) : (
          <div className="w-36 h-52 bg-white/10 rounded-lg flex items-center justify-center mb-4">
            <BookOpen size={48} className="text-white/50" />
          </div>
        )}
        <h2 className="text-xl font-bold text-white mt-2 max-w-[300px] line-clamp-3">{title}</h2>
        <p className="text-white/60 text-sm mt-2">{author || "Unknown Author"}</p>
        <p className="text-white/30 text-xs mt-4">{totalPages} pages</p>
      </div>
    </FlipPage>
  );

  if (isApiBook) {
    // Text preview pages
    descPages.forEach((text, i) => {
      allPages.push(
        <FlipPage key={`desc-${i}`}>
          <div className="w-full h-full bg-[#fefdf8] p-6 overflow-hidden flex flex-col">
            {i === 0 && (
              <div className="mb-3 pb-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-base font-bold text-gray-900 mb-0.5">Book Preview</h3>
                <p className="text-[10px] text-gray-400">Content sourced from Google Books API</p>
              </div>
            )}
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap flex-1 overflow-hidden">{text}</p>
            <div className="text-center text-xs text-gray-400 font-serif mt-2 flex-shrink-0">— {i + 1} —</div>
          </div>
        </FlipPage>
      );
    });

    // End page with link
    allPages.push(
      <FlipPage key="end-info">
        <div className="w-full h-full bg-[#fefdf8] flex flex-col items-center justify-center text-center gap-4 p-8">
          <BookOpen size={48} className="text-indigo-400" />
          <h3 className="text-lg font-bold text-gray-900">Preview Ends Here</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            This is a preview from Google Books. The full text may not be available via the API.
          </p>
          <a
            href={`https://books.google.com/books?id=${bookId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <ExternalLink size={16} />
            View on Google Books
          </a>
        </div>
      </FlipPage>
    );
  } else {
    // Uploaded PDF image pages
    for (let i = 1; i <= totalPages; i++) {
      allPages.push(
        <FlipPage key={`page-${i}`}>
          <div className="w-full h-full bg-white flex items-center justify-center relative">
            <img
              src={`${API_URL}/api/books/${bookId}/pages/${i}`}
              alt={`Page ${i}`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
            <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-gray-400 font-serif">— {i} —</div>
          </div>
        </FlipPage>
      );
    }
  }

  // Back cover
  allPages.push(
    <FlipPage key="back-cover">
      <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center text-center gap-3">
        <BookOpen size={48} className="text-white/40" />
        <p className="text-white/50 text-sm font-medium">End of Book</p>
      </div>
    </FlipPage>
  );

  return allPages;
}

export default function Reader(props: ReaderProps) {
  const { title, author, source } = props;
  const bookRef = useRef<any>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const pages = buildPages(props);
  const displayTotalPages = pages.length;

  const onPage = (e: any) => setCurrentPage(e.data);
  const nextPage = () => bookRef.current?.pageFlip()?.flipNext();
  const prevPage = () => bookRef.current?.pageFlip()?.flipPrev();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white/90 backdrop-blur-lg border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <button
          onClick={() => router.push("/library")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium hidden sm:inline">Back to Library</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{title}</h1>
          {author && <p className="text-xs text-gray-500">{author}</p>}
        </div>
        <div className="w-24" />
      </div>

      {/* Reader */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex items-center justify-center py-8 px-4 relative">
        <button
          onClick={prevPage}
          className="absolute left-2 md:left-8 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700 hover:text-indigo-600 hover:scale-110 transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="shadow-2xl rounded-xl overflow-hidden ring-1 ring-black/10">
          {/* @ts-ignore -- react-pageflip types don't perfectly match React 19 */}
          <HTMLFlipBook
            width={PAGE_WIDTH}
            height={PAGE_HEIGHT}
            size="fixed"
            minWidth={300}
            maxWidth={500}
            minHeight={400}
            maxHeight={700}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onPage}
            className="flip-book"
            ref={bookRef}
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={800}
            usePortrait={true}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {pages}
          </HTMLFlipBook>
        </div>

        <button
          onClick={nextPage}
          className="absolute right-2 md:right-8 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700 hover:text-indigo-600 hover:scale-110 transition-all active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Progress Footer */}
      <div className="fixed bottom-6 bg-gray-900/80 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-xl flex items-center gap-3">
        <span>Page {currentPage + 1} of {displayTotalPages}</span>
        {source === "api" && <span className="text-white/40">• Preview</span>}
      </div>
    </div>
  );
}
