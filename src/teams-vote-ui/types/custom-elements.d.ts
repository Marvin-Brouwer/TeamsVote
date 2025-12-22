// src/custom-elements.d.ts
import { Badge, Button, Card, DataGrid, DesignSystemProvider, Divider, ProgressRing, TextField } from "@fluentui/web-components";

// Extend JSX to include all custom elements
declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
        'fluent-card': HTMLAttributes<Card> | Card
        'fluent-button': HTMLAttributes<Button> | Button
        'fluent-text-field': HTMLAttributes<TextField> | TextField
        'fluent-badge': HTMLAttributes<Badge> | Badge
        'fluent-design-system-provider': HTMLAttributes<DesignSystemProvider> | DesignSystemProvider
        'fluent-divider': HTMLAttributes<Divider> | Divider
        'fluent-progress-ring': HTMLAttributes<ProgressRing> | ProgressRing
        'fluent-data-grid': HTMLAttributes<DataGrid> | DataGrid
    }
  }
}
