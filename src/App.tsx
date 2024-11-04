import React, { useEffect, useState } from "react";
import DirectorySelector from "./components/DirectorySelector";
import Layout from "./components/Layout";
import { format, parse, query } from "kdljs";
import { BaseDirectory, join } from "@tauri-apps/api/path";
import { exists, mkdir, readTextFile, writeFile } from "@tauri-apps/plugin-fs";

const App: React.FC = () => {
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const [config, setConfig] = useState<string | null>(null);

  const readConfig = async () => {
    const configPath = await join("journalio", "config.kdl");
    console.log("configPath:", configPath);
    let content = "";
    if (await exists(configPath, { baseDir: BaseDirectory.Config })) {
      console.log("config exists");
      content = await readTextFile(configPath, {
        baseDir: BaseDirectory.Config,
      });
      setConfig(content);
    } else {
      console.log("config does not exist");
    }
    return content;
  };

  const saveConfig = async (content: string) => {
    const configPath = await join("journalio", "config.kdl");
    if (!(await exists("journalio", { baseDir: BaseDirectory.Config }))) {
      console.log("creating directory");
      await mkdir("journalio", {
        baseDir: BaseDirectory.Config,
        recursive: true,
      });
    }
    await writeFile(configPath, new TextEncoder().encode(content), {
      baseDir: BaseDirectory.Config,
    });
    setConfig(content);
    console.log("config saved");
  };

  const handleOnSelectDirectory = async (dir: string) => {
    setSelectedDir(dir);
    console.log("selectedDir:", dir);
    const formatted = format(
      [
        {
          name: "journal_root",
          values: [dir],
          properties: {},
          children: [],
          tags: {
            properties: {},
            values: [],
            name: undefined as any,
          },
        },
      ],
      {
        escapeCommon: false,
      }
    );
    console.log("formatted:", formatted);
    await saveConfig(formatted);
  };

  useEffect(() => {
    readConfig();
  }, []);

  useEffect(() => {
    const checkConfig = async () => {
      if (config) {
        const { output: test } = parse(config);
        console.log("test:", test);
        const result = test ? query(test, "journal_root => val()") : null;
        const path =
          result && Array.isArray(result) && result.length > 0
            ? result[0]
            : null;
        if (path && (await exists(path))) {
          console.log("result:", path);
          setSelectedDir(path);
        }
      }
    };
    checkConfig();
  }, [config]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {!selectedDir ? (
        <DirectorySelector onSelectDirectory={handleOnSelectDirectory} />
      ) : (
        <Layout selectedDir={selectedDir} />
      )}
    </div>
  );
};

export default App;
