// src/config/excelReportApi.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// ==================== TYPES ====================

export interface ClassForExcel {
  id: number;
  name: string;
  section: string;
  fullName: string;
  teacherName: string;
  studentCount: number;
  school: string;
  schoolId: number;
  academicYear: string;
  academicYearId: number;
}

export interface AcademicYearForExcel {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface StudentForExcel {
  id: number;
  fullName: string;
  studentNumber: string;
  classId: number;
  className: string;
  fatherName: string;
  grandfatherName?: string;
  enrollmentDate?: string;
  status?: string;
}

export interface GenerateExcelRequest {
  classId: number;
  academicYearId: number;
}

export interface GenerateStudentExcelRequest {
  studentId: number;
  academicYearId: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ==================== API CLASS ====================

class ExcelReportApi {
  private async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const url = `${BASE_URL}${endpoint}`;

      console.log(`📡 Excel Report Request: ${options.method || "GET"} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Network error" }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result as T;
    } catch (error) {
      console.error(`❌ Excel Report API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  private async requestBlob(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data: Blob; fileName: string }> {
    try {
      const token = await this.getToken();
      const url = `${BASE_URL}${endpoint}`;

      console.log(`📡 Excel Report Blob Request: ${options.method || "GET"} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Network error" }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `report-${Date.now()}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) {
          fileName = match[1];
        }
      }

      const blob = await response.blob();
      return { data: blob, fileName };
    } catch (error) {
      console.error(`❌ Excel Report Blob Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== EXCEL REPORT METHODS ====================

  /**
   * Get available classes for Excel export dropdown
   * GET /excel/classes
   */
  async getAvailableClasses(): Promise<ApiResponse<ClassForExcel[]>> {
    return this.request("/excel/classes");
  }

  /**
   * Get academic years for Excel export dropdown
   * GET /excel/academic-years
   */
  async getAcademicYears(): Promise<ApiResponse<AcademicYearForExcel[]>> {
    return this.request("/excel/academic-years");
  }

  /**
   * Get all students for student report selection
   * GET /excel/students
   */
  async getStudents(params?: {
    classId?: number;
    search?: string;
  }): Promise<ApiResponse<StudentForExcel[]>> {
    const query = new URLSearchParams();
    if (params?.classId) query.append("classId", params.classId.toString());
    if (params?.search) query.append("search", params.search);
    const qs = query.toString();
    return this.request(`/excel/students${qs ? `?${qs}` : ""}`);
  }

  /**
   * Get students by class for class selection
   * GET /excel/students/by-class/:classId
   */
  async getStudentsByClass(classId: number): Promise<ApiResponse<StudentForExcel[]>> {
    return this.request(`/excel/students/by-class/${classId}`);
  }

  /**
   * Generate Excel for a class
   * GET /excel/class/:classId
   */
  async generateClassExcel(
    classId: number,
    academicYearId: number
  ): Promise<{ success: boolean; fileUrl?: string; message?: string; blob?: Blob; fileName?: string }> {
    try {
      const { data: blob, fileName } = await this.requestBlob(
        `/excel/class/${classId}?academicYearId=${academicYearId}`
      );
      
      const fileUri = await this.saveAndShareFile(blob, fileName);
      
      return {
        success: true,
        fileUrl: fileUri,
        fileName: fileName,
      };
    } catch (error: any) {
      console.error("Error generating class Excel:", error);
      return {
        success: false,
        message: error.message || "Failed to generate class report",
      };
    }
  }

  /**
   * Generate Excel for a student
   * GET /excel/student/:studentId
   */
  async generateStudentExcel(
    studentId: number,
    academicYearId: number
  ): Promise<{ success: boolean; fileUrl?: string; message?: string; blob?: Blob; fileName?: string }> {
    try {
      const { data: blob, fileName } = await this.requestBlob(
        `/excel/student/${studentId}?academicYearId=${academicYearId}`
      );
      
      const fileUri = await this.saveAndShareFile(blob, fileName);
      
      return {
        success: true,
        fileUrl: fileUri,
        fileName: fileName,
      };
    } catch (error: any) {
      console.error("Error generating student Excel:", error);
      return {
        success: false,
        message: error.message || "Failed to generate student report",
      };
    }
  }

  /**
   * Generate Excel for class results (exams and assessments)
   * GET /excel/class-results/:classId
   */
  async generateClassResultsExcel(
    classId: number,
    academicYearId: number
  ): Promise<{ success: boolean; fileUrl?: string; message?: string }> {
    try {
      const { data: blob, fileName } = await this.requestBlob(
        `/excel/class-results/${classId}?academicYearId=${academicYearId}`
      );
      
      const fileUri = await this.saveAndShareFile(blob, fileName);
      
      return {
        success: true,
        fileUrl: fileUri,
      };
    } catch (error: any) {
      console.error("Error generating class results Excel:", error);
      return {
        success: false,
        message: error.message || "Failed to generate class results report",
      };
    }
  }

  /**
   * Generate Excel for attendance report
   * GET /excel/attendance
   */
  async generateAttendanceExcel(params: {
    classId?: number;
    month?: number;
    year?: number;
  }): Promise<{ success: boolean; fileUrl?: string; message?: string }> {
    try {
      const query = new URLSearchParams();
      if (params.classId) query.append("classId", params.classId.toString());
      if (params.month) query.append("month", params.month.toString());
      if (params.year) query.append("year", params.year.toString());
      const qs = query.toString();
      
      const { data: blob, fileName } = await this.requestBlob(
        `/excel/attendance${qs ? `?${qs}` : ""}`
      );
      
      const fileUri = await this.saveAndShareFile(blob, fileName);
      
      return {
        success: true,
        fileUrl: fileUri,
      };
    } catch (error: any) {
      console.error("Error generating attendance Excel:", error);
      return {
        success: false,
        message: error.message || "Failed to generate attendance report",
      };
    }
  }

  /**
   * Generate Excel for student transcript
   * GET /excel/transcript/:studentId
   */
  async generateTranscriptExcel(
    studentId: number,
    academicYearId: number
  ): Promise<{ success: boolean; fileUrl?: string; message?: string }> {
    try {
      const { data: blob, fileName } = await this.requestBlob(
        `/excel/transcript/${studentId}?academicYearId=${academicYearId}`
      );
      
      const fileUri = await this.saveAndShareFile(blob, fileName);
      
      return {
        success: true,
        fileUrl: fileUri,
      };
    } catch (error: any) {
      console.error("Error generating transcript Excel:", error);
      return {
        success: false,
        message: error.message || "Failed to generate transcript report",
      };
    }
  }

  /**
   * Generate Excel for school summary
   * GET /excel/school-summary
   */
  async generateSchoolSummaryExcel(
    academicYearId?: number
  ): Promise<{ success: boolean; fileUrl?: string; message?: string }> {
    try {
      const query = academicYearId ? `?academicYearId=${academicYearId}` : "";
      const { data: blob, fileName } = await this.requestBlob(
        `/excel/school-summary${query}`
      );
      
      const fileUri = await this.saveAndShareFile(blob, fileName);
      
      return {
        success: true,
        fileUrl: fileUri,
      };
    } catch (error: any) {
      console.error("Error generating school summary Excel:", error);
      return {
        success: false,
        message: error.message || "Failed to generate school summary report",
      };
    }
  }

  // ==================== FILE UTILITIES ====================

  /**
   * Save blob to file and share it
   */
  private async saveAndShareFile(blob: Blob, fileName: string): Promise<string> {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get pure base64
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Determine file extension
      const extension = fileName.split('.').pop() || 'xlsx';
      const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      // Create file path - using FileSystem.documentDirectory
      const fileUri = (FileSystem as any).documentDirectory + safeFileName;
      
      // Write file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File was not saved successfully');
      }

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: `application/vnd.openxmlformats-officedocument.spreadsheetml.${extension}`,
          dialogTitle: 'ذخیره راپور',
        });
      }

      return fileUri;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  /**
   * Download file from URL
   */
  async downloadFromUrl(url: string, fileName: string): Promise<string> {
    try {
      const fileUri = (FileSystem as any).documentDirectory + fileName;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${Math.round(progress * 100)}%`);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.uri) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'ذخیره راپور',
          });
        }
        return result.uri;
      }
      
      throw new Error('Download failed');
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const excelReportApi = new ExcelReportApi();