import { wireApiFetch } from './ports/apiFetch'
import { wireClipboard } from './ports/clipboard'
import { wireNotice } from './ports/notice'
import type { BootConfig, ElmApp, FlagsBlob } from './types'

export function boot(config: BootConfig): ElmApp {
    const node = resolveNode(config.node)
    if (!node) {
        const target = typeof config.node === 'string' ? config.node : '<HTMLElement>'
        throw new Error(`@pinkcrab/elm-wp-bootstrap: mount node not found (${target})`)
    }

    const flags = readFlags(config.handle)

    const app = config.app.init({ node, flags })

    wireApiFetch(app, flags)
    wireNotice(app)
    wireClipboard(app)

    if (typeof config.ports === 'function') {
        config.ports(app, flags)
    }

    return app
}

function resolveNode(target: string | HTMLElement): HTMLElement | null {
    if (typeof target === 'string') {
        return document.querySelector<HTMLElement>(target)
    }
    return target
}

function readFlags(handle: string): FlagsBlob {
    const blob = (globalThis as Record<string, unknown>)[handle]
    if (!blob || typeof blob !== 'object') {
        throw new Error(
            `@pinkcrab/elm-wp-bootstrap: window.${handle} is not present — did you forget to enqueue and localize on the PHP side?`
        )
    }
    return blob as FlagsBlob
}

export type {
    ApiFetchRequest,
    ApiFetchResponse,
    BootConfig,
    CurrentUser,
    ElmApp,
    ElmInboundPort,
    ElmOutboundPort,
    ElmProgram,
    FlagsBlob,
    HttpMethod,
    Notice,
    NoticeKind,
} from './types'
