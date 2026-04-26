import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { boot } from '../src/boot.js'
import { fakeApp, sampleFlags } from './fixtures.js'

describe('boot', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="root"></div>'
    })

    afterEach(() => {
        delete globalThis.demo
        delete globalThis.wp
    })

    it('throws when window.<handle> is missing', () => {
        expect(() =>
            boot({
                handle: 'demo',
                node: '#root',
                app: fakeApp(),
            })
        ).toThrow(/window\.demo is not present/)
    })

    it('throws when the mount node selector does not match', () => {
        globalThis.demo = sampleFlags
        expect(() =>
            boot({
                handle: 'demo',
                node: '#missing',
                app: fakeApp(),
            })
        ).toThrow(/mount node not found/)
    })

    it('passes the resolved node and flags to the Elm program', () => {
        globalThis.demo = sampleFlags
        const init = vi.fn().mockReturnValue({ ports: {} })

        boot({ handle: 'demo', node: '#root', app: { init } })

        expect(init).toHaveBeenCalledTimes(1)
        const config = init.mock.calls[0][0]
        expect(config.flags).toBe(sampleFlags)
        expect(config.node.id).toBe('root')
    })

    it('accepts an HTMLElement directly as the mount node', () => {
        globalThis.demo = sampleFlags
        const node = document.getElementById('root')
        const init = vi.fn().mockReturnValue({ ports: {} })

        boot({ handle: 'demo', node, app: { init } })

        const config = init.mock.calls[0][0]
        expect(config.node).toBe(node)
    })

    it('runs the user-supplied ports callback with app and flags', () => {
        globalThis.demo = sampleFlags
        const elmApp = { ports: {} }
        const userPorts = vi.fn()

        boot({
            handle: 'demo',
            node: '#root',
            app: { init: () => elmApp },
            ports: userPorts,
        })

        expect(userPorts).toHaveBeenCalledWith(elmApp, sampleFlags)
    })
})
