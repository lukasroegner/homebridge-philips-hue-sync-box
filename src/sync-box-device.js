
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

    // Gets the main accessory
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
}

/**
 * Defines the export of the file.
 */
module.exports = SyncBoxDevice;
