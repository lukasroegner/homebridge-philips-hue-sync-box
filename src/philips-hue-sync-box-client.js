
const request = require('request');

/**
 * Represents the client for communicating with the Philips Hue Sync Box.
 * @param platform The PhilipsHueSyncBoxPlatform instance.
 * @param config The configuration of the device that this client communicates with.
 */
function PhilipsHueSyncBoxClient(platform, config) {
    const client = this;

    client.platform = platform;
    client.config = config;
}

/**
 * Gets the current state of the Sync Box.
 */
PhilipsHueSyncBoxClient.prototype.getState = function () {
    const client = this;
    
    // Sends the request
    return client.send('GET', '', null);
}

/**
 * Updates the execution settings of the Sync Box.
 */
PhilipsHueSyncBoxClient.prototype.updateExecution = function (settings) {
    const client = this;
    
    // Sends the request
    return client.send('PUT', '/execution', settings);
}

/**
 * Updates the Hue settings of the Sync Box.
 */
PhilipsHueSyncBoxClient.prototype.updateHue = function (settings) {
    const client = this;
    
    // Sends the request
    return client.send('PUT', '/hue', settings);
}

/**
 * Sends an HTTP request to the Sync Box.
 * @param method The HTTP method.
 * @param uri The uri path to the endpoint.
 * @param body The body of the request.
 */
PhilipsHueSyncBoxClient.prototype.send = function (method, uri, body) {
    const client = this;

    // Checks if all required information is provided
    if (!client.config.syncBoxIpAddress) {
        client.platform.log('No Sync Box IP address provided.');
        return;
    }
    if (!client.config.syncBoxApiAccessToken) {
        client.platform.log('No access token for the Sync Box provided.');
        return;
    }

    // Sends out the request
    return new Promise(function(resolve, reject) {
        request({
            uri: 'https://' + client.config.syncBoxIpAddress + '/api/v1' + uri,
            headers: {
                'Authorization': 'Bearer ' + client.config.syncBoxApiAccessToken
            },
            method: method,
            body: body,
            json: true,
            rejectUnauthorized: false
        }, function (error, response, body) {

            // Checks if the API returned a positive result
            if (error || response.statusCode != 200) {
                if (error) {
                    client.platform.log('Error while communicating with the Sync Box. Error: ' + error);
                } else if (response.statusCode != 200) {
                    client.platform.log('Error while communicating with the Sync Box. Status Code: ' + response.statusCode);
                }
                reject(error);
            }

            // Returns the response
            resolve(body);
        });
    });
}

/**
 * Defines the export of the file.
 */
module.exports = PhilipsHueSyncBoxClient;
