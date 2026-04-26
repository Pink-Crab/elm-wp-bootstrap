import { wireApiFetch } from './ports/apiFetch.js'
import { wireClipboard } from './ports/clipboard.js'
import { wireNotice } from './ports/notice.js'

export function boot(config) {
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

function resolveNode(target) {
    if (typeof target === 'string') {
        return document.querySelector(target)
    }
    return target
}

function readFlags(handle) {
    const blob = globalThis[handle]
    if (!blob || typeof blob !== 'object') {
        throw new Error(
            `@pinkcrab/elm-wp-bootstrap: window.${handle} is not present — did you forget to enqueue and localize on the PHP side?`
        )
    }
    return blob
}
