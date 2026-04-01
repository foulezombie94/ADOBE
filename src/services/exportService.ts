export interface ExportConfig {
  fileName: string;
  format: string;
  preset: string;
  resolution: string;
  frameRate: string;
}

export const exportProject = async (
  projectData: any,
  onProgress: (p: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Finalize export
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectData.metadata.name}.obsidian`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        resolve();
      }
    }, 50);
  });
};
