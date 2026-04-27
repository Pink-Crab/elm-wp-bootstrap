# @pinkcrab/elm-wp-bootstrap

JS bootstrap for Elm apps mounted in WordPress by [`pinkcrab/elm-mount`](https://github.com/Pink-Crab/elm-mount). Reads the localized flags blob, hands them to your Elm app, and wires four standard ports for REST calls, admin notices, and clipboard.

Part of a three-package set:

| Role | Package |
|------|---------|
| PHP mount helper | [`pinkcrab/elm-mount`](https://github.com/Pink-Crab/elm-mount) |
| JS bootstrap (this package) | [`@pinkcrab/elm-wp-bootstrap`](https://github.com/Pink-Crab/elm-wp-bootstrap) |
| Elm package | [`Pink-Crab/elm-wp`](https://github.com/Pink-Crab/elm-wp) |

## Install

```bash
npm install @pinkcrab/elm-wp-bootstrap
```

## Usage

```js
import { Elm } from './Main.elm'
import { boot } from '@pinkcrab/elm-wp-bootstrap'

boot({
    handle: 'my_settings',
    node: '#my_settings-root',
    app: Elm.Main,
    ports: (app, flags) => {
        app.ports.myCustomPort?.subscribe(/* ... */)
    },
})
```

`boot()` does:

1. Reads `window.<handle>` (set by the PHP package via `wp_localize_script`).
2. Resolves the mount node (CSS selector or `HTMLElement`).
3. Calls `app.init({ node, flags })`.
4. Wires the four standard ports (see [Contract](#contract)) — silently no-ops for any port the Elm app doesn't declare.
5. Calls your optional `ports(app, flags)` for app-specific port wiring.

### Standard port behaviour

- **`wpApiFetch` → `wpApiFetchResult`** — uses `window.wp.apiFetch` if available (which auto-attaches the REST nonce); falls back to raw `fetch` with `X-WP-Nonce` from `flags.restNonce` and `credentials: 'same-origin'`.
- **`wpNotice`** — uses `wp.data.dispatch('core/notices').createNotice` if available; otherwise injects a fixed-position toast into the DOM (auto-removed after 5s).
- **`copyToClipboard`** — `navigator.clipboard.writeText` with a hidden-textarea + `execCommand('copy')` legacy fallback.

## Contract

This section is the **authoritative spec** shared by all three packages. Any change here is a contract bump and must be mirrored in the other two repos in lockstep.

### Flags blob

Emitted by the PHP side via `wp_localize_script( $handle, $handle, $blob )`. Read from `window.<handle>` and handed to Elm as flags.

```json
{
  "restRoot":     "https://example.test/wp-json/",
  "restNonce":    "abc123...",
  "restNamespace":"wp/v2",
  "ajaxUrl":      "https://example.test/wp-admin/admin-ajax.php",
  "ajaxNonce":    "def456...",
  "mountNode":    "my_settings-root",
  "locale":       "en_GB",
  "currentUser": {
    "id":          1,
    "displayName": "Glynn Quelch",
    "roles":       ["administrator"],
    "capabilities":["manage_options", "edit_posts"]
  },
  "pluginData": {
    "pageTitle": "My Settings",
    "canEdit":   true
  }
}
```

Notes:
- `restNonce` is minted from the `wp_rest` action and is what `wp.apiFetch` needs.
- `ajaxNonce` is minted from a package-specific action (`elm_mount_<handle>`) for the legacy `admin-ajax.php` path.
- `pluginData` is the only free-form section — user-supplied flags via `->flags( [...] )` on the PHP side.
- `currentUser` is `null` when the visitor is logged out.
- `capabilities` is a UI hint for Elm to disable buttons etc; **never trust it for authorisation** (server-side checks are the real gate).

### Port names

The JS bootstrap and the Elm package must agree on these names. Changing any is a contract break.

| Direction | Port name | Purpose |
|-----------|-----------|---------|
| Elm → JS  | `wpApiFetch`       | Outbound REST call. Payload: `{ id, method, path, body? }`. |
| JS → Elm  | `wpApiFetchResult` | Paired response. Payload: `{ id, ok, status, body }`. |
| Elm → JS  | `wpNotice`         | Show an admin notice. Payload: `{ kind: "success"\|"error"\|"info"\|"warning", message }`. |
| Elm → JS  | `copyToClipboard`  | Copy text to clipboard. Payload: `string`. |

`id` on `wpApiFetch` / `wpApiFetchResult` is a string correlation id the Elm side generates so multiple in-flight requests can be matched to their responses.

### Versioning

All three packages share a major version. Within `1.x`, minor and patch versions can move independently per package — compatibility is guaranteed across the same major.

| `pinkcrab/elm-mount` | `@pinkcrab/elm-wp-bootstrap` | `Pink-Crab/elm-wp` |
|----------------------|------------------------------|--------------------|
| `1.x`                | `1.x`                        | `1.x`              |

## License

MIT © PinkCrab
