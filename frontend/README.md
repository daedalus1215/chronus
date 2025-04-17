


* create `vite.env.config.ts`
* fill it with
```
export const env = {
    VITE_API_URL: 'http://{server-ip-address}:{server-port}',
    VITE_PORT: '{client-port}',
    VITE_HOST: '0.0.0.0',
    VITE_BASE_URL: '/',
    VITE_ALLOWED_HOSTS: '{fqdn}'
}
```