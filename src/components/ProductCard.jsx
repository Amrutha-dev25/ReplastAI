import React from 'react';
import { useNavigate } from 'react-router-dom';

const PLACEHOLDER = 'https://via.placeholder.com/400x225?text=No+Image';

export default function ProductCard({ item }) {
  const navigate = useNavigate();

  const imageUrl = item?.images?.[0] || PLACEHOLDER;
  const weight   = item?.weightKg != null ? Number(item.weightKg).toFixed(2) : 'N/A';

  return (
    <div
      onClick={() => navigate(`/listing/${item._id}`)}
      className="rounded-xl overflow-hidden group cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-200"
    >
      <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden border-b border-zinc-800/60">
        <img
          src={imageUrl}
          alt={item?.title || 'Material listing'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <span className="absolute top-3 left-3 px-2 py-0.5 bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-emerald-400 tracking-tight rounded">
          {item?.plasticType || 'Unknown'}
        </span>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold tracking-tight text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
          {item?.title || 'Untitled Listing'}
        </h3>
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800 font-mono text-[11px]">
          <span className="text-zinc-500">Weight:</span>
          <span className="text-zinc-300 font-medium">{weight} kg</span>
        </div>
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-zinc-500">Location:</span>
          <span className="text-zinc-300 truncate max-w-[120px]">{item?.location || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
}
