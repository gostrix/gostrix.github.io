// Build a full URL from stream pattern + user credentials.
// All processing is client-side. Nothing leaves the browser.

const DEFAULT_PORTS = {
    rtsp: 554,
    rtsps: 322,
    http: 80,
    https: 443,
    rtmp: 1935,
    bubble: 80,
    mms: 554,
    rtp: 5004,
};

export function buildStreamURL(stream, credentials) {
    const { ip, username, password, channel } = credentials;
    if (!ip) return null;

    const protocol = stream.protocol || 'rtsp';
    const port = stream.port || DEFAULT_PORTS[protocol] || 0;
    const ch = channel || 0;

    // Replace placeholders in URL path
    let path = stream.url;

    const replacements = {
        '[CHANNEL]': ch,
        '[channel]': ch,
        '{CHANNEL}': ch,
        '{channel}': ch,
        '[CHANNEL+1]': ch + 1,
        '[channel+1]': ch + 1,
        '{CHANNEL+1}': ch + 1,
        '{channel+1}': ch + 1,
        '[WIDTH]': 1920,
        '[width]': 1920,
        '[HEIGHT]': 1080,
        '[height]': 1080,
        '[IP]': ip,
        '[ip]': ip,
        '[PORT]': port,
        '[port]': port,
        '[AUTH]': username && password ? btoa(username + ':' + password) : '',
        '[auth]': username && password ? btoa(username + ':' + password) : '',
        '[TOKEN]': '',
        '[token]': '',
    };

    for (const [key, value] of Object.entries(replacements)) {
        path = path.split(key).join(String(value));
    }

    // Replace credential placeholders
    const credUser = [
        '[USERNAME]', '[username]', '[USER]', '[user]',
    ];
    const credPass = [
        '[PASSWORD]', '[password]', '[PASWORD]', '[pasword]',
        '[PASS]', '[pass]', '[PWD]', '[pwd]',
    ];

    for (const ph of credUser) {
        path = path.split(ph).join(username || '');
    }
    for (const ph of credPass) {
        path = path.split(ph).join(password || '');
    }

    // Build full URL
    if (!path.startsWith('/')) path = '/' + path;

    const hostPort = isDefaultPort(protocol, port) ? ip : `${ip}:${port}`;

    if (username && password) {
        return `${protocol}://${username}:${password}@${hostPort}${path}`;
    }

    return `${protocol}://${hostPort}${path}`;
}

function isDefaultPort(protocol, port) {
    return port === 0 || port === DEFAULT_PORTS[protocol];
}
