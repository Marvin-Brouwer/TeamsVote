import { RouteSectionProps } from '@solidjs/router'
import { ParentComponent, type Component } from 'solid-js'
import { ThemeProvider } from './theme'
import { TeamsProvider } from './contexts/teams-context'
import { SessionProvider } from './contexts/session-context'

import './app.css'

export const AppRoot: Component<RouteSectionProps> = (props) => {
    return <ThemeProvider>
        {props.children}
    </ThemeProvider>
}

export const TeamsRoot: ParentComponent = (props) => {
    return <TeamsProvider>
        {props.children}
    </TeamsProvider>
}

export const SessionRoot: ParentComponent = (props) => {
    return <SessionProvider>
        {props.children}
    </SessionProvider>
}

