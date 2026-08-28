"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Permission } from "@abge/rbac";

type PermissionsContextType = {
  effectivePermissions: string[];
  can: (permission: Permission) => boolean;
};

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ 
  effectivePermissions, 
  children 
}: { 
  effectivePermissions: string[]; 
  children: ReactNode 
}) {
  const can = (permission: Permission) => {
    return effectivePermissions.includes(permission);
  };

  return (
    <PermissionsContext.Provider value={{ effectivePermissions, can }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
