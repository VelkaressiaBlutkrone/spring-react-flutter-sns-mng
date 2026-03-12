import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  mapTypeId: "ROADMAP" | "HYBRID";
  setMapTypeId: (type: "ROADMAP" | "HYBRID") => void;
}

export const SettingsOverlay = ({
  isOpen,
  onClose,
  mapTypeId,
  setMapTypeId
}: SettingsOverlayProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-24 right-8 z-20 w-80 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-stone-800 flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4 text-emerald-600" />
              Map Settings
            </h3>
            <button onClick={onClose}>
              <X className="w-4 h-4 text-stone-400 hover:text-stone-600" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Map View</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setMapTypeId("ROADMAP")}
                  className={cn(
                    "py-3 rounded-2xl text-xs font-bold transition-all border",
                    mapTypeId === "ROADMAP" 
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200" 
                      : "bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100"
                  )}
                >
                  Roadmap
                </button>
                <button 
                  onClick={() => setMapTypeId("HYBRID")}
                  className={cn(
                    "py-3 rounded-2xl text-xs font-bold transition-all border",
                    mapTypeId === "HYBRID" 
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200" 
                      : "bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100"
                  )}
                >
                  Satellite
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Display Options</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <span className="text-xs font-medium text-stone-600">Show Markers</span>
                  <div className="w-10 h-5 bg-emerald-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <span className="text-xs font-medium text-stone-600">Dark Mode</span>
                  <div className="w-10 h-5 bg-stone-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
