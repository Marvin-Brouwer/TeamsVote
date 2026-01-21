import * as component from '@fluentui/web-components'
import type { DesignSystem } from '@microsoft/fast-foundation';

export function registerComponents(system: DesignSystem): DesignSystem {

    return system
        .register(component.fluentButton())
        .register(component.fluentTextField())
        .register(
            component.fluentSelect(),
            component.fluentOption()
        )
        .register(component.fluentBadge())
        .register(component.fluentCard())
        .register(
            component.fluentDataGridCell(),
            component.fluentDataGridRow(),
            component.fluentDataGrid()
        )
        .register(component.fluentAnchoredRegion())
        .register(component.fluentProgressRing())
}