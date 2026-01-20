import { children, createEffect, createSignal, Show, type ParentComponent } from 'solid-js'
import * as component from '@fluentui/web-components'
import { DesignSystemProvider, provideFluentDesignSystem } from '@fluentui/web-components'
import { teamsLightTheme } from '@fluentui/tokens';
import { type DesignSystem } from '@microsoft/fast-foundation';

import "./theme.css";

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

export const Theme: ParentComponent = (props) => {

    const [themeRef, setThemeRef] = createSignal<DesignSystemProvider>();
    const [themeLoaded, setThemeLoaded] = createSignal(false);

    createEffect(() => {
        const themeRoot = themeRef();
        if (!themeRoot) return;

        registerComponents(provideFluentDesignSystem(themeRoot))
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
