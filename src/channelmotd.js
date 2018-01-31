
import path from 'path';
import {readFileSync} from 'fs';
import escape from 'escape-html';

const DELAY_TIME = 1000;
const MOTD_USE_HTML = false;
const MOTD_MESSAGE = `Welcome %u to %c`;

const FIRST_NAME = 'first_name';
const LAST_NAME = 'last_name';
const INVITE_LINK = 'invite_link';
const IS_BOT = 'is_bot';

const tryFile = function tryFile(file) {
    if (!file || typeof file !== 'string') {
        return undefined;
    }

    return readFileSync(path.resolve(file), {
        encoding: 'utf8',
    });
}

export default class ChannelMotd {

    constructor(channel, data, config, debug) {
        this._channel = channel; 
        this._data = data;
        this._config = Object.assign({
            motd: MOTD_MESSAGE,
            motdFile: null,
            html: MOTD_USE_HTML,
            delayTime: DELAY_TIME,
        }, config);
        this._newusers = [];
        this._debug = debug;

        this._motd = {
            singular: null,
            plural: null,
        };

        this.debug(`Creating motd wrapper for ${channel.name}`);
        this._loadMotd();
        this._handleChannel();
    }

    debug(...args) {
        this._debug(...args);
    }

    update(data) {
        this._data = data;
    }

    _loadMotd() {
        let {motd, motdFile} = this._config;

        if (typeof motdFile !== 'object' || !motdFile) {
            motdFile = {
                singular: motdFile,
                plural: motdFile,
            };
        }

        if (typeof motd !== 'object' || !motd) {
            motd = {
                singular: motd,
                plural: motd,
            }
        }

        this._motd.singular = tryFile(motdFile.singular) || motd.singular; 
        this._motd.plural = tryFile(motdFile.plural) || motd.plural; 
    }

    _handleChannel() {
        this.debug("handle channel events");
        this._channel.on('join', (_user) => {
            let user = Object.assign({}, _user);

            this.debug("User join", user.id);

            if (user[IS_BOT]) {
                this.debug('New user is a bot, ignoring to retard the skynet');
                return;
            }

            this._newusers.push(user);
            this.showMotdAsap();
        });
    }

    parseMessage() {
        let message = "";

        if (this._newusers.length > 1) {
            message = this._motd.plural;
        } else {
            message = this._motd.singular;
        }

        let names = this._newusers.map((u) => {
            let firstName = u[FIRST_NAME] || '';
            let lastName = u[LAST_NAME] || '';
            let completeName = (`${firstName} ${lastName}`).trim();

            if (completeName === "") {
                completeName = u.username;
            }

            if (this._config.html) {
                return `<a href="tg://user?id=${u.id}">` +
                       `${escape(completeName)}</a>`;
            } else {
                return `[${completeName}](tg://user?id=${u.id})`;
            }
        });

        let inviteLink = this._data[INVITE_LINK] || "";

        return message
                    .replace(/%u/g, names.join(', '))
                    .replace(/%c/g, this._data.title)
                    .replace(/%l/g, inviteLink)
            ;
    }

    showMotd() {
        let message = this.parseMessage();
        this._newusers = [];

        this.debug('Sending motd', message);
        this._channel.sendMessage(message, {
            "parse_mode": this._config.html ? 'HTML' : 'Markdown',
            "disable_web_page_preview": true,
            "disable_notification": true,
        });
    }

    showMotdAsap() {
        if (this._ts) {
            clearTimeout(this._ts);
        } 

        this._ts = setTimeout(() => {
            this.showMotd();
        }, this._config.delayTime);
    }

    get name() {
        return this._data.name;
    }

    get id() {
        return this._channel.id;
    }
}
