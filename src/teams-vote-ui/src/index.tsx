/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'
import { routeBase, PagesReRouter, namedLazy } from '@quick-vite/gh-pages-spa/solidjs'

import { AppRoot } from './app';
import { TeamsProvider } from './contexts/teams-context'

const ManagementView = namedLazy(() => import("./pages/manage").then(m => m.ManagementView));
const VoterView = namedLazy(() => import("./pages/vote").then(m => m.VoterView));
const NotSupportedPage = namedLazy(() => import("./pages/not-supported").then(m => m.NotSupportedPage));

export const routes = () => <Router base={routeBase()} root={AppRoot}>
    <PagesReRouter>
        <Route path="/teams/" component={TeamsProvider}>
            <Route path="/manage/:teamsChannelId/:roundKey" component={ManagementView} />
            <Route path="/vote/:teamsChannelId/:roundKey/:token" component={VoterView} />
        </Route>
        <Route path="/" component={NotSupportedPage} />
        <Route path="*404" component={NotSupportedPage} />
    </PagesReRouter>
</Router>

const root = document.getElementById('root')!

render(routes, root);