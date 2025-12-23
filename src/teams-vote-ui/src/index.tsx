/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'
import { routeBase, PagesReRouter, namedLazy } from '@quick-vite/gh-pages-spa/solidjs'

import { AppRoot } from './app';
import { TeamsProvider } from './contexts/teams-context'
import { SessionProvider } from './contexts/session-context';

import './index.css'

const TabView = namedLazy(() => import("./pages/tab").then(m => m.TabView));
const VoterView = namedLazy(() => import("./pages/vote").then(m => m.VoterView));
const NotSupportedPage = namedLazy(() => import("./pages/not-supported").then(m => m.NotSupportedPage));

export const routes = () => <Router base={routeBase()} root={AppRoot}>
    <PagesReRouter>
        <Route path="/teams/" component={TeamsProvider}>
            <Route path="/tab/" component={TabView} />
            <Route path="/vote/" component={SessionProvider}>
                <Route path="/:teamsChannelId/:token" component={VoterView} />
            </Route>
        </Route>
        <Route path="/" component={NotSupportedPage} />
        <Route path="*404" component={NotSupportedPage} />
    </PagesReRouter>
</Router>

const root = document.getElementById('root')!

render(routes, root);