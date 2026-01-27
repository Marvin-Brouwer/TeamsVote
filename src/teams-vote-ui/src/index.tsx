/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'
import { routeBase, PagesReRouter, namedLazy } from '@quick-vite/gh-pages-spa/solidjs'

import { AppRoot } from './app';

import './index.css'
import { TestDialog } from './pages/test-dialog';

const TeamsRoot = namedLazy(() => import("./app").then(m => m.TeamsRoot));
const SessionRoot = namedLazy(() => import("./app").then(m => m.SessionRoot));

const TabView = namedLazy(() => import("./pages/tab").then(m => m.TabView));
const NewVoteView = namedLazy(() => import("./pages/new-vote").then(m => m.NewVoteView));
const VoterView = namedLazy(() => import("./pages/vote").then(m => m.VoterView));
const NotSupportedPage = namedLazy(() => import("./pages/not-supported").then(m => m.NotSupportedPage));

const Spinner = namedLazy(() => import("./pages/spinner").then(m => m.Spinner));

export const routes = () => <Router base={routeBase()} root={AppRoot}>
    <PagesReRouter>
        <Route path="/teams/spinner/" component={Spinner} />
        <Route path="/teams/" component={TeamsRoot}>
            <Route path="/dialog/" component={TestDialog} />
            <Route path="/tab/" component={TabView} />
            <Route path="/new/:roundKey/" component={NewVoteView} />
            <Route path="/vote/" component={SessionRoot}>
                <Route path="/:token/" component={VoterView} />
            </Route>
        </Route>
        <Route path="/" component={NotSupportedPage} />
        <Route path="*404" component={NotSupportedPage} />
    </PagesReRouter>
</Router>

const root = document.getElementById('root')!

render(routes, root);