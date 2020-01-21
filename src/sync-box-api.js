
const http = require('http');

/**
 * Represents the API.
 * @param platform The PhilipsHueSyncBoxPlatform instance.
 */
function SyncBoxApi(platform) {
    const api = this;

    // Sets the platform
    api.platform = platform;

    // Checks if all required information is provided
    if (!api.platform.config.apiPort) {
        api.platform.log('No API port provided.');
        return;
    }
    if (!api.platform.config.apiToken) {
        api.platform.log('No API token provided.');
        return;
    }

    // Starts the server
    try {
        http.createServer(function (request, response) {
            const payload = [];

            // Subscribes for events of the request
            request.on('error', function () {
                api.platform.log('API - Error received.');
            }).on('data', function (chunk) {
                payload.push(chunk);
            }).on('end', function () {

                // Subscribes to errors when sending the response
                response.on('error', function () {
                    api.platform.log('API - Error sending the response.');
                });

                // Validates the token
                if (!request.headers['authorization']) {
                    api.platform.log('Authorization header missing.');
                    response.statusCode = 401;
                    response.end();
                    return;
                }
                if (request.headers['authorization'] !== api.platform.config.apiToken) {
                    api.platform.log('Token invalid.');
                    response.statusCode = 401;
                    response.end();
                    return;
                }
            
                // Validates the body
                let body = null;
                if (payload && payload.length > 0) {
                    try {
                        body = JSON.parse(Buffer.concat(payload).toString());
                    } catch (e) {
                        api.platform.log('Body malformed.');
                        response.statusCode = 400;
                        response.end();
                    }
                }
                
                // Performs the action based on the method
                switch (request.method) {
                    case 'GET':
                        api.handleGet(response);
                        return;

                    case 'POST':
                        api.handlePost(body, response);
                        return;
                }

                api.platform.log('No action matched.');
                response.statusCode = 404;
                response.end();
            });
        }).listen(api.platform.config.apiPort, "0.0.0.0");
        api.platform.log('API started.');
    } catch (e) {
        api.platform.log('API could not be started: ' + JSON.stringify(e));
    }
}

/**
 * Handles GET requests.
 * @param response The response object.
 */
SyncBoxApi.prototype.handleGet = function (response) {
    const api = this;

    // Gets the state of the device
    api.platform.limiter.schedule(function() { return api.platform.client.getState(); }).then(function(state) {
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify({
            mode: state.execution.mode,
            lastSyncMode: state.execution.lastSyncMode,
            brightness: Math.round((state.execution.brightness / 200.0) * 100),
            hdmiSource: state.execution.hdmiSource,
            options: {
                video: {
                    intensity: state.execution.video.intensity,
                    backgroundLighting: state.execution.video.backgroundLighting
                },
                game: {
                    intensity: state.execution.game.intensity,
                    backgroundLighting: state.execution.game.backgroundLighting
                },
                music: {
                    intensity: state.execution.music.intensity
                }
            }
        }));
        response.statusCode = 200;
        response.end();
    }, function() {
        api.platform.log('Error while getting the state.');
        response.statusCode = 400;
        response.end();
    });
}

/**
 * Handles POST requests.
 * @param body The body of the request.
 * @param response The response object.
 */
SyncBoxApi.prototype.handlePost = function (body, response) {
    const api = this;

    // Validates the content
    if (!body) {
        api.platform.log('Body invalid.');
        response.statusCode = 400;
        response.end();
        return;
    }

    // Defines the new state
    const newState = {};
    if (body.brightness) {
        newState.brightness = Math.round((body.brightness / 100.0) * 200);
    }
    if (body.mode) {
        newState.mode = body.mode;
    }
    if (body.hdmiSource) {
        newState.hdmiSource = body.hdmiSource;
    }
    if (body.options) {
        if (body.options.video) {
            newState.video = {
                intensity: body.options.video.intensity,
                backgroundLighting: body.options.video.intensity
            };
        }
        if (body.options.game) {
            newState.game = {
                intensity: body.options.game.intensity,
                backgroundLighting: body.options.game.intensity
            };
        }
        if (body.options.music) {
            newState.music = {
                intensity: body.options.music.intensity
            };
        }
    }

    // Updates the state
    api.platform.limiter.schedule(function() { return api.platform.client.updateExecution(newState); }).then(function() {
        response.statusCode = 200;
        response.end();
    }, function() {
        api.platform.log('Failed to update state.');
        response.statusCode = 400;
        response.end();
    });
}

/**
 * Defines the export of the file.
 */
module.exports = SyncBoxApi;
