import React from "react";
import { open } from "@tauri-apps/plugin-dialog";

interface DirectorySelectorProps {
  onSelectDirectory: (dir: string) => void;
}

const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  onSelectDirectory,
}) => {
  const handleSelectDirectory = async () => {
    try {
      const dir = await open({
        directory: true,
        multiple: false,
        title: "Open",
      });

      if (typeof dir === "string") {
        onSelectDirectory(dir);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <button onClick={handleSelectDirectory}>Open</button>
    </div>
  );
};

export default DirectorySelector;
