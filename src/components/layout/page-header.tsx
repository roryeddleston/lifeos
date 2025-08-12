"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Action = { label: string; href: string } | null;
type Ctx = {
  title: string;
  action: Action;
  setTitle: (t: string) => void;
  setAction: (a: Action) => void;
};

const PageHeaderContext = createContext<Ctx | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Dashboard");
  const [action, setAction] = useState<Action>(null);

  const value = useMemo(
    () => ({ title, action, setTitle, setAction }),
    [title, action]
  );
  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const ctx = useContext(PageHeaderContext);
  if (!ctx)
    throw new Error("usePageHeader must be used within PageHeaderProvider");
  return ctx;
}

/** Helper component you can drop into any page to set title/action */
export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: Action;
}) {
  const { setTitle, setAction } = usePageHeader();
  useEffect(() => {
    setTitle(title);
    setAction(action ?? null);
    return () => {
      // optional: reset on unmount
      setTitle("Dashboard");
      setAction(null);
    };
  }, [title, action, setTitle, setAction]);
  return null;
}
