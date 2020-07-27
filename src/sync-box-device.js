
/**
 * Represents a physical Sync Box device.
 * @param platform The PhilipsHueSyncBoxPlatform instance.
 * @param state The state.
 */
function SyncBoxDevice(platform, state) {
    const device = this;
    const { UUIDGen, Accessory, Characteristic, Service } = platform;

    // Sets the platform
    device.platform = platform;

    // Stores the latest state
    device.state = state;

    // Gets all accessories from the platform
    let unusedDeviceAccessories = platform.accessories.slice();
    let newDeviceAccessories = [];
    let deviceAccessories = [];

    // Gets the main light bulb accessory
    let lightBulbAccessory = unusedDeviceAccessories.find(function(a) { return a.context.kind === 'LightBulbAccessory'; });
    if (lightBulbAccessory) {
        unusedDeviceAccessories.splice(unusedDeviceAccessories.indexOf(lightBulbAccessory), 1);
    } else {
        platform.log('Adding new accessory with kind LightBulbAccessory.');
        lightBulbAccessory = new Accessory(state.device.name, UUIDGen.generate('LightBulbAccessory'));
        lightBulbAccessory.context.kind = 'LightBulbAccessory';
        newDeviceAccessories.push(lightBulbAccessory);
    }
    deviceAccessories.push(lightBulbAccessory);

    // Gets the tv accessory
    let tvAccessory;
    if(platform.config.tvAccessory) {
        tvAccessory = unusedDeviceAccessories.find(function (a) { return a.context.kind === 'TVAccessory'; });
        if (tvAccessory) {
            unusedDeviceAccessories.splice(unusedDeviceAccessories.indexOf(tvAccessory), 1);
        } else {
            platform.log('Adding new accessory with kind TVAccessory.');
            tvAccessory = new Accessory(state.device.name, UUIDGen.generate('TVAccessory'));
            tvAccessory.context.kind = 'TVAccessory';
            newDeviceAccessories.push(tvAccessory);
        }
        deviceAccessories.push(tvAccessory);
    }

    // Registers the newly created accessories
    platform.api.registerPlatformAccessories(platform.pluginName, platform.platformName, newDeviceAccessories);

    // Removes all unused accessories
    for (let i = 0; i < unusedDeviceAccessories.length; i++) {
        const unusedDeviceAccessory = unusedDeviceAccessories[i];
        platform.log('Removing unused accessory with kind ' + unusedDeviceAccessory.context.kind + '.');
        platform.accessories.splice(platform.accessories.indexOf(unusedDeviceAccessory), 1);
    }
    platform.api.unregisterPlatformAccessories(platform.pluginName, platform.platformName, unusedDeviceAccessories);

    // Updates the accessory information
    for (let i = 0; i < deviceAccessories.length; i++) {
        const deviceAccessory = deviceAccessories[i];
        let accessoryInformationService = deviceAccessory.getService(Service.AccessoryInformation);
        if (!accessoryInformationService) {
            accessoryInformationService = deviceAccessory.addService(Service.AccessoryInformation);
        }
        accessoryInformationService
            .setCharacteristic(Characteristic.Manufacturer, 'Philips')
            .setCharacteristic(Characteristic.Model, 'Sync Box')
            .setCharacteristic(Characteristic.SerialNumber, state.device.uniqueId)
            .setCharacteristic(Characteristic.FirmwareRevision, state.device.firmwareVersion);
    }

    // Updates the light bulb service
    let lightBulbService = lightBulbAccessory.getServiceByUUIDAndSubType(Service.Lightbulb);
    if (!lightBulbService) {
        lightBulbService = lightBulbAccessory.addService(Service.Lightbulb);
    }

    // Stores the light bulb service
    device.lightBulbService = lightBulbService;

    // Subscribes for changes of the on characteristic
    lightBulbService.getCharacteristic(Characteristic.On).on('set', function (value, callback) {

        // Saves the changes
        if (value) {
            platform.log.debug('Switch state to ON');
            let onMode = platform.config.defaultOnMode;
            if (onMode === 'lastSyncMode') {
                if (device.state && device.state.execution && device.state.execution.lastSyncMode) {
                    onMode = device.state.execution.lastSyncMode;
                } else {
                    onMode = 'video';
                }
            }
            platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': onMode }); }).then(function() {}, function() {
                platform.log('Failed to switch state to ON');
            });
        } else {
            platform.log.debug('Switch state to OFF');
            platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function() {}, function() {
                platform.log('Failed to switch state to OFF');
            });
        }

        // Performs the callback
        callback(null);
    });

    // Subscribes for changes of the brightness characteristic
    lightBulbService.getCharacteristic(Characteristic.Brightness).on('set', function (value, callback) {

        // Saves the changes
        platform.log.debug('Switch brightness to ' + value);
        platform.limiter.schedule(function() { return platform.client.updateExecution({ 'brightness': Math.round((value / 100.0) * 200) }); }).then(function() {}, function() {
            platform.log('Failed to switch brightness to ' + value);
        });

        // Performs the callback
        callback(null);
    });

    // Handles the TV accessory if it is enabled
    if(tvAccessory) {

        // Updates tv service
        let tvService = tvAccessory.getServiceByUUIDAndSubType(Service.Television);
        if (!tvService) {
            tvService = tvAccessory.addService(Service.Television);
        }

        // Register HDMI sources
        for (let i = 1; i <= 4; i++) {
            let hdmiInputService = tvAccessory.getServiceByUUIDAndSubType(Service.InputSource, 'HDMI ' + i);
            if (!hdmiInputService) {
                hdmiInputService = tvAccessory.addService(Service.InputSource, 'hdmi' + i, 'HDMI ' + i);
            }
            hdmiInputService
                .setCharacteristic(Characteristic.Identifier, i)
                .setCharacteristic(Characteristic.ConfiguredName, 'HDMI ' + i)
                .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
                .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);

            // Adds the input as a linked service, which is important so that the input is properly displayed in the Home app
            tvService.addLinkedService(hdmiInputService);
        }

        // Sets the TV name
        tvService.setCharacteristic(Characteristic.ConfiguredName, state.device.name);

        // Sets sleep discovery characteristic (which is always discoverable as Homebrige is always running)
        tvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

        // Handles on/off events
        tvService.getCharacteristic(Characteristic.Active).on('set', function (value, callback) {

            // Saves the changes
            if (value) {
                platform.log.debug('Switch state to ON');
                let onMode = platform.config.defaultOnMode;
                if (onMode === 'lastSyncMode') {
                    if (device.state && device.state.execution && device.state.execution.lastSyncMode) {
                        onMode = device.state.execution.lastSyncMode;
                    } else {
                        onMode = 'video';
                    }
                }
                platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': onMode }); }).then(function() {}, function() {
                    platform.log('Failed to switch state to ON');
                });
            } else {
                platform.log.debug('Switch state to OFF');
                platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function() {}, function() {
                    platform.log('Failed to switch state to OFF');
                });
            }

            // Performs the callback
            callback(null);

        });

        // Handles input source changes
        tvService.getCharacteristic(Characteristic.ActiveIdentifier).on('set', function (value, callback) {

            // Saves the changes
            platform.log.debug('Switch hdmi source to input' + value);
            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input' + value}); }).then(function () {}, function () {
                platform.log('Failed to switch hdmi source to input' + value);
            });

            // Performs the callback
            callback(null);
        });

        // Stores the tv service
        device.tvService = tvService;
    }

    // Updates the state initially
    device.update(state);
}

/**
 * Can be called to update the device information.
 * @param state The new state.
 */
SyncBoxDevice.prototype.update = function (state) {
    const device = this;
    const { Characteristic } = device.platform;

    // Stores the latest state
    device.state = state;

    // Updates the corresponding service
    if (device.lightBulbService) {

        // Updates the on characteristic
        device.platform.log.debug('Updated state to ' + state.execution.mode);
        device.lightBulbService.updateCharacteristic(Characteristic.On, state.execution.mode !== 'powersave' && state.execution.mode !== 'passthrough');

        // Updates the brightness characteristic
        device.platform.log.debug('Updated brightness to ' + state.execution.brightness);
        device.lightBulbService.updateCharacteristic(Characteristic.Brightness, Math.round((state.execution.brightness / 200.0) * 100));
    }

    // Updates the corresponding service of the TV accessory
    if (device.tvService) {

        // Updates the on characteristic
        device.platform.log.debug('Updated state to ' + state.execution.mode);
        device.tvService.updateCharacteristic(Characteristic.Active, state.execution.mode !== 'powersave' && state.execution.mode !== 'passthrough');

        // Updates the HDMI input characteristic
        device.platform.log.debug('Updated HDMI input to ' + state.execution.hdmiSource);
        device.tvService.updateCharacteristic(Characteristic.ActiveIdentifier, parseInt(state.execution.hdmiSource.replace('input', '')));
    }
}

/**
 * Defines the export of the file.
 */
module.exports = SyncBoxDevice;
