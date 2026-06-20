import { create } from "zustand";
export const useReportStore = create((set) => ({ dashboard: null, report: null, setDashboard: (dashboard) => set({ dashboard }), setReport: (report) => set({ report }) }));
