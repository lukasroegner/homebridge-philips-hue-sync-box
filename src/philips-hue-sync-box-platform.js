
const Bottleneck = require('bottleneck');

const PhilipsHueSyncBoxClient = require('./philips-hue-sync-box-client');
const SyncBoxDevice = require('./sync-box-device');
const SyncBoxApi = require('./sync-box-api');

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
    platform.device = null;
    platform.accessories = [];

    // Initializes the configuration
    platform.config.syncBoxIpAddress = platform.config.syncBoxIpAddress || null;
    platform.config.syncBoxApiAccessToken = platform.config.syncBoxApiAccessToken || null;
    platform.config.defaultOnMode = platform.config.defaultOnMode || 'video';
    platform.config.defaultOffMode = platform.config.defaultOffMode || 'passthrough';
    platform.config.baseAccessory = platform.config.baseAccessory || 'lightbulb';
    platform.config.isApiEnabled = platform.config.isApiEnabled || false;
    platform.config.apiPort = platform.config.apiPort || 40220;
    platform.config.apiToken = platform.config.apiToken || null;
    platform.config.tvAccessory = platform.config.tvAccessory || false;
    platform.config.tvAccessoryType = platform.config.tvAccessoryType || 'tv';
    platform.config.tvAccessoryLightbulb = platform.config.tvAccessoryLightbulb || false;
    platform.config.modeTvAccessory = platform.config.modeTvAccessory || false;
    platform.config.modeTvAccessoryType = platform.config.modeTvAccessoryType || 'tv';
    platform.config.modeTvAccessoryLightbulb = platform.config.modeTvAccessoryLightbulb || false;
    platform.config.intensityTvAccessory = platform.config.intensityTvAccessory || false;
    platform.config.intensityTvAccessoryType = platform.config.intensityTvAccessoryType || 'tv';
    platform.config.intensityTvAccessoryLightbulb = platform.config.intensityTvAccessoryLightbulb || false;
    platform.config.entertainmentTvAccessory = platform.config.entertainmentTvAccessory || false;
    platform.config.entertainmentTvAccessoryType = platform.config.entertainmentTvAccessoryType || 'tv';
    platform.config.entertainmentTvAccessoryLightbulb = platform.config.entertainmentTvAccessoryLightbulb || false;
    platform.config.requestsPerSecond = 5;
    platform.config.updateInterval = 10000;

    // Initializes the limiter
    platform.limiter = new Bottleneck({
        maxConcurrent: 1,
        minTime: 1000.0 / platform.config.requestsPerSecond
    });

    // Checks whether the API object is available
    if (!api) {
        platform.log('Homebridge API not available, please update your homebridge version!');
        return;
    }

    // Saves the API object to register new devices later on
    platform.log('Homebridge API available.');
    platform.api = api;

    // Checks if all required information is provided
    if (!platform.config.syncBoxIpAddress || !platform.config.syncBoxApiAccessToken) {
        platform.log('No Sync Box IP address or access token provided.');
        return;
    }

    // Initializes the client
    platform.client = new PhilipsHueSyncBoxClient(this);
    
    // Subscribes to the event that is raised when homebridge finished loading cached accessories
    platform.api.on('didFinishLaunching', function () {
        platform.log('Cached accessories loaded.');

        // Initially gets the state
        platform.limiter.schedule(function() { return platform.client.getState(); }).then(function(state) {

            // Creates the Sync Box instance
            platform.log('Create Sync Box.');
            platform.device = new SyncBoxDevice(platform, state);

            // Starts the timer for updating the Sync Box
            setInterval(function() {
                platform.limiter.schedule(function() { return platform.client.getState(); }).then(function(state) {
                    platform.device.update(state);
                }, function() {
                    platform.log('Error while getting the state.');
                });
            }, platform.config.updateInterval);
            
            // Initialization completed
            platform.log('Initialization completed.');

            // Starts the API if requested
            if (platform.config.isApiEnabled) {
                platform.syncBoxApi = new SyncBoxApi(platform);
            }
        }, function() {
            platform.log('Error while getting the state. Please check the access token.');
        });
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
