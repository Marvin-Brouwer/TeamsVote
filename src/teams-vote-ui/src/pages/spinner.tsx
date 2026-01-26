import type { Component } from "solid-js";

import "./spinner.css"

export const Spinner: Component = () => <div class="view loading-spinner">
    <fluent-progress-ring />
</div>