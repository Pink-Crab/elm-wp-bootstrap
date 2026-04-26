export function wireClipboard(app) {
    const outbound = app.ports['copyToClipboard']
    if (!outbound) {
        return
    }

    outbound.subscribe((text) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            void navigator.clipboard.writeText(text)
            return
        }
        legacyCopy(text)
    })
}

function legacyCopy(text) {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    ta.style.pointerEvents = 'none'
    document.body.appendChild(ta)
    ta.select()
    try {
        document.execCommand('copy')
    } catch {
        // ignore
    }
    ta.remove()
}
