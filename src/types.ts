export interface CurrentUser {
    id: number
    displayName: string
    roles: string[]
    capabilities: string[]
}

export interface FlagsBlob {
    restRoot: string
    restNonce: string
    restNamespace: string
    ajaxUrl: string
    ajaxNonce: string
    mountNode: string
    locale: string
    currentUser: CurrentUser | null
    pluginData: unknown
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiFetchRequest {
    id: string
    method: HttpMethod
    path: string
    body?: unknown
}

export interface ApiFetchResponse {
    id: string
    ok: boolean
    status: number
    body: unknown
}

export type NoticeKind = 'success' | 'error' | 'info' | 'warning'

export interface Notice {
    kind: NoticeKind
    message: string
}

export interface ElmOutboundPort<T> {
    subscribe: (cb: (data: T) => void) => void
    unsubscribe?: (cb: (data: T) => void) => void
}

export interface ElmInboundPort<T> {
    send: (data: T) => void
}

export interface ElmApp {
    ports: Record<string, ElmOutboundPort<unknown> | ElmInboundPort<unknown>>
}

export interface ElmProgram {
    init: (config: { node: HTMLElement; flags: unknown }) => ElmApp
}

export interface BootConfig {
    handle: string
    node: string | HTMLElement
    app: ElmProgram
    ports?: (app: ElmApp, flags: FlagsBlob) => void
}
