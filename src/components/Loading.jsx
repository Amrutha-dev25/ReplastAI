import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Loading() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const nextUrl = new URLSearchParams(search).get('next');

  useEffect(() => {
    if (!nextUrl) return;
    const timer = setTimeout(() => navigate(`/${nextUrl}`), 1000);
    return () => clearTimeout(timer);
  }, [nextUrl, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-zinc-950">
      <div className="animate-spin rounded-full h-24 w-24 border-4 border-zinc-800 border-t-emerald-500" />
    </div>
  );
}
