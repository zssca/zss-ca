'use client'

import { useEffect, useRef } from 'react'

const PENDING_FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity="0.3"/><path d="M44 24a20 20 0 0 0-20-20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite"/></path></svg>',
  )

export function useFaviconPending(pending: boolean): void {
  const originalHrefRef = useRef<string | null>(null)

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
    if (!link) {
      return
    }

    if (!originalHrefRef.current) {
      originalHrefRef.current = link.href
    }

    if (pending) {
      link.dataset['authPending'] = 'true'
      link.href = PENDING_FAVICON
    } else if (link.dataset['authPending'] === 'true') {
      link.href = originalHrefRef.current ?? link.href
      delete link.dataset['authPending']
    }

    return () => {
      if (link.dataset['authPending'] === 'true') {
        link.href = originalHrefRef.current ?? link.href
        delete link.dataset['authPending']
      }
    }
  }, [pending])
}
