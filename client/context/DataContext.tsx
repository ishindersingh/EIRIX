import { createContext, useContext, useEffect, useState } from "react";
import { fetchHistory, fetchStats, HistoryEntry, DatasetStats } from "../services/burnoutLogic";

interface DataContextType {
  history: HistoryEntry[];
  stats: DatasetStats | null;
  loadingStats: boolean;
  refetchHistory: () => void;
}

const DataContext = createContext<DataContextType>({
  history: [],
  stats: null,
  loadingStats: true,
  refetchHistory: () => {},
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadHistory = () => fetchHistory().then(setHistory).catch(console.error);

  useEffect(() => {
    loadHistory();
    fetchStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <DataContext.Provider value={{ history, stats, loadingStats, refetchHistory: loadHistory }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
