import { isAdmin, getLibraryGrants, canAccessLibrary } from './permissions';

// Mock process.env
process.env.ADMIN_EMAILS = "admin@example.com";
// We need to make sure this path resolves correctly during test execution
// jest runs from root, so conf/library-grants.json should work if it exists
process.env.LIBRARY_GRANTS_PATH = "conf/library-grants.json";

describe('Permissions', () => {
    it('should identify admin', () => {
        expect(isAdmin('admin@example.com')).toBe(true);
        expect(isAdmin('user@example.com')).toBe(false);
    });

    it('should return default grants for unknown user', () => {
        expect(getLibraryGrants('unknown@example.com')).toEqual(['default', 'public']);
    });

    it('should check library access', () => {
         // "test@example.com": "R&D|Marketing" from conf/library-grants.json

         const grants = getLibraryGrants('test@example.com');
         expect(grants).toContain('R&D');
         expect(grants).toContain('Marketing');
         // Based on my dummy file "test@example.com": "R&D|Marketing"

         expect(canAccessLibrary('test@example.com', 'R&D')).toBe(true);
         expect(canAccessLibrary('test@example.com', 'Finance')).toBe(false);
    });
});
