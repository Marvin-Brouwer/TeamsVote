import { children, createEffect, createSignal, Show, type ParentComponent } from 'solid-js'
import { DesignSystemProvider, provideFluentDesignSystem } from '@fluentui/web-components'
import { teamsLightTheme} from '@fluentui/tokens';
import { app } from '@microsoft/teams-js';
import { getContext } from './contexts/teams-context';
import { registerComponents } from './theme.components';
import { applyTeamsTheme } from './theme.color-palette';

import "./theme.css";

let teamsContext = await getContext();
if (teamsContext) applyTeamsTheme(teamsContext.app.theme);
else applyTeamsTheme('light');

export const Theme: ParentComponent = (props) => {

    const [themeRef, setThemeRef] = createSignal<DesignSystemProvider>();
    const [themeLoaded, setThemeLoaded] = createSignal(false);

    createEffect(async () => {
        const themeRoot = themeRef();
        if (!themeRoot) return;

        if (!teamsContext) await getContext();
        if (teamsContext) {
            applyTeamsTheme(teamsContext.app.theme);
            app.registerOnThemeChangeHandler((theme) => {
                applyTeamsTheme(theme);
            });
        }

        registerComponents(provideFluentDesignSystem(themeRoot))
            .withShadowRootMode('open')
            .withDesignTokenRoot(document);

        setThemeLoaded(true)
    })

    // Here, design-system={teamsLightTheme} is fine here,
    // it is used to initialize the teams styles, the applyTeamsTheme logic overrides the global styling.
    return <fluent-design-system-provider
        ref={setThemeRef}
        design-system={teamsLightTheme}
    >
        <Show when={themeLoaded()}>{children(() => props.children)()}</Show>
    </fluent-design-system-provider>
}