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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <button
        onClick={handleSelectDirectory}
        style={{
          paddingTop: "10px",
          paddingBottom: "10px",
          paddingLeft: "25px",
          paddingRight: "25px",
        }}
      >
        Open
      </button>
    </div>
  );
};

export default DirectorySelector;
