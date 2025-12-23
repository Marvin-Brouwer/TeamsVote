import { RouteSectionProps } from '@solidjs/router'
import { children, createEffect, createSignal, Show, type Component } from 'solid-js'
import { DesignSystemProvider, fluentAnchoredRegion, fluentBadge, fluentButton, fluentCard, fluentDataGrid, fluentDataGridCell, fluentDataGridRow, fluentOption, fluentSelect, fluentTextField, provideFluentDesignSystem } from '@fluentui/web-components'

import './app.css'

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
            .register(fluentSelect(), fluentOption())
            .register(fluentBadge())
            .register(fluentCard())
            .register(
                fluentDataGridCell(),
                fluentDataGridRow(),
                fluentDataGrid()
            )
            .register(fluentAnchoredRegion())
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
