// Empty registry placeholder.
// FlashMatch sends app emails via the sendAppEmail helper in `_shared/sendEmail.ts`
// (custom HTML + 8-language support), so no React Email templates are registered here.
// This file exists only so the scaffolded `send-transactional-email` Edge Function
// can still build. Add entries here only if you want to use the template-based send flow.

import type { ComponentType } from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, unknown>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {}