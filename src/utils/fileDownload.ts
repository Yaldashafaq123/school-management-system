// src/utils/fileDownload.ts

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export const downloadFile = async (url: string, filename: string) => {
  try {
    // Use type assertion to bypass TypeScript checking
    const fs = FileSystem as any;
    const documentDir = fs.documentDirectory;
    
    if (!documentDir) {
      throw new Error('Document directory not available');
    }

    const fileUri = documentDir + filename;
    
    console.log(`📥 Downloading file to: ${fileUri}`);
    console.log(`📥 From URL: ${url}`);
    
    const downloadResumable = fs.createDownloadResumable(
      url,
      fileUri,
      {},
      (downloadProgress: any) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        console.log(`Download progress: ${Math.round(progress * 100)}%`);
      }
    );

    const result = await downloadResumable.downloadAsync();
    
    if (result && result.uri) {
      console.log(`✅ File downloaded successfully: ${result.uri}`);
      
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'ذخیره راپور',
        });
      }
      
      return result.uri;
    }
    
    throw new Error('Download failed');
  } catch (error) {
    console.error('❌ Download error:', error);
    throw error;
  }
};

export const downloadFileSilently = async (url: string, filename: string): Promise<string> => {
  try {
    const fs = FileSystem as any;
    const documentDir = fs.documentDirectory;
    
    if (!documentDir) {
      throw new Error('Document directory not available');
    }

    const fileUri = documentDir + filename;
    
    const downloadResumable = fs.createDownloadResumable(
      url,
      fileUri,
      {},
      (downloadProgress: any) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        console.log(`Download progress: ${Math.round(progress * 100)}%`);
      }
    );

    const result = await downloadResumable.downloadAsync();
    
    if (result && result.uri) {
      return result.uri;
    }
    
    throw new Error('Download failed');
  } catch (error) {
    console.error('❌ Silent download error:', error);
    throw error;
  }
};

export const shareFile = async (fileUri: string, filename?: string) => {
  try {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (isSharingAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'ذخیره راپور',
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Share error:', error);
    throw error;
  }
};

export const fileExists = async (fileUri: string): Promise<boolean> => {
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};

export const deleteFile = async (fileUri: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(fileUri);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};