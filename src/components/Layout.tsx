import React, { useState } from "react";
import Calendar from "./CalendarPanel";
import Editor from "./Editor";
import { readTextFile, writeFile, mkdir, exists } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import {
  endOfWeek,
  format,
  getMonth,
  getWeek,
  getYear,
  startOfWeek,
} from "date-fns";
import Handlebars from "handlebars";
import "@radix-ui/react-icons";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "./ThemeContext";

interface LayoutProps {
  selectedDir: string;
}

const Layout: React.FC<LayoutProps> = ({ selectedDir }) => {
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

      const content = await readTextFile(filePath);
      console.log("content:", content);
      setJournalContent(content);
    } catch (error) {
      console.log("error:", error);
      const templatePath = await join(selectedDir, "templates", "daily.md");
      if (await exists(templatePath)) {
        const templateContent = await readTextFile(templatePath);
        const template = Handlebars.compile(templateContent);
        const templateVars = {
          date: format(date, "yyyy/MM/dd"),
        };
        setJournalContent(template(templateVars));
      } else {
        setJournalContent("# " + format(date, "yyyy/MM/dd"));
      }
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
      const content = await readTextFile(filePath);
      console.log("content:", content);
      setJournalContent(content);
    } catch (error) {
      console.log("error:", error);
      const templatePath = await join(selectedDir, "templates", "weekly.md");
      if (await exists(templatePath)) {
        const templateContent = await readTextFile(templatePath);
        setJournalContent(templateContent);
        const template = Handlebars.compile(templateContent);
        const templateVars = {
          start_date: format(
            startOfWeek(date, { weekStartsOn: 1 }),
            "yyyy/MM/dd"
          ),
          end_date: format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy/MM/dd"),
        };
        setJournalContent(template(templateVars));
      } else {
        setJournalContent(
          "# " +
            format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy/MM/dd") +
            "~" +
            format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy/MM/dd")
        );
      }
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

    if (!(await exists(directoryPath))) {
      console.log("creating directory");
      await mkdir(directoryPath, { recursive: true });
    }
    console.log("writing file");
    await writeFile(filePath, contentBuffer);
  };

  const { currentTheme, toggleTheme } = useTheme();
  let styles = getStyles(isSidebarOpen, currentTheme);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    styles = getStyles(isSidebarOpen, currentTheme);
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
      <div style={styles.sidebar}>
        {isSidebarOpen ? (
          <>
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
              <button onClick={toggleTheme} style={styles.theme_button}>
                {currentTheme === "dark" ? (
                  <MoonIcon color="white" />
                ) : (
                  <SunIcon color="black" />
                )}
              </button>
            </div>
            <div style={styles.calendarPanel}>
              <Calendar
                onDateSelect={handleDateSelect}
                onWeekSelect={handleWeekSelect}
              />
            </div>
          </>
        ) : (
          <button onClick={toggleSidebar} style={styles.toggleButton}>
            {">>"}
          </button>
        )}
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
          <div style={styles.placeholder}>
            Please select date or week number
          </div>
        )}
      </div>
    </div>
  );
};

const getStyles = (
  isSidebarOpen: boolean,
  currentTheme: string
): { [key: string]: React.CSSProperties } => ({
  container: {
    display: "flex",
    height: "100%",
    minHeight: "100vh",
    backgroundColor: currentTheme === "dark" ? "#1a1a1a" : "#fff",
  },
  sidebar: {
    position: "fixed",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: isSidebarOpen ? "317px" : "40px",
    borderRight: currentTheme === "dark" ? "1px solid #777" : "1px solid #aaa",
    boxSizing: "border-box",
    backgroundColor: currentTheme === "dark" ? "#222" : "#fff",
  },
  main: {
    flex: 1,
    marginLeft: isSidebarOpen ? "317px" : "40px",
    height: "100%",
    padding: "20px",
    boxSizing: "border-box",
    backgroundColor: currentTheme === "dark" ? "#1a1a1a" : "#fff",
  },
  placeholder: {
    color: "#888",
    fontSize: "18px",
    textAlign: "center",
    marginTop: "50px",
    height: "100%",
    minHeight: "100vh",
  },
  toggleButton: {
    cursor: "pointer",
    height: isSidebarOpen ? "30px" : "100%",
    width: "100%",
    padding: "5px",
    background: currentTheme === "dark" ? "#222" : "#fff",
    borderTop: currentTheme === "dark" ? "solid 1px #777" : "solid 1px #aaa",
    borderRight: "0px",
    borderBottom: currentTheme === "dark" ? "solid 1px #777" : "solid 1px #aaa",
    borderLeft: currentTheme === "dark" ? "solid 1px #777" : "solid 1px #aaa",
    fontSize: "16px",
    color: currentTheme === "dark" ? "#fff" : "#000",
  },
  button: {
    margin: "5px 0 0 5px",
    width: "50%",
    height: "30px",
    border: "none",
    borderRadius: "5px",
    background: currentTheme === "dark" ? "#555" : "#ddd",
    color: currentTheme === "dark" ? "#fff" : "#000",
  },
  theme_button: {
    margin: "5px 5px 0 5px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "none",
    background: currentTheme === "dark" ? "#555" : "#ddd",
  },
  calendarPanel: {
    padding: "5px",
  },
});

export default Layout;
