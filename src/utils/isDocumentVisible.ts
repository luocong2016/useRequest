import { canUseDom } from './canUseDom'

export function isDocumentVisible(): boolean {
  if (canUseDom()) {
    return document.visibilityState !== 'hidden'
  }
  return true
}
