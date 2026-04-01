"use client";

import React, { useRef, useState, useEffect, forwardRef } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, BookOpen, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
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

const PAGE_WIDTH = 420;
const PAGE_HEIGHT = 600;

// Every child of HTMLFlipBook MUST be a forwardRef div — no fragments
const FlipPage = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  (props, ref) => (
    <div ref={ref} style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, overflow: "hidden" }}>
      {props.children}
    </div>
  )
);
FlipPage.displayName = "FlipPage";

function splitTextIntoPages(text: string, charsPerPage = 900): string[] {
  const pages: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= charsPerPage) {
      pages.push(remaining.trim());
      break;
    }
    let cutIdx = remaining.lastIndexOf(". ", charsPerPage);
    if (cutIdx === -1 || cutIdx < charsPerPage * 0.4) cutIdx = charsPerPage;
    pages.push(remaining.substring(0, cutIdx + 1).trim());
    remaining = remaining.substring(cutIdx + 1);
  }
  return pages;
}

function buildPages(props: ReaderProps) {
  const { bookId, totalPages, title, author, coverImage, description, source } = props;
  const isApiBook = source === "api";
  const descPages = isApiBook
    ? splitTextIntoPages(description || "No preview text available for this book.", 700)
    : [];

  const allPages: React.ReactNode[] = [];

  // Cover page
  allPages.push(
    <FlipPage key="cover">
      <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center p-8 text-center">
        {coverImage ? (
          <img src={coverImage} alt={title} className="w-32 h-48 object-cover rounded-lg shadow-xl ring-1 ring-white/20 mb-4" />
        ) : (
          <div className="w-32 h-48 bg-white/10 rounded-lg flex items-center justify-center mb-4">
            <BookOpen size={48} className="text-white/50" />
          </div>
        )}
        <h2 className="text-lg font-bold text-white mt-2 max-w-[280px] line-clamp-3">{title}</h2>
        <p className="text-white/60 text-sm mt-2">{author || "Unknown Author"}</p>
        <p className="text-white/30 text-xs mt-4">{totalPages} pages</p>
      </div>
    </FlipPage>
  );

  if (isApiBook) {
    // Text preview pages with proper sizing
    descPages.forEach((text, i) => {
      allPages.push(
        <FlipPage key={`desc-${i}`}>
          <div className="w-full h-full bg-[#faf8f3] flex flex-col" style={{ padding: "24px 20px 16px" }}>
            {i === 0 && (
              <div style={{ marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: 0 }}>Book Preview</h3>
                <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 0" }}>Content from Google Books</p>
              </div>
            )}
            <div style={{
              flex: 1,
              overflow: "hidden",
              fontSize: 13,
              lineHeight: 1.7,
              color: "#374151",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "'Georgia', 'Times New Roman', serif",
            }}>
              {text}
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 8, flexShrink: 0 }}>
              — {i + 1} —
            </div>
          </div>
        </FlipPage>
      );
    });

    // End page with Google Books viewer link
    allPages.push(
      <FlipPage key="end-info">
        <div className="w-full h-full bg-[#faf8f3] flex flex-col items-center justify-center text-center gap-4 p-8">
          <BookOpen size={48} className="text-indigo-400" />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>Read Full Book</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 260 }}>
            Open Google Books to read the complete book with all pages for free.
          </p>
          <a
            href={`https://books.google.com/books?id=${bookId}&printsec=frontcover`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <ExternalLink size={16} />
            Read on Google Books
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
            <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#9ca3af" }}>
              — {i} —
            </div>
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
  const { title, author, source, bookId } = props;
  const bookRef = useRef<any>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [useEmbedded, setUseEmbedded] = useState(false);

  const pages = buildPages(props);
  const displayTotalPages = pages.length;

  const onPage = (e: any) => setCurrentPage(e.data);
  const nextPage = () => bookRef.current?.pageFlip()?.flipNext();
  const prevPage = () => bookRef.current?.pageFlip()?.flipPrev();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "Escape") setIsFullScreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // For API books, offer an embedded Google Books viewer for full-page reading
  if (useEmbedded && source === "api") {
    return (
      <div className="fixed inset-0 z-50 bg-[#1a1a2e] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-md border-b border-white/10">
          <button
            onClick={() => setUseEmbedded(false)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium hidden sm:inline">Back to Flipbook</span>
          </button>
          <h1 className="text-sm font-bold text-white/90 line-clamp-1 max-w-[200px]">{title}</h1>
          <div className="w-20" />
        </div>

        {/* Google Books Embedded Viewer */}
        <div className="flex-1 w-full">
          <iframe
            src={`https://books.google.com/books?id=${bookId}&lpg=PP1&pg=PP1&output=embed`}
            className="w-full h-full border-0"
            allowFullScreen
            title={`${title} - Full Book`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullScreen ? "fixed inset-0 z-50" : "min-h-screen"} bg-gradient-to-b from-[#2d2d3f] to-[#1a1a2e] flex flex-col items-center`}>
      {/* Header — App-like dark immersive */}
      <div className="w-full bg-black/30 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => isFullScreen ? setIsFullScreen(false) : router.push("/library")}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium text-sm hidden sm:inline">{isFullScreen ? "Exit" : "Library"}</span>
        </button>
        <div className="text-center flex-1 mx-4">
          <h1 className="text-sm font-bold text-white/90 line-clamp-1">{title}</h1>
          {author && <p className="text-[10px] text-white/40">{author}</p>}
        </div>
        <div className="flex items-center gap-2">
          {source === "api" && (
            <button
              onClick={() => setUseEmbedded(true)}
              className="flex items-center gap-1.5 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Full Book</span>
            </button>
          )}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Reader */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex items-center justify-center py-6 px-4 relative">
        <button
          onClick={prevPage}
          className="absolute left-1 md:left-6 z-10 p-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white/60 hover:text-white hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/10">
          {/* @ts-ignore -- react-pageflip types */}
          <HTMLFlipBook
            width={PAGE_WIDTH}
            height={PAGE_HEIGHT}
            size="fixed"
            minWidth={280}
            maxWidth={480}
            minHeight={380}
            maxHeight={660}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onPage}
            className="flip-book"
            ref={bookRef}
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={700}
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
          className="absolute right-1 md:right-6 z-10 p-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white/60 hover:text-white hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Progress Footer */}
      <div className="fixed bottom-4 bg-black/60 backdrop-blur-md text-white px-5 py-2 rounded-full text-xs font-medium shadow-xl flex items-center gap-3">
        <span>Page {currentPage + 1} of {displayTotalPages}</span>
        {source === "api" && (
          <button
            onClick={() => setUseEmbedded(true)}
            className="text-indigo-300 hover:text-indigo-200 transition-colors flex items-center gap-1"
          >
            Read Full <ExternalLink size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
