const BASE_URL = "https://taqwim.af";

export type TaqwimEvent = {
  id: string;
  title: string;
  date: string;
  type?: string;
  time?: string;
};

// ⚠️ NOTE: endpoint may differ internally
export const taqwimApi = {
  async getMonthEvents(year: number, month: number) {
    try {
      const res = await fetch(
        `${BASE_URL}/api/calendar?year=${year}&month=${month}`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch taqwim data");
      }

      const data = await res.json();

      // normalize response
      return {
        success: true,
        data: (data?.events || []) as TaqwimEvent[],
      };
    } catch (error) {
      console.error("Taqwim API Error:", error);
      return { success: false, data: [] };
    }
  },
};
