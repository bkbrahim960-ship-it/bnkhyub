const LOVABLE_SELECTORS = [
  '[data-lovable-badge]','[class*="lovable-badge"]','[class*="lovable_badge"]',
  '[id*="lovable"]','a[href*="lovable.dev"]','a[href*="lovable.app"]',
  'a[href*="gptengineer.app"]','[data-lovable]','[data-gptengineer]',
  '[class*="powered-by-lovable"]','[aria-label*="Lovable"]',
]
const LOVABLE_TEXT_PATTERNS = [
  /made with lovable/i,/lovable.dev/i,/lovable.app/i,
  /gptengineer/i,/powered by lovable/i,
]
const shouldRemove = (el: Element) => {
  if (LOVABLE_SELECTORS.some(sel => { try { return el.matches(sel) } catch { return false } })) return true
  const text = el.textContent || ''
  if (LOVABLE_TEXT_PATTERNS.some(p => p.test(text))) {
    if (el.children.length < 5 && text.length < 200) return true
  }
  const href = (el as HTMLElement).getAttribute?.('href') || ''
  if (href.includes('lovable') || href.includes('gptengineer')) return true
  return false
}
const removeElement = (el: Element) => {
  (el as HTMLElement).style.cssText = `display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;z-index:-9999!important;`
  try { el.remove() } catch {}
}
export const initRemoveLovable = () => {
  const scan = () => {
    LOVABLE_SELECTORS.forEach(sel => { try { document.querySelectorAll(sel).forEach(removeElement) } catch {} })
    document.querySelectorAll('a,span,div,button,p,small,footer').forEach(el => { if (shouldRemove(el)) removeElement(el) })
  }
  scan()
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach(node => {
        if (node.nodeType !== 1) return
        if (shouldRemove(node as Element)) { removeElement(node as Element); return }
        (node as Element).querySelectorAll?.('*')?.forEach(child => { if (shouldRemove(child)) removeElement(child) })
      })
    })
  })
  observer.observe(document.body || document.documentElement, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ['class','id','data-lovable','href']
  })
  let count = 0
  const interval = setInterval(() => { scan(); if (++count >= 15) clearInterval(interval) }, 2000)
  return observer
}
