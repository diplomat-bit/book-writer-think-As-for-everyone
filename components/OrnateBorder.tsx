
import React from 'react';

export const OrnateBorder: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-12 parchment-base relative min-h-[85vh] p-8 md:p-16">
      {/* Decorative Borders */}
      <div className="absolute inset-4 border-2 border-red-900 opacity-20 pointer-events-none" />
      <div className="absolute inset-6 border border-red-900 opacity-10 pointer-events-none" />
      
      {/* Ornate Corners */}
      <div className="ornate-corner top-left" />
      <div className="ornate-corner top-right" />
      <div className="ornate-corner bottom-left" />
      <div className="ornate-corner bottom-right" />
      
      {/* Header Accent */}
      <div className="flex justify-center mb-8 no-print">
        <div className="h-[1px] w-24 bg-red-900 opacity-30 self-center" />
        <span className="mx-4 font-formal text-[10px] tracking-[0.5em] text-red-900 uppercase opacity-60">Sacred Manuscript</span>
        <div className="h-[1px] w-24 bg-red-900 opacity-30 self-center" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
