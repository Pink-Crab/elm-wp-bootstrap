export function wireNotice(app) {
    const outbound = app.ports['wpNotice']
    if (!outbound) {
        return
    }

    outbound.subscribe((notice) => {
        const dispatch = readWpNoticesDispatch()
        if (dispatch && typeof dispatch.createNotice === 'function') {
            dispatch.createNotice(notice.kind, notice.message, { isDismissible: true })
            return
        }
        domFallback(notice)
    })
}

function readWpNoticesDispatch() {
    const wp = globalThis.wp
    if (!wp || !wp.data || typeof wp.data.dispatch !== 'function') {
        return undefined
    }
    return wp.data.dispatch('core/notices')
}

function domFallback(notice) {
    const host = ensureHost()
    const el = document.createElement('div')
    el.className = `notice notice-${notice.kind} is-dismissible`
    el.style.padding = '8px 12px'
    el.style.margin = '8px 0'
    el.style.background = '#fff'
    el.style.borderLeft = `4px solid ${noticeColor(notice.kind)}`
    el.style.boxShadow = '0 1px 1px rgba(0,0,0,.04)'
    el.textContent = notice.message
    host.appendChild(el)
    setTimeout(() => el.remove(), 5000)
}

function ensureHost() {
    const existing = document.querySelector('.elm-wp-notices')
    if (existing) {
        return existing
    }
    const host = document.createElement('div')
    host.className = 'elm-wp-notices'
    host.style.position = 'fixed'
    host.style.top = '32px'
    host.style.right = '16px'
    host.style.zIndex = '9999'
    host.style.maxWidth = '360px'
    document.body.appendChild(host)
    return host
}

function noticeColor(kind) {
    switch (kind) {
        case 'success':
            return '#46b450'
        case 'error':
            return '#dc3232'
        case 'warning':
            return '#ffb900'
        case 'info':
            return '#00a0d2'
        default:
            return '#00a0d2'
    }
}
