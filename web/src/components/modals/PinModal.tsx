import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CATEGORIES } from '../../constants';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: string;
  pinTitle: string;
  setPinTitle: (title: string) => void;
  pinDescription: string;
  setPinDescription: (desc: string) => void;
  pinCategory: string;
  setPinCategory: (cat: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}


export const PinModal = ({
  isOpen,
  onClose,
  address,
  pinTitle,
  setPinTitle,
  pinDescription,
  setPinDescription,
  pinCategory,
  setPinCategory,
  onSubmit
}: PinModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Navigation className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-800 tracking-tight">Save Location</h2>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Create a custom marker</p>
              </div>
            </div>

            {address && (
              <p className="text-xs text-emerald-600 font-medium mb-8 px-1">{address}</p>
            )}
            
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Pin Title</label>
                <input 
                  type="text" 
                  value={pinTitle}
                  onChange={(e) => setPinTitle(e.target.value)}
                  className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-stone-800"
                  placeholder="e.g., My Favorite Cafe"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Description (Optional)</label>
                <textarea 
                  value={pinDescription}
                  onChange={(e) => setPinDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-stone-800 h-24 resize-none"
                  placeholder="Add some details about this place..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPinCategory(cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all group",
                        pinCategory === cat.id 
                          ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200" 
                          : "bg-white border-stone-100 hover:border-stone-200"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110",
                        cat.color
                      )}>
                        <cat.icon className="w-4 h-4" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-tight",
                        pinCategory === cat.id ? "text-emerald-600" : "text-stone-400"
                      )}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all text-sm"
                >
                  Save Pin
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
