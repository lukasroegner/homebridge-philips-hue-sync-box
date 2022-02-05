
const Bottleneck = require('bottleneck');

const PhilipsHueSyncBoxClient = require('./philips-hue-sync-box-client');
const SyncBoxDevice = require('./sync-box-device');

/**
 * Initializes a new platform instance for the Philips Hue Sync Box plugin.
 * @param log The logging function.
 * @param config The configuration that is passed to the plugin (from the config.json file).
 * @param api The API instance of homebridge (may be null on older homebridge versions).
 */
function PhilipsHueSyncBoxPlatform(log, config, api) {
    const platform = this;

    // Saves objects for functions
    platform.Accessory = api.platformAccessory;
    platform.Categories = api.hap.Accessory.Categories;
    platform.Service = api.hap.Service;
    platform.Characteristic = api.hap.Characteristic;
    platform.UUIDGen = api.hap.uuid;
    platform.hap = api.hap;
    platform.pluginName = 'homebridge-philips-hue-sync-box';
    platform.platformName = 'PhilipsHueSyncBoxPlatform';

    // Checks whether a configuration is provided, otherwise the plugin should not be initialized
    if (!config) {
        return;
    }

    // Defines the variables that are used throughout the platform
    platform.log = log;
    platform.config = config;
    platform.devices = [];
    platform.accessories = [];

    // Initializes the configuration
    if (!platform.config.devices || platform.config.devices.length == 0) {
        platform.log('Please update your configuration. Devices should be provided in an array.');
        return;
    }

    // Makes sure to set the defaults for the configuration
    for (let i = 0; i < platform.config.devices.length; i++) {
        const device = platform.config.devices[i];

        device.syncBoxIpAddress = device.syncBoxIpAddress || null;
        device.syncBoxApiAccessToken = device.syncBoxApiAccessToken || null;
        device.defaultOnMode = device.defaultOnMode || 'video';
        device.defaultOffMode = device.defaultOffMode || 'passthrough';
        device.baseAccessory = device.baseAccessory || 'lightbulb';
        device.tvAccessory = device.tvAccessory || false;
        device.tvAccessoryType = device.tvAccessoryType || 'tv';
        device.tvAccessoryLightbulb = device.tvAccessoryLightbulb || false;
        device.modeTvAccessory = device.modeTvAccessory || false;
        device.modeTvAccessoryType = device.modeTvAccessoryType || 'tv';
        device.modeTvAccessoryLightbulb = device.modeTvAccessoryLightbulb || false;
        device.intensityTvAccessory = device.intensityTvAccessory || false;
        device.intensityTvAccessoryType = device.intensityTvAccessoryType || 'tv';
        device.intensityTvAccessoryLightbulb = device.intensityTvAccessoryLightbulb || false;
        device.entertainmentTvAccessory = device.entertainmentTvAccessory || false;
        device.entertainmentTvAccessoryType = device.entertainmentTvAccessoryType || 'tv';
        device.entertainmentTvAccessoryLightbulb = device.entertainmentTvAccessoryLightbulb || false;
        device.requestsPerSecond = 5;
        device.updateInterval = 10000;

        // Checks if all required information is provided
        if (!device.syncBoxIpAddress || !device.syncBoxApiAccessToken) {
            platform.log('No Sync Box IP address or access token provided.');
            return;
        }
    }

    // Checks whether the API object is available
    if (!api) {
        platform.log('Homebridge API not available, please update your homebridge version!');
        return;
    }

    // Saves the API object to register new devices later on
    platform.log('Homebridge API available.');
    platform.api = api;

    // Subscribes to the event that is raised when homebridge finished loading cached accessories
    platform.api.on('didFinishLaunching', function () {
        platform.log('Cached accessories loaded.');

        // Initially gets the state
        for (let i = 0; i < platform.config.devices.length; i++) {
            const deviceConfig = platform.config.devices[i];

            // Initializes the client
            const client = new PhilipsHueSyncBoxClient(this, deviceConfig);
            
            // Initializes the limiter
            const limiter = new Bottleneck({
                maxConcurrent: 1,
                minTime: 1000.0 / deviceConfig.requestsPerSecond
            });
    
            limiter.schedule(function () { return client.getState(); }).then(function (state) {

                // Creates the Sync Box instance
                platform.log('Create Sync Box.');
                const device = new SyncBoxDevice(platform, deviceConfig, client, limiter, state);
                platform.devices.push(device);

                // Starts the timer for updating the Sync Box
                setInterval(function () {
                    limiter.schedule(function () { return client.getState(); }).then(function (state) {
                        device.update(state);
                    }, function () {
                        platform.log('Error while getting the state.');
                    });
                }, deviceConfig.updateInterval);
            
                // Initialization completed
                platform.log('Initialization of Sync Box completed.');
            }, function () {
                platform.log('Error while getting the state. Please check the access token.');
            });
        }
    });
}

/**
 * Configures a previously cached accessory.
 * @param accessory The cached accessory.
 */
PhilipsHueSyncBoxPlatform.prototype.configureAccessory = function (accessory) {
    const platform = this;

    // Adds the cached accessory to the list
    platform.accessories.push(accessory);
}

/**
 * Defines the export of the file.
 */
module.exports = PhilipsHueSyncBoxPlatform;
