"use client";

import { createContext } from "react";

export const ToggleContext = createContext<(nodeId: string) => void>(() => {});
