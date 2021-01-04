import https from 'https';
import EventEmitter from 'events';

export default class CouchdbChangeEvents extends EventEmitter {
    constructor({
        host = 'localhost',
        port = 5984,
        protocol = 'https:',
        heartbeat = 2000,
        includeDocs = true,
        autoConnect = true,
        lastEventId,
        user,
        password,
        database,
        feed = 'eventsource',
        view,
        style,
        conflicts = false,
        rejectUnauthorized = true,
        delay = 100
    }) {
        super();

        this.COUCHDB_STATUS_CONNECTED = 'connected';
        this.COUCHDB_STATUS_DISCONNECTED = 'disconnected';

        if (!database) {
            let noDbError = new Error('database parameter missing from config');

            noDbError.error_type = 'EMPTY_DATABASE_PARAMETER';

            throw noDbError;
        }

        this.host = host;
        this.port = port;
        this.protocol = protocol;
        this.database = database;

        this.user = user;
        this.password = password;

        this.includeDocs = includeDocs;
        this.lastEventId = lastEventId;

        this.feed = feed;
        this.style = style;
        this.view = view;
        this.conflicts = conflicts;
        this.rejectUnauthorized = rejectUnauthorized;

        this.initialDelay = Math.floor(delay / 2);
        this.delay = delay;

        this.heartbeat = parseInt(heartbeat, 10) || 2000;

        this.lastHeartBeat = new Date().getTime();

        this.setCouchdbStatus(this.COUCHDB_STATUS_DISCONNECTED);

        this.checkHeartbeat();

        if (autoConnect) {
            this.connect();
        }
    }

    checkHeartbeat() {
        const currentTime = new Date().getTime();

        if (currentTime - this.lastHeartBeat > 10000) {
            if (this.couchDbConnection) {
                this.couchDbConnection.destroy();
            }
        }

        global.setTimeout(this.checkHeartbeat.bind(this), 1000);
    }

    connect() {
        let client = https;

        const requestOptions = this.getRequestOptions();
        this.lastHeartBeat = new Date().getTime();

        client.request(requestOptions, (response) => {
            this.couchDbConnection = response;

            if ((response.headers.server || '').match(/^couchdb/i)) {
                this.rawData = '';
                this.couchDbConnection.on('data', this.onCouchdbChange.bind(this));
                this.couchDbConnection.on('end', this.reconnect.bind(this));
            } else {
                response.destroy();
                this.emitError(new Error('not_couchdb'));
                this.reconnect();
            }
        }).on('error', (error) => {
            this.emitError(error);
            this.reconnect();
        }).end();
    }

    onCouchdbChange(data) {
        this.setCouchdbStatus(this.COUCHDB_STATUS_CONNECTED);
        this.delay = this.initialDelay;

        this.lastHeartBeat = new Date().getTime();

        this.rawData += data.toString();

        const messages = this.rawData.split('\n');

        this.rawData = messages.pop();

        if (messages.length > 0) {
            for (let change of messages) {
                if (change === '') {
                    continue;
                }

                let couchdbChange = JSON.parse(change, (key, value) =>
                    typeof value === 'string'
                        ? value.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
                        : value
                );

                if (couchdbChange.error) {
                    const error = new Error(couchdbChange.error);

                    error.reason = couchdbChange.reason;

                    this.emitError(error);
                } else {
                    this.lastEventId = couchdbChange.seq;
                    this.emit('data', couchdbChange);
                }
            }
        }
    }

    emitError(error) {
        this.emit('couchdb_error', error);
    }

    reconnect() {
        this.setCouchdbStatus(this.COUCHDB_STATUS_DISCONNECTED);
        this.delay = this.delay * 2;
        global.setTimeout(this.connect.bind(this), this.delay);
    }

    setCouchdbStatus(status) {
        if (this.couchdbStatus !== status) {
            this.couchdbStatus = status;

            this.emit('couchdb_status', status);
        }
    }

    getRequestOptions() {
        let couchDbPath = `/${encodeURIComponent(this.database)}`,
            auth;

        couchDbPath += `/_changes`;
        couchDbPath += `?feed=${this.feed}`;
        couchDbPath += `&heartbeat=${this.heartbeat}`;

        if (this.includeDocs) {
            couchDbPath += '&include_docs=true';
        }

        if (this.conflicts) {
            couchDbPath += '&conflicts=true';
        }

        if (this.lastEventId) {
            let lastEventId = encodeURIComponent(this.lastEventId);

            couchDbPath += `&since=${lastEventId}`;
        }

        if (this.view) {
            let view = encodeURIComponent(this.view);

            couchDbPath += `&filter=_view&view=${view}`;
        }

        if (this.style) {
            let style = encodeURIComponent(this.style);

            couchDbPath += `&style=${style}`;
        }

        if (this.user) {
            auth = `${this.user}:${this.password}`;
        }

        return {
            protocol: this.protocol,
            host: this.host,
            port: this.port,
            path: couchDbPath,
            method: 'get',
            auth: auth,
            headers: { 'content-type': 'application/json' },
            rejectUnauthorized: this.rejectUnauthorized
        };
    }

    getSSEUrl() {
        const opts = this.getRequestOptions();
        const addr = `${opts.protocol}//${opts.auth}@${opts.host}:${opts.port}${opts.path}`;
        return addr;
    }

    getCouchDbUrl() {
        const opts = this.getRequestOptions();
        const url = `${opts.protocol}//${opts.auth}@${opts.host}:${opts.port}`;
        return url;
    }
}