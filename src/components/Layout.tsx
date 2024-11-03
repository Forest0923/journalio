import React, { useState, useEffect } from "react";
import Calendar from "./CalendarPanel";
import Editor from "./Editor";
import { JournalEntry } from "../types";
import {
  readTextFile,
  writeFile,
  BaseDirectory,
  mkdir,
  exists,
} from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import {
  endOfWeek,
  format,
  getMonth,
  getWeek,
  getYear,
  startOfWeek,
} from "date-fns";

interface LayoutProps {
  selectedDir: string;
  onSelectJournal: (entry: JournalEntry) => void;
}

const Layout: React.FC<LayoutProps> = ({ selectedDir, onSelectJournal }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [journalContent, setJournalContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [journalMode, setJournalMode] = useState<string>("");

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setJournalMode("daily");
    setLoading(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const filePath = await join(
        selectedDir,
        getYear(date).toString(),
        (getMonth(date) + 1).toString(),
        `${formattedDate}.md`
      );

      const content = await readTextFile(filePath, {
        baseDir: BaseDirectory.AppConfig,
      });
      console.log("content:", content);
      setJournalContent(content);
    } catch (error) {
      console.log("error:", error);
      setJournalContent("# " + format(date, "yyyy/MM/dd"));
    } finally {
      setLoading(false);
    }
  };

  const handleWeekSelect = async (week: number, date: Date) => {
    setSelectedDate(date);
    setSelectedWeek(week);
    setJournalMode("weekly");
    setLoading(true);
    const year = getYear(date);
    console.log("startOfWeek:", startOfWeek(date, { weekStartsOn: 1 }));
    console.log("endOfWeek:", endOfWeek(date, { weekStartsOn: 1 }));
    try {
      const filePath = await join(
        selectedDir,
        year.toString(),
        (getMonth(date) + 1).toString(),
        `${year}-week${week}.md`
      );
      const content = await readTextFile(filePath, {
        baseDir: BaseDirectory.AppConfig,
      });
      console.log("content:", content);
      setJournalContent(content);
    } catch (error) {
      console.log("error:", error);
      setJournalContent(
        "# " +
          format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy/MM/dd") +
          "~" +
          format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy/MM/dd")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (content: string) => {
    setJournalContent(content);
  };

  const handleSave = async () => {
    if (!selectedDate) {
      console.log("selectedDate is null");
      return;
    }

    const year = getYear(selectedDate);
    const month = getMonth(selectedDate) + 1;
    const directoryPath = await join(
      selectedDir,
      year.toString(),
      month.toString()
    );
    let filePath = "";
    if (journalMode === "daily") {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const fileName = `${formattedDate}.md`;
      filePath = await join(directoryPath, fileName);
    } else if (journalMode === "weekly") {
      const fileName = year + "-week" + selectedWeek + ".md";
      filePath = await join(directoryPath, fileName);
    }
    console.log("filePath:", filePath);

    const encoder = new TextEncoder();
    const contentBuffer = encoder.encode(journalContent);
    console.log("journalContent:", journalContent);
    console.log("contentBuffer:", contentBuffer);

    if (!(await exists(directoryPath, { baseDir: BaseDirectory.AppConfig }))) {
      console.log("creating directory");
      await mkdir(directoryPath, { recursive: true });
    }
    console.log("writing file");
    await writeFile(filePath, contentBuffer);
  };

  let styles = getStyles(isSidebarOpen);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    styles = getStyles(isSidebarOpen);
  };

  const handleTodayClick = () => {
    const today = new Date();
    console.log("today button:", today);
    handleDateSelect(today);
  };
  const handleThisWeekClick = () => {
    const today = new Date();
    console.log("this week button:", today);
    console.log("this week:", getWeek(today));
    handleWeekSelect(
      getWeek(today, { weekStartsOn: 1 }),
      startOfWeek(today, { weekStartsOn: 1 })
    );
  };

  return (
    <div style={styles.container}>
      {isSidebarOpen ? (
        <div style={styles.sidebar}>
          <button onClick={toggleSidebar} style={styles.toggleButton}>
            {"<<"}
          </button>
          <div style={{ flexDirection: "row", display: "flex" }}>
            <button onClick={handleTodayClick} style={styles.button}>
              Today
            </button>
            <button onClick={handleThisWeekClick} style={styles.button}>
              This Week
            </button>
          </div>
          <Calendar
            onDateSelect={handleDateSelect}
            onWeekSelect={handleWeekSelect}
          />
        </div>
      ) : (
        <button onClick={toggleSidebar} style={styles.toggleButton}>
          {">>"}
        </button>
      )}
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
          <div style={styles.placeholder}>Please select date or week number</div>
        )}
      </div>
    </div>
  );
};

const getStyles = (
  isSidebarOpen: boolean
): { [key: string]: React.CSSProperties } => ({
  container: {
    display: "flex",
    height: "100%",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    width: "317px",
    borderRight: "1px solid #ddd",
    padding: "5px",
    paddingRight: "15px",
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
  toggleButton: {
    cursor: "pointer",
    height: isSidebarOpen ? "30px" : "100%",
    padding: "5px",
    margin: "5px",
    background: "#f0f0f0",
    border: "none",
    fontSize: "16px",
  },
  button: {
    margin: "5px",
    width: "50%",
    height: "30px",
  },
});

export default Layout;
