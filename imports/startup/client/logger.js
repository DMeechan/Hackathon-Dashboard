import logger from '/imports/modules/logger.js';

catchClientErrors();

function catchClientErrors() {
    /* Store original window.onerror */
    const _GlobalErrorHandler = window.onerror;

    window.onerror = (msg, url, line) => {
        logger.error(msg, { file: url, onLine: line });
        if (_GlobalErrorHandler) {
            _GlobalErrorHandler.apply(this, arguments);
        }
    };
}