import { RouteSectionProps, useLocation } from '@solidjs/router'
import { children, type Component } from 'solid-js'

import './app.css'

export const AppRoot: Component<RouteSectionProps> = (props) => {

    const route = useLocation()

    return <div>
        <p>Route: {route.pathname}</p>
        {children(() => props.children)()}
    </div>
}