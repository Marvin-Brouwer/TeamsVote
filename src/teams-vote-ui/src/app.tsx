import { RouteSectionProps } from '@solidjs/router'
import { children, type Component } from 'solid-js'
import { Theme } from './theme'

import './app.css'

export const AppRoot: Component<RouteSectionProps> = (props) => {
    return <Theme>
        {children(() => props.children)()}
    </Theme>
}
