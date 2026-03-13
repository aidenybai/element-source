"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { COPY_FEEDBACK_DURATION_MS } from "@/constants";

interface SiteContextValue {
  activeTab: string;
  copied: boolean;
  setActiveTab: (tab: string) => void;
  copyCommand: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within SiteProvider");
  }
  return context;
};

const INSTALL_COMMAND = "npm install element-source";
const AGENT_PROMPT = "Install element-source and use resolveElementInfo(element) to map any rendered DOM element back to its source file, line, column, and component name. Works with React 19, Next.js, Svelte 5, Vue 3, and Solid. See https://element-source.dev for the full API.";

interface SiteProviderProps {
  children: ReactNode;
}

export const SiteProvider = ({ children }: SiteProviderProps) => {
  const [activeTab, setActiveTab] = useState("command");
  const [copied, setCopied] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCopied(false);
  };

  const copyCommand = () => {
    const text = activeTab === "command" ? INSTALL_COMMAND : AGENT_PROMPT;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
  };

  return (
    <SiteContext.Provider
      value={{
        activeTab,
        copied,
        setActiveTab: handleTabChange,
        copyCommand,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
