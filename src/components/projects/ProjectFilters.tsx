import React from 'react';

const ProjectFilters: React.FC = () => {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="relative flex-1 max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input 
          type="text" 
          placeholder="Search projects..." 
          className="w-full bg-surface-container-high border border-outline-variant/20 rounded-full pl-10 pr-4 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant active:scale-95">
          <span className="material-symbols-outlined text-lg">filter_list</span>
        </button>
        <button className="p-1.5 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant active:scale-95">
          <span className="material-symbols-outlined text-lg">grid_view</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectFilters;
