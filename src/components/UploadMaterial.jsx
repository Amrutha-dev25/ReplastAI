import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext.jsx';

export default function UploadMaterial() {
  const navigate = useNavigate();
  const { backendUrl, authHeaders } = useAppContext();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    plasticType: 'PET (1)',
    condition: 'Clean Flakes',
    weightKg: '',
    price: '',
    location: '',
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [cvResult, setCvResult] = useState(null);
  const [cvError, setCvError] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: files }));
    setCvResult(null);
    setCvError(null);
 
    // Simulate Computer Vision Classification immediately if image is selected
    if (files.length > 0) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          const { data } = await axios.post(
            `${backendUrl}/api/ai/classify`,
            { image: base64Image },
            authHeaders
          );
          if (data) {
            setCvResult(data);
            // Autofill classified fields
            setFormData(prev => ({
              ...prev,
              plasticType: data.predictedClass || prev.plasticType,
              condition: data.conditionAssessment || prev.condition
            }));
          }
        } catch (err) {
          console.error('Computer Vision classification failed:', err);
          const errorMsg = err.response?.data?.error || 'Classification failed. Please ensure the image is not corrupted or too large.';
          setCvError(errorMsg);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('plasticType', formData.plasticType);
    submitData.append('condition', formData.condition);
    submitData.append('weightKg', formData.weightKg);
    submitData.append('price', formData.price);
    submitData.append('location', formData.location);
    formData.images.forEach(image => {
      submitData.append('images', image);
    });

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/listings/add`,
        submitData,
        {
          headers: {
            ...authHeaders.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data.success) {
        alert('Material listed successfully!');
        navigate('/dashboard');
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      console.error('Error uploading material:', err);
      alert('An error occurred. Check connection to API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Form Details */}
      <form onSubmit={handleSubmit} className="md:col-span-8 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-zinc-100">Supply Pipeline Input</h2>
          <p className="text-xs text-zinc-500">Inject high-purity plastic assets into the direct procurement grid.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Asset Stream Title</label>
            <input
              type="text" name="title" required value={formData.title} onChange={handleChange}
              placeholder="e.g. Wash-crushed PET Flakes"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Melt Designation / Polymer Type</label>
            <select
              name="plasticType" value={formData.plasticType} onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="PET (Type 1)">PET (Type 1)</option>
              <option value="HDPE (Type 2)">HDPE (Type 2)</option>
              <option value="PVC (Type 3)">PVC (Type 3)</option>
              <option value="LDPE (Type 4)">LDPE (Type 4)</option>
              <option value="PP (Type 5)">PP (Type 5)</option>
              <option value="PS (Type 6)">PS (Type 6)</option>
              <option value="Other (Type 7)">Other (Type 7)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Contaminant & Structural Rating</label>
            <input
              type="text" name="condition" value={formData.condition} onChange={handleChange}
              placeholder="e.g. Wash-crushed flakes, capless"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Net Scale Weight (kg)</label>
            <input
              type="number" name="weightKg" required value={formData.weightKg} onChange={handleChange}
              placeholder="e.g. 1500"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Target Base Price ($/kg)</label>
            <input
              type="number" step="0.01" name="price" required value={formData.price} onChange={handleChange}
              placeholder="e.g. 0.95"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Warehouse / Freight Origin</label>
            <input
              type="text" name="location" required value={formData.location} onChange={handleChange}
              placeholder="e.g. Seattle Warehouse Terminal B"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Supply Stream Details</label>
            <textarea
              name="description" rows={3} value={formData.description} onChange={handleChange}
              placeholder="Detail chemical treatment, collection parameters..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-mono text-xs font-bold uppercase rounded-xl transition-all"
        >
          {loading ? 'Processing Transaction Assets...' : 'Inject Stock Registry'}
        </button>
      </form>

      {/* Right Column Camera classification telemetry */}
      <div className="md:col-span-4 space-y-6">
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">// COMPUTER VISION PORT</div>
          <h3 className="text-sm font-bold text-zinc-200">Polymer Classification Scan</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Attach high-definition photos. The REPLAST computer vision neural engine will scan, categorize, and verify your structural polymers instantly.
          </p>

          <input
            type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
          >
            <span className="text-2xl group-hover:scale-115 transition-transform">📸</span>
            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-300">ACTIVATE CAPTURE SENSOR</span>
          </button>

          {formData.images.length > 0 && (
            <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
              <img
                src={URL.createObjectURL(formData.images[0])} alt="Telemetry source"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {cvResult && (
            <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Classified Polymer:</span>
                <span>{cvResult.predictedClass}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Neural Match Match:</span>
                <span>{(cvResult.confidenceRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Grade Status:</span>
                <span>{cvResult.conditionAssessment}</span>
              </div>
              <div className="text-[9px] text-zinc-500 leading-tight border-t border-zinc-800/80 pt-2">
                Processed via model: {cvResult.neuralModelUsed}
              </div>
            </div>
          )}

          {cvError && (
            <div className="bg-rose-950/25 border border-rose-900/40 p-4 rounded-xl space-y-2 font-mono text-xs text-rose-400 leading-normal">
              <div className="font-bold flex items-center gap-1">
                <span>⚠️</span>
                <span>Neural Scan Interrupted</span>
              </div>
              <p className="text-[11px] text-zinc-400">{cvError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
