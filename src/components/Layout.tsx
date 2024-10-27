import React, { useState, useEffect } from "react";
import Calendar from "./CalendarPanel";
import Editor from "./Editor";
import { JournalEntry } from "../types";
import { readTextFile, writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

interface LayoutProps {
  selectedDir: string;
  onSelectJournal: (entry: JournalEntry) => void;
}

const Layout: React.FC<LayoutProps> = ({ selectedDir, onSelectJournal }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [journalContent, setJournalContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setLoading(true);
    try {
      const filePath = await join(selectedDir, `${date}.md`);
      const content = await readTextFile(filePath, {
        baseDir: BaseDirectory.AppConfig,
      });
      console.log("content:", content);
      setJournalContent(content);
    } catch (error) {
      setJournalContent("");
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (content: string) => {
    setJournalContent(content);
  };

  const handleSave = async () => {
    if (selectedDate) {
      const filePath = await join(selectedDir, `${selectedDate}.md`);
      console.log("filePath:", filePath);
      const encoder = new TextEncoder();
      const contentBuffer = encoder.encode(journalContent);
      console.log("journalContent:", journalContent);
      console.log("contentBuffer:", contentBuffer);
      await writeFile(filePath, contentBuffer, { dir: BaseDirectory.External });
      // alert("Saved!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <Calendar onDateSelect={handleDateSelect} />
      </div>
      <div style={styles.main}>
        {loading ? (
          <div>Loading...</div>
        ) : selectedDate ? (
          <Editor
            date={selectedDate}
            content={journalContent}
            onContentChange={handleContentChange}
            onSave={handleSave}
          />
        ) : (
          <div style={styles.placeholder}>日付を選択してください</div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    height: "100%",
  },
  sidebar: {
    width: "280px",
    borderRight: "1px solid #ddd",
    padding: "10px",
    boxSizing: "border-box",
  },
  main: {
    flex: 1,
    padding: "20px",
    boxSizing: "border-box",
  },
  placeholder: {
    color: "#888",
    fontSize: "18px",
    textAlign: "center",
    marginTop: "50px",
  },
};

export default Layout;
