export function wireApiFetch(app, flags) {
    const outbound = app.ports['wpApiFetch']
    const inbound = app.ports['wpApiFetchResult']

    if (!outbound || !inbound) {
        return
    }

    outbound.subscribe(async (req) => {
        const res = await runRequest(req, flags)
        inbound.send(res)
    })
}

async function runRequest(req, flags) {
    const wpApi = readWpApiFetch()

    if (wpApi) {
        try {
            const body = await wpApi({ path: req.path, method: req.method, data: req.body })
            return { id: req.id, ok: true, status: 200, body }
        } catch (err) {
            const status = (err && err.data && err.data.status) || 500
            return { id: req.id, ok: false, status, body: err }
        }
    }

    const url = isAbsolute(req.path)
        ? req.path
        : trimTrailingSlash(flags.restRoot) + ensureLeadingSlash(req.path)

    try {
        const response = await fetch(url, {
            method: req.method,
            headers: {
                'X-WP-Nonce': flags.restNonce,
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: req.body !== undefined ? JSON.stringify(req.body) : undefined,
        })
        const body = await response.json().catch(() => null)
        return { id: req.id, ok: response.ok, status: response.status, body }
    } catch (err) {
        return { id: req.id, ok: false, status: 0, body: { message: String(err) } }
    }
}

function readWpApiFetch() {
    const wp = globalThis.wp
    return wp && typeof wp.apiFetch === 'function' ? wp.apiFetch : undefined
}

function isAbsolute(path) {
    return /^https?:\/\//i.test(path)
}

function trimTrailingSlash(s) {
    return s.endsWith('/') ? s.slice(0, -1) : s
}

function ensureLeadingSlash(s) {
    return s.startsWith('/') ? s : '/' + s
}
