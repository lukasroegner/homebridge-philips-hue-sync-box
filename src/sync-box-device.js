
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
        tvAccessory = unusedDeviceAccessories.find(function (a) {
            return a.context.kind === 'TVAccessory';
        });
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
        platform.log.debug('Switch state to ' + (value ? 'ON' : 'OFF'));
        platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': value ? platform.config.defaultOnMode : platform.config.defaultOffMode }); }).then(function() {}, function() {
            platform.log('Failed to switch state to ' + (value ? 'ON' : 'OFF'));
        });

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


    if(tvAccessory) {
        // Updates tv  service
        let tvService = tvAccessory.getServiceByUUIDAndSubType(Service.Television);
        if (!tvService) {
            tvService = tvAccessory.addService(Service.Television);

            // Register HDMI sources

            for (let i = 1; i <= 4; i++) {

                const hdmiInputService = tvAccessory.addService(Service.InputSource, 'hdmi' + i, 'HDMI ' + i);
                hdmiInputService
                    .setCharacteristic(Characteristic.Identifier, i)
                    .setCharacteristic(Characteristic.ConfiguredName, 'HDMI ' + i)
                    .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
                    .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);
                tvService.addLinkedService(hdmiInputService); // link to tv service

            }

        }

        // set the tv name
        tvService.setCharacteristic(Characteristic.ConfiguredName, state.device.name);

        // set sleep discovery characteristic
        tvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);


        // handle on / off events using the Active characteristic
        tvService.getCharacteristic(Characteristic.Active).on('set', (value, callback) => {

            // Saves the changes
            platform.log.debug('Switch state to ' + (value ? 'ON' : 'OFF'));
            platform.limiter.schedule(function () {
                return platform.client.updateExecution({'mode': value ? platform.config.defaultOnMode : 'powersave'});
            }).then(function () {
            }, function () {
                platform.log('Failed to switch state to ' + (value ? 'ON' : 'OFF'));
            });

            // Performs the callback
            callback(null);

        });

        // handle input source changes
        tvService.getCharacteristic(Characteristic.ActiveIdentifier).on('set', (value, callback) => {

            // Saves the changes
            platform.log.debug('Switch hdmi source to input' + value);
            platform.limiter.schedule(function () {
                return platform.client.updateExecution({'hdmiSource': 'input' + value});
            }).then(function () {
            }, function () {
                platform.log('Failed to switch hdmi source to input' + value);
            });

            tvService.updateCharacteristic(Characteristic.ActiveIdentifier, value);

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

    // Updates the corresponding service
    if (device.lightBulbService) {

        // Updates the on characteristic
        device.platform.log.debug('Updated state to ' + state.execution.mode);
        device.lightBulbService.updateCharacteristic(Characteristic.On, state.execution.mode !== 'powersave' && state.execution.mode !== 'passthrough');

        // Updates the brightness characteristic
        device.platform.log.debug('Updated brightness to ' + state.execution.brightness);
        device.lightBulbService.updateCharacteristic(Characteristic.Brightness, Math.round((state.execution.brightness / 200.0) * 100));


    }

    if (device.tvService) {

        // Updates the on characteristic
        device.platform.log.debug('Updated state to ' + state.execution.mode);
        device.tvService.updateCharacteristic(Characteristic.Active, state.execution.mode !== 'powersave');

        // Updates the HDMI input characteristic
        device.platform.log.debug('Updated HDMI input to ' + state.execution.hdmiSource);
        device.tvService.updateCharacteristic(Characteristic.ActiveIdentifier, parseInt(state.execution.hdmiSource.replace('input', '')));

    }

}

/**
 * Defines the export of the file.
 */
module.exports = SyncBoxDevice;
