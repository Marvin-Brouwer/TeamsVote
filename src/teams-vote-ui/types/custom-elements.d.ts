// src/custom-elements.d.ts
import { Badge, Button, Card, DesignSystemProvider } from "@fluentui/web-components";

// Extend JSX to include all custom elements
declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
        'fluent-card': HTMLAttributes<Card> & Omit<Card>
        'fluent-button': HTMLAttributes<Button> & Omit<Button>
        'fluent-badge': HTMLAttributes<Badge> & Omit<Badge>
        'fluent-design-system-provider': HTMLAttributes<DesignSystemProvider> & Omit<DesignSystemProvider>
    }
  }
}
