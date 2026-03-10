import { drive_v3 } from "googleapis";

interface FolderCache {
  [key: string]: string; // folderName -> folderId
}

/**
 * Get or create a folder in Google Drive
 * @param drive Google Drive API instance
 * @param folderName Name of the folder to find or create
 * @param parentId Parent folder ID (or 'root' for Drive root)
 * @param cache Optional cache to avoid repeated API calls
 * @returns Folder ID
 */
export async function getOrCreateFolder(
  drive: drive_v3.Drive,
  folderName: string,
  parentId: string = "root",
  cache: FolderCache = {},
): Promise<string> {
  const cacheKey = `${parentId}/${folderName}`;

  // Check cache first
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    // Search for existing folder
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
      spaces: "drive",
      fields: "files(id, name)",
      pageSize: 1,
    });

    if (response.data.files && response.data.files.length > 0) {
      const folderId = response.data.files[0].id!;
      cache[cacheKey] = folderId;
      return folderId;
    }

    // Create new folder if not found
    const createResponse = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id",
    });

    const newFolderId = createResponse.data.id!;
    cache[cacheKey] = newFolderId;
    return newFolderId;
  } catch (error) {
    console.error(`Error getting or creating folder '${folderName}':`, error);
    throw error;
  }
}

/**
 * Upload a file to Google Drive
 * @param drive Google Drive API instance
 * @param fileName Name of the file
 * @param fileBuffer Buffer containing file data
 * @param mimeType MIME type of the file
 * @param parentId Parent folder ID
 * @returns File ID and web view link
 */
export async function uploadFileToDrive(
  drive: drive_v3.Drive,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
  parentId: string,
): Promise<{ fileId: string; webViewLink: string }> {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: [parentId],
      },
      media: {
        mimeType,
        body: fileBuffer,
      },
      fields: "id, webViewLink",
    });

    return {
      fileId: response.data.id!,
      webViewLink: response.data.webViewLink!,
    };
  } catch (error) {
    console.error(`Error uploading file '${fileName}':`, error);
    throw error;
  }
}
