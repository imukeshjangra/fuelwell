'use client';
import { useEffect } from 'react';
export default function AdSlot({ slot = '0000000000', minHeight = 250 }: { slot?: string; minHeight?: number }) {
  const id = process.env.NEXT_PUBLIC_ADSENSE_ID;
  useEffect(() => { if (id) try { ((window as any).adsbygoogle ||= []).push({}); } catch {} }, [id]);
  if (!id) return null; // nothing is shown to visitors until AdSense is configured
  return <div style={{ minHeight }} className="my-8"><p className="mb-1 text-center text-[10px] uppercase tracking-widest text-ink/40">Advertisement</p><ins className="adsbygoogle block" data-ad-client={id} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" /></div>;
}
