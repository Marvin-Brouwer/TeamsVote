import {
  createContext,
  createSignal,
  onMount,
  useContext,
  type ParentComponent
} from "solid-js";
import {
  DesignSystemProvider,
  provideFluentDesignSystem
} from "@fluentui/web-components";
import { teamsLightTheme } from "@fluentui/tokens";

import { registerComponents } from "./theme.components";
import { applyTeamsTheme } from "./theme.color-palette";

import "./theme.css";

export type UseThemeContext = {
  applyTheme: (theme: string) => void;
};

export const ThemeContext = createContext<UseThemeContext | undefined>(
  undefined
);

export function useTheme(): UseThemeContext {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}

export const ThemeProvider: ParentComponent = (props) => {
  const [themeRef, setThemeRef] = createSignal<DesignSystemProvider>();
  const [getTheme, setTheme] = createSignal<string>('light');

  function applyTheme(theme: string) {
    if (theme === getTheme()) return;
    setTheme(theme)
    applyTeamsTheme(theme);
  }

  onMount(() => {
    const themeRoot = themeRef();
    if (!themeRoot) return;

    registerComponents(provideFluentDesignSystem(themeRoot))
      .withShadowRootMode("open")
      .withDesignTokenRoot(document);

      applyTeamsTheme('light')
  });

  return (
    <ThemeContext.Provider value={{ applyTheme }}>
      <fluent-design-system-provider
        ref={setThemeRef}
        design-system={teamsLightTheme}
      >
        {props.children}
      </fluent-design-system-provider>
    </ThemeContext.Provider>
  );
};
