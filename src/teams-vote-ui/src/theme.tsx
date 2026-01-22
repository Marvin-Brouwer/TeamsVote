import {
  children,
  createContext,
  createSignal,
  onMount,
  Show,
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
  const [themeLoaded, setThemeLoaded] = createSignal(false);

  function applyTheme(theme: string) {
    applyTeamsTheme(theme);
  }

  onMount(() => {
    const themeRoot = themeRef();
    if (!themeRoot) return;

    applyTheme("light");

    registerComponents(provideFluentDesignSystem(themeRoot))
      .withShadowRootMode("open")
      .withDesignTokenRoot(document);

    setThemeLoaded(true);
  });

  return (
    <ThemeContext.Provider value={{ applyTheme }}>
      <fluent-design-system-provider
        ref={setThemeRef}
        design-system={teamsLightTheme}
      >
        <Show when={themeLoaded()}>
          {children(() => props.children)()}
        </Show>
      </fluent-design-system-provider>
    </ThemeContext.Provider>
  );
};
