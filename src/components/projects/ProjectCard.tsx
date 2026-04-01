import React from 'react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <div 
      className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/10 rounded overflow-hidden cursor-pointer transition-all group active:scale-[0.98]"
      onClick={() => onClick(project.id)}
    >
      <div className="aspect-video bg-surface-container-lowest relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[0.6rem] font-mono text-white">
          {project.timeline.duration.toFixed(0)}s
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-bold text-on-surface truncate pr-2">{project.name}</h3>
          <span className="material-symbols-outlined text-on-surface-variant text-sm opacity-0 group-hover:opacity-100">more_vert</span>
        </div>
        <div className="flex items-center gap-2 text-[0.65rem] text-on-surface-variant">
          <span className="bg-secondary-container/30 text-secondary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
            {project.settings.resolution.width}x{project.settings.resolution.height}
          </span>
          <span>•</span>
          <span>{new Date(project.modifiedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
