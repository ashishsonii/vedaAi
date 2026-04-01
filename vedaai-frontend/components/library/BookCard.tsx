"use client"

import React from "react";
import { Book as BookIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  source: string;
  totalPages: number;
}

export default function BookCard({ id, title, author, coverImage, source, totalPages }: BookCardProps) {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(`/library/${id}`)}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group flex flex-col h-full"
    >
      <div className="relative w-full aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden mb-4 flex-shrink-0">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <BookIcon size={48} className="opacity-20" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-medium">
          {source === "upload" ? "PDF" : "API"}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">{title}</h3>
        <p className="text-sm text-gray-500 line-clamp-1">{author}</p>
        
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>{totalPages} Pages</span>
        </div>
      </div>
    </div>
  );
}
