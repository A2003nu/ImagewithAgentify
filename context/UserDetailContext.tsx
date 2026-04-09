"use client";

import { createContext, useState } from "react";

export const UserDetailContext = createContext<any>(null);

export function UserDetailProvider({ children }: any) {
  const [userDetail, setUserDetail] = useState(null);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
}