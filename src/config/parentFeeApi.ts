// src/config/parentFeeApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface Invoice {
  id: number;
  title: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  date?: string;
  feeCategoryId: number;
  studentId: number;
  studentName?: string;
}

export interface PaymentHistory {
  id: number;
  description: string;
  amount: number;
  date: string;
  method: string;
  receiptUrl?: string;
  transactionId?: string;
}

export interface FeeSummary {
  totalDue: number;
  totalPaid: number;
  totalPending: number;
  overdueCount: number;
}

export interface PaymentRequest {
  studentFeeId: number;
  amount: number;
  paymentMethod: "credit_card" | "bank_transfer" | "cash" | "online";
}

export const parentFeeApi = {
  // Get fee summary for parent
  getFeeSummary: async (
    childId?: number,
  ): Promise<{ success: boolean; data: FeeSummary }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const url = childId
        ? `${BASE_URL}/parent/fees/summary?childId=${childId}`
        : `${BASE_URL}/parent/fees/summary`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching fee summary:", error);
      return {
        success: false,
        data: { totalDue: 0, totalPaid: 0, totalPending: 0, overdueCount: 0 },
      };
    }
  },

  // Get invoices for parent
  getInvoices: async (
    childId?: number,
    status?: string,
  ): Promise<{ success: boolean; data: Invoice[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      let url = `${BASE_URL}/parent/fees/invoices`;
      const params = new URLSearchParams();
      if (childId) params.append("childId", childId.toString());
      if (status) params.append("status", status);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return { success: false, data: [] };
    }
  },

  // Get payment history
  getPaymentHistory: async (
    childId?: number,
    limit: number = 10,
  ): Promise<{ success: boolean; data: PaymentHistory[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const url = childId
        ? `${BASE_URL}/parent/fees/history?childId=${childId}&limit=${limit}`
        : `${BASE_URL}/parent/fees/history?limit=${limit}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching payment history:", error);
      return { success: false, data: [] };
    }
  },

  // Get invoice details
  getInvoiceDetails: async (
    invoiceId: number,
  ): Promise<{ success: boolean; data: Invoice }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/parent/fees/invoices/${invoiceId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      return { success: false, data: null as any };
    }
  },

  // Request payment
  requestPayment: async (
    data: PaymentRequest,
  ): Promise<{ success: boolean; message: string; paymentUrl?: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/fees/pay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error requesting payment:", error);
      return { success: false, message: "خطا در درخواست پرداخت" };
    }
  },

  // Download invoice
  downloadInvoice: async (
    invoiceId: number,
  ): Promise<{ success: boolean; url: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/parent/fees/invoices/${invoiceId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      return { success: true, url };
    } catch (error) {
      console.error("Error downloading invoice:", error);
      return { success: false, url: "" };
    }
  },
};
