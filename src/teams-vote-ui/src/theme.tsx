import { children, createSignal, onMount, Show, type ParentComponent } from 'solid-js'
import { DesignSystemProvider, provideFluentDesignSystem } from '@fluentui/web-components'
import { teamsLightTheme } from '@fluentui/tokens';
import { app } from '@microsoft/teams-js';
import { registerComponents } from './theme.components';
import { applyTeamsTheme } from './theme.color-palette';
import { globalTeamsContext } from './helpers/teams';

import "./theme.css";

export const Theme: ParentComponent = (props) => {

    const [themeRef, setThemeRef] = createSignal<DesignSystemProvider>();
    const [themeLoaded, setThemeLoaded] = createSignal(false);

    onMount(async () => {
        const themeRoot = themeRef();
        if (!themeRoot) return;
        console.log('TEAMSVOTE', 'applying theme')

        try {
            const teamsContext = globalTeamsContext();
            applyTeamsTheme(teamsContext?.app.theme ?? 'light');
            if (teamsContext) app.registerOnThemeChangeHandler((theme) => {
                applyTeamsTheme(theme);
            });
        } catch (e) {
            console.log(e);
            applyTeamsTheme('light');
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