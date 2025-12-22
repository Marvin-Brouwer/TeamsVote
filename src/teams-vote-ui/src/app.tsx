import { RouteSectionProps, useLocation } from '@solidjs/router'
import { children, createEffect, createSignal, Show, type Component } from 'solid-js'

import './app.css'

import { DesignSystemProvider, fluentBadge, fluentButton, fluentCard, provideFluentDesignSystem } from '@fluentui/web-components'
// TODO move to themecontext
import { teamsLightTheme, } from '@fluentui/tokens';

export const AppRoot: Component<RouteSectionProps> = (props) => {

    const route = useLocation()
    const [themeRef, setThemeRef] = createSignal<DesignSystemProvider>();
    const [themeLoaded, setThemeLoaded] = createSignal(false);

    createEffect(() => {
        const themeRoot = themeRef();
        if (!themeRoot) return;

        provideFluentDesignSystem(themeRoot)
            .register(fluentButton())
            .register(fluentBadge())
            .register(fluentCard())
            .withShadowRootMode('open')
            .withDesignTokenRoot(themeRoot);

        setThemeLoaded(true)
    })

    return <fluent-design-system-provider
        ref={setThemeRef} use-provider-registrations
        design-system={teamsLightTheme}
    >
        <p>Route: {route.pathname}</p>
        <Show when={themeLoaded()}>{children(() => props.children)()}</Show>
    </fluent-design-system-provider>
}
