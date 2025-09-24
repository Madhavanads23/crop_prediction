// Fallback SQLite configuration
// If MySQL continues to have issues, we can switch to SQLite
export const DATABASE_CONFIG = {
    type: 'sqlite',
    filename: './agrismart.db',
    fallback: true
};
