import "solid-js"
import { Badge, Button, Card, DataGrid, DataGridCell, DataGridRow, DesignSystemProvider, Divider, ProgressRing, Select, TextField } from "@fluentui/web-components";
import { AnchoredRegion, BaseProgress, ListboxOption } from "@microsoft/fast-foundation";

// Extend JSX to include all custom elements
declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
        'fluent-card': HTMLAttributes<Card> | Card
        'fluent-button': HTMLAttributes<Button> | Button
        'fluent-text-field': HTMLAttributes<TextField> | TextField
        'fluent-badge': HTMLAttributes<Badge> | Badge
        'fluent-select': HTMLAttributes<Select> | Select
        'fluent-option': HTMLAttributes<ListboxOption> | ListboxOption
        'fluent-anchored-region': HTMLAttributes<AnchoredRegion> | AnchoredRegion
        'fluent-design-system-provider': HTMLAttributes<DesignSystemProvider> | DesignSystemProvider
        'fluent-divider': HTMLAttributes<Divider> | Divider
        'fluent-progress-ring': HTMLAttributes<BaseProgress> | Partial<BaseProgress>
        'fluent-data-grid': HTMLAttributes<DataGrid> | DataGrid
        'fluent-data-grid-row': HTMLAttributes<DataGridRow> | DataGridRow
        'fluent-data-grid-cell': HTMLAttributes<DataGridCell> | DataGridCell
    }
  }
}
