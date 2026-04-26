export const sampleFlags = {
    restRoot: 'https://example.test/wp-json/',
    restNonce: 'abc123',
    restNamespace: 'wp/v2',
    ajaxUrl: 'https://example.test/wp-admin/admin-ajax.php',
    ajaxNonce: 'def456',
    mountNode: 'demo-root',
    locale: 'en_GB',
    currentUser: null,
    pluginData: {},
}

export function fakeApp(ports = {}) {
    return {
        init: () => ({ ports }),
    }
}
