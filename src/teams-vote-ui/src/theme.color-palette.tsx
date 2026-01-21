import { PaletteRGB, SwatchRGB, accentBaseColor, accentPalette, fillColor, neutralForegroundRest } from '@fluentui/web-components'
import { teamsLightTheme, teamsDarkTheme, teamsHighContrastTheme } from '@fluentui/tokens';
import { app } from '@microsoft/teams-js';
import { parseColorHexRGB } from '@microsoft/fast-colors';

type TeamsAppContext = Awaited<ReturnType<typeof app['getContext']>>;
export type TeamsTheme = TeamsAppContext['app']['theme'];

function swatchFromRgb(hex: string) {
    return SwatchRGB.from(parseColorHexRGB(hex)!);
}

const light = swatchFromRgb("#6264A7");
const dark = swatchFromRgb("#8C8CD9");
const contrast = swatchFromRgb("#FFFFFF");

export function applyTeamsTheme(theme: TeamsTheme) {
    switch (theme) {
        case "dark":
            accentBaseColor.withDefault(dark);
            accentPalette.withDefault(PaletteRGB.from(dark));
            fillColor.withDefault(swatchFromRgb(teamsDarkTheme.colorNeutralBackground1));
            neutralForegroundRest.withDefault(swatchFromRgb(teamsDarkTheme.colorNeutralForeground1));
            break;

        case "contrast":
            accentBaseColor.withDefault(contrast);
            accentPalette.withDefault(PaletteRGB.from(contrast));
            fillColor.withDefault(swatchFromRgb(teamsHighContrastTheme.colorNeutralBackground1));
            neutralForegroundRest.withDefault(swatchFromRgb(teamsHighContrastTheme.colorNeutralForeground1));
            break;

        default: // light
            accentBaseColor.withDefault(light);
            accentPalette.withDefault(PaletteRGB.from(light));
            fillColor.withDefault(swatchFromRgb(teamsLightTheme.colorNeutralBackground1));
            neutralForegroundRest.withDefault(swatchFromRgb(teamsLightTheme.colorNeutralForeground1));
            break;
    }
}