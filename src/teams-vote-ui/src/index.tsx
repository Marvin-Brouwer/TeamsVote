/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'
import { routeBase, PagesReRouter, namedLazy } from '@quick-vite/gh-pages-spa/solidjs'

import { AppRoot } from './app'
const ManagementView = namedLazy(() => import("./pages/manage").then(m => m.ManagementView));
const VoterView = namedLazy(() => import("./pages/vote").then(m => m.VoterView));
const NotSupportedPage = namedLazy(() => import("./pages/not-supported").then(m => m.NotSupportedPage));

render(() =>
    <Router base={routeBase()} root={AppRoot}>
        <PagesReRouter>
            <Route path="/manage/:teamsChannelId/" component={ManagementView} />
            <Route path="/vote/:teamsChannelId/" component={VoterView} />
            <Route path="/" component={NotSupportedPage} />
            <Route path="*404" component={NotSupportedPage} />
        </PagesReRouter>
    </Router>,
    document.getElementById('root')!
)