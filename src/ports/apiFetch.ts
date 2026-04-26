import type {
    ApiFetchRequest,
    ApiFetchResponse,
    ElmApp,
    ElmInboundPort,
    ElmOutboundPort,
    FlagsBlob,
} from '../types'

type WpApiFetch = (opts: { path: string; method: string; data?: unknown }) => Promise<unknown>

export function wireApiFetch(app: ElmApp, flags: FlagsBlob): void {
    const outbound = app.ports['wpApiFetch'] as ElmOutboundPort<ApiFetchRequest> | undefined
    const inbound = app.ports['wpApiFetchResult'] as ElmInboundPort<ApiFetchResponse> | undefined

    if (!outbound || !inbound) {
        return
    }

    outbound.subscribe(async (req) => {
        const res = await runRequest(req, flags)
        inbound.send(res)
    })
}

async function runRequest(req: ApiFetchRequest, flags: FlagsBlob): Promise<ApiFetchResponse> {
    const wpApi = readWpApiFetch()

    if (wpApi) {
        try {
            const body = await wpApi({ path: req.path, method: req.method, data: req.body })
            return { id: req.id, ok: true, status: 200, body }
        } catch (err) {
            const status = (err as { data?: { status?: number } })?.data?.status ?? 500
            return { id: req.id, ok: false, status, body: err }
        }
    }

    const url = isAbsolute(req.path) ? req.path : trimTrailingSlash(flags.restRoot) + ensureLeadingSlash(req.path)

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

function readWpApiFetch(): WpApiFetch | undefined {
    const wp = (globalThis as { wp?: { apiFetch?: WpApiFetch } }).wp
    return typeof wp?.apiFetch === 'function' ? wp.apiFetch : undefined
}

function isAbsolute(path: string): boolean {
    return /^https?:\/\//i.test(path)
}

function trimTrailingSlash(s: string): string {
    return s.endsWith('/') ? s.slice(0, -1) : s
}

function ensureLeadingSlash(s: string): string {
    return s.startsWith('/') ? s : '/' + s
}
