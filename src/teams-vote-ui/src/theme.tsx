import { children, createEffect, createSignal, Show, type ParentComponent } from 'solid-js'
import * as component from '@fluentui/web-components'
import { DesignSystemProvider, provideFluentDesignSystem } from '@fluentui/web-components'
import { PaletteRGB, SwatchRGB, accentBaseColor, accentPalette, fillColor, neutralForegroundRest, neutralLayer1, neutralLayer2, neutralLayer3 } from '@fluentui/web-components'
import { teamsLightTheme, teamsDarkTheme, teamsHighContrastTheme} from '@fluentui/tokens';
import { type DesignSystem } from '@microsoft/fast-foundation';
import { app } from '@microsoft/teams-js';
import { parseColorHexRGB } from '@microsoft/fast-colors';
import { getContext } from './contexts/teams-context';

import "./theme.css";

type TeamsAppContext = Awaited<ReturnType<typeof app['getContext']>>;
type TeamsTheme = TeamsAppContext['app']['theme'];

function registerComponents(system: DesignSystem): DesignSystem {

    return system
        .register(component.fluentButton())
        .register(component.fluentTextField())
        .register(
            component.fluentSelect(),
            component.fluentOption()
        )
        .register(component.fluentBadge())
        .register(component.fluentCard())
        .register(
            component.fluentDataGridCell(),
            component.fluentDataGridRow(),
            component.fluentDataGrid()
        )
        .register(component.fluentAnchoredRegion())
        .register(component.fluentProgressRing())
}

function applyTeamsTheme(theme: TeamsTheme) {


    switch (theme) {
        case "dark":
            const dark = swatchFromRgb("#8C8CD9");
            accentBaseColor.withDefault(dark);
            accentPalette.withDefault(PaletteRGB.from(dark));
            fillColor.withDefault(swatchFromRgb(teamsDarkTheme.colorNeutralBackground1));
            neutralForegroundRest.withDefault(swatchFromRgb(teamsDarkTheme.colorNeutralForeground1));
            break;

        case "contrast":
            const contrast = swatchFromRgb("#FFFFFF");
            accentBaseColor.withDefault(contrast);
            accentPalette.withDefault(PaletteRGB.from(contrast));
            fillColor.withDefault(swatchFromRgb(teamsHighContrastTheme.colorNeutralBackground1));
            neutralForegroundRest.withDefault(swatchFromRgb(teamsHighContrastTheme.colorNeutralForeground1));
            break;

        default: // light
            const light = swatchFromRgb("#6264A7");
            accentBaseColor.withDefault(light);
            accentPalette.withDefault(PaletteRGB.from(light));
            fillColor.withDefault(swatchFromRgb(teamsLightTheme.colorNeutralBackground1));
            neutralForegroundRest.withDefault(swatchFromRgb(teamsLightTheme.colorNeutralForeground1));
            // neutralLayer1.withDefault(swatchFromRgb(teamsLightTheme.colorNeutralBackground1));
            // neutralLayer2.withDefault(swatchFromRgb(teamsLightTheme.colorNeutralBackground2));
            // neutralLayer3.withDefault(swatchFromRgb(teamsLightTheme.colorNeutralBackground3));
            // component.neutralForegroundHint.withDefault(swatchFromRgb(teamsLightTheme.colorNeutralForeground1));

            break;
    }
}

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

function swatchFromRgb(hex: string) {
    return SwatchRGB.from(parseColorHexRGB(hex)!);
}