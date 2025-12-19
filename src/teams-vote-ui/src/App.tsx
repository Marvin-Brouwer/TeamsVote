import { RouteSectionProps, useLocation } from '@solidjs/router'
import { children, type Component } from 'solid-js'

import './app.css'
import { TeamsProvider } from './contexts/teams-context'

export const AppRoot: Component<RouteSectionProps> = (props) => {

    const route = useLocation()

    return <div>
        <TeamsProvider>
            <p>Route: {route.pathname}</p>
            {children(() => props.children)()}
        </TeamsProvider>
    </div>
}