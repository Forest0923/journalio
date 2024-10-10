import React, { useState } from 'react';
import DirectorySelector from './components/DirectorySelector';
// import Layout from './components/Layout';
// import { JournalEntry } from './types';

const App: React.FC = () => {
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  // const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {!selectedDir ? (
        <DirectorySelector onSelectDirectory={setSelectedDir} />
      ) : (
        // <Layout
        //   selectedDir={selectedDir}
        //   onSelectJournal={(entry) => setJournalEntry(entry)}
        // />
        <div> test </div>
      )}
    </div>
  );
};

export default App;