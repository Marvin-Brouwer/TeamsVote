import { RouteSectionProps } from '@solidjs/router'
import { children, createEffect, createSignal, Show, type Component } from 'solid-js'

import './app.css'

import { DesignSystemProvider, fluentBadge, fluentButton, fluentCard, fluentDataGrid, fluentDataGridCell, fluentDataGridRow, fluentTextField, provideFluentDesignSystem } from '@fluentui/web-components'
// TODO move to themecontext
import { teamsLightTheme } from '@fluentui/tokens';

export const AppRoot: Component<RouteSectionProps> = (props) => {

    const [themeRef, setThemeRef] = createSignal<DesignSystemProvider>();
    const [themeLoaded, setThemeLoaded] = createSignal(false);

    createEffect(() => {
        const themeRoot = themeRef();
        if (!themeRoot) return;

        provideFluentDesignSystem(themeRoot)
            .register(fluentButton())
            .register(fluentTextField())
            .register(fluentBadge())
            .register(fluentCard())
            .register(
                fluentDataGridCell(),
                fluentDataGridRow(),
                fluentDataGrid()
            )
            .withShadowRootMode('open')
            .withDesignTokenRoot(document);

        setThemeLoaded(true)
    })

    return <fluent-design-system-provider
        ref={setThemeRef}
        design-system={teamsLightTheme}
    >
        <Show when={themeLoaded()}>{children(() => props.children)()}</Show>
    </fluent-design-system-provider>
}
