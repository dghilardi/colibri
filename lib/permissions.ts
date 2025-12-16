import fs from 'fs';
import path from 'path';

interface LibraryGrants {
  [email: string]: string; // "lib1|lib2"
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const ADMIN_EMAILS = process.env.ADMIN_EMAILS || '';
  const admins = ADMIN_EMAILS.split(',').map(e => e.trim());
  return admins.includes(email);
}

export function getLibraryGrants(email: string | null | undefined): string[] {
  if (!email) return ['default', 'public'];
  const LIBRARY_GRANTS_PATH = process.env.LIBRARY_GRANTS_PATH || '/conf/library-grants.json';

  let grants: LibraryGrants = {};

  try {
    let filePath = LIBRARY_GRANTS_PATH;
    // In local development, check relative to CWD if absolute path doesn't exist
    if (!fs.existsSync(filePath) && !path.isAbsolute(filePath)) {
        filePath = path.join(process.cwd(), filePath);
    } else if (!fs.existsSync(filePath)) {
         // Try local fallback
         const localPath = path.join(process.cwd(), 'conf', 'library-grants.json');
         if (fs.existsSync(localPath)) {
            filePath = localPath;
         }
    }

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      grants = JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("Error reading library grants:", error);
  }

  const userGrantsStr = grants[email];
  if (userGrantsStr) {
    return userGrantsStr.split('|');
  }

  return ['default', 'public'];
}

export function canAccessLibrary(email: string | null | undefined, library: string): boolean {
  const allowed = getLibraryGrants(email);
  return allowed.includes(library);
}
