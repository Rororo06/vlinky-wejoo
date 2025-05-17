
/// <reference types="vite/client" />

// This enables better type checking for Supabase custom tables
interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          id: string;
          name: string;
          flag: string;
        };
        Insert: {
          id: string;
          name: string;
          flag: string;
        };
        Update: {
          id?: string;
          name?: string;
          flag?: string;
        };
      };
    };
  };
}
