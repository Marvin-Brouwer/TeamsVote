import { RouteSectionProps } from '@solidjs/router'
import { children, type Component } from 'solid-js'
import { ThemeProvider } from './theme'

import './app.css'

export const AppRoot: Component<RouteSectionProps> = (props) => {
    return <ThemeProvider>
        {children(() => props.children)()}
    </ThemeProvider>
}
