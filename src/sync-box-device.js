
/**
 * Represents a physical Sync Box device.
 * @param platform The PhilipsHueSyncBoxPlatform instance.
 * @param state The state.
 */
function SyncBoxDevice(platform, state) {
    const device = this;
    const { UUIDGen, Accessory, Characteristic, Service, Categories } = platform;

    // Sets the platform
    device.platform = platform;

    // Stores the latest state
    device.state = state;

    // Gets all accessories from the platform
    let externalAccessories = [];
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
        platform.log('Setting up accessory with kind TVAccessory.');
        tvAccessory = new Accessory(state.device.name, UUIDGen.generate('TVAccessory'));
        tvAccessory.category = Categories.TELEVISION;
        tvAccessory.context.kind = 'TVAccessory';
        externalAccessories.push(tvAccessory);
        deviceAccessories.push(tvAccessory);
    }

    // Gets the tv accessory
    let modeTvAccessory;
    if(platform.config.modeTvAccessory) {
        platform.log('Setting up accessory with kind ModeTVAccessory.');
        modeTvAccessory = new Accessory(state.device.name, UUIDGen.generate('ModeTVAccessory'));
        modeTvAccessory.category = Categories.TELEVISION;
        modeTvAccessory.context.kind = 'ModeTVAccessory';
        externalAccessories.push(modeTvAccessory);
        deviceAccessories.push(modeTvAccessory);
    }

    // Gets the tv accessory
    let intensityTvAccessory;
    if(platform.config.intensityTvAccessory) {
        platform.log('Adding new accessory with kind IntensityTVAccessory.');
        intensityTvAccessory = new Accessory(state.device.name, UUIDGen.generate('IntensityTVAccessory'));
        intensityTvAccessory.category = Categories.TELEVISION;
        intensityTvAccessory.context.kind = 'IntensityTVAccessory';
        externalAccessories.push(intensityTvAccessory);
        deviceAccessories.push(intensityTvAccessory);
    }

    // Registers the newly created accessories
    platform.api.registerPlatformAccessories(platform.pluginName, platform.platformName, newDeviceAccessories);

    // Publishes the external accessories (i.e. the TV accessories)
    if (externalAccessories.length > 0) {
        platform.api.publishExternalAccessories(platform.pluginName, externalAccessories);
    }

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

            // Sets the TV name
            tvService.setCharacteristic(Characteristic.ConfiguredName, state.device.name);
        }

        // Register HDMI sources
        const hdmiInputServices = [];
        for (let i = 1; i <= 4; i++) {
            let hdmiInputService = tvAccessory.getServiceByUUIDAndSubType(Service.InputSource, 'HDMI ' + i);
            if (!hdmiInputService) {
                hdmiInputService = tvAccessory.addService(Service.InputSource, 'hdmi' + i, 'HDMI ' + i);

                // Sets the TV name
                hdmiInputService
                    .setCharacteristic(Characteristic.ConfiguredName, 'HDMI ' + i)
                    .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
                    .setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN)
                    .setCharacteristic(Characteristic.TargetVisibilityState, Characteristic.TargetVisibilityState.SHOWN);
            }
            hdmiInputService
                .setCharacteristic(Characteristic.Identifier, i)
                .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);

            // Adds the input as a linked service, which is important so that the input is properly displayed in the Home app
            tvService.addLinkedService(hdmiInputService);
            hdmiInputServices.push(hdmiInputService);
        }

        // Sets sleep discovery characteristic (which is always discoverable as Homebrige is always running)
        tvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

        // Handles on/off events
        tvService.getCharacteristic(Characteristic.Active).on('set', function (value, callback) {

            // Saves the changes
            if (value) {
                platform.log.debug('Switch state to ON');
                platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': 'passthrough' }); }).then(function() {}, function() {
                    platform.log('Failed to switch state to ON');
                });
            } else {
                platform.log.debug('Switch state to OFF');
                platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': 'powersave' }); }).then(function() {}, function() {
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

        // Handles showing/hiding of sources
        for (let i = 0; i < hdmiInputServices.length; i++) {
            hdmiInputServices[i].getCharacteristic(Characteristic.TargetVisibilityState).on('set', function (value, callback) {
                if (value === Characteristic.TargetVisibilityState.SHOWN) {
                    hdmiInputServices[i].setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN);
                } else {
                    hdmiInputServices[i].setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.HIDDEN);
                }

                // Performs the callback
                callback(null);
            });
        }

        // Stores the tv service
        device.tvService = tvService;
    }

    // Handles the mode TV accessory if it is enabled
    if(modeTvAccessory) {

        // Updates tv service
        let modeTvService = modeTvAccessory.getServiceByUUIDAndSubType(Service.Television, 'ModeTVAccessory');
        if (!modeTvService) {
            modeTvService = modeTvAccessory.addService(Service.Television, 'Mode', 'ModeTVAccessory');

            // Sets the TV name
            modeTvService.setCharacteristic(Characteristic.ConfiguredName, state.device.name);
        }

        // Register mode input sources
        const modeInputServices = [];
        const modes = ['none', 'Video', 'Music', 'Game', 'Passthrough'];
        for (let i = 1; i <= 4; i++) {
            let modeInputService = modeTvAccessory.getServiceByUUIDAndSubType(Service.InputSource, 'MODE ' + i);
            if (!modeInputService) {
                modeInputService = modeTvAccessory.addService(Service.InputSource, 'mode' + i, 'MODE ' + i);

                // Sets the TV name
                modeInputService
                    .setCharacteristic(Characteristic.ConfiguredName, modes[i])
                    .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
                    .setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN)
                    .setCharacteristic(Characteristic.TargetVisibilityState, Characteristic.TargetVisibilityState.SHOWN);
            }
            modeInputService
                .setCharacteristic(Characteristic.Identifier, i)
                .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);

            // Adds the input as a linked service, which is important so that the input is properly displayed in the Home app
            modeTvService.addLinkedService(modeInputService);
            modeInputServices.push(modeInputService);
        }

        // Sets sleep discovery characteristic (which is always discoverable as Homebrige is always running)
        modeTvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

        // Handles on/off events
        modeTvService.getCharacteristic(Characteristic.Active).on('set', function (value, callback) {

            // Saves the changes
            if (value) {
                platform.log.debug('Switch state to ON');
                platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': 'passthrough' }); }).then(function() {}, function() {
                    platform.log('Failed to switch state to ON');
                });
            } else {
                platform.log.debug('Switch state to OFF');
                platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': 'powersave' }); }).then(function() {}, function() {
                    platform.log('Failed to switch state to OFF');
                });
            }

            // Performs the callback
            callback(null);

        });

        // Handles input source changes
        modeTvService.getCharacteristic(Characteristic.ActiveIdentifier).on('set', function (value, callback) {

            // Saves the changes
            let mode = '';
            switch (value) {
                case 1:
                    mode = 'video';
                    break;
                case 2:
                    mode = 'music';
                    break;
                case 3:
                    mode = 'game';
                    break;
                case 4:
                    mode = 'passthrough';
                    break;
            }
            platform.log.debug('Switch mode to ' + mode);
            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': mode }); }).then(function () {}, function () {
                platform.log('Failed to switch mode to ' + mode);
            });

            // Performs the callback
            callback(null);
        });

        // Handles showing/hiding of sources
        for (let i = 0; i < modeInputServices.length; i++) {
            modeInputServices[i].getCharacteristic(Characteristic.TargetVisibilityState).on('set', function (value, callback) {
                if (value === Characteristic.TargetVisibilityState.SHOWN) {
                    modeInputServices[i].setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN);
                } else {
                    modeInputServices[i].setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.HIDDEN);
                }

                // Performs the callback
                callback(null);
            });
        }

        // Stores the tv service
        device.modeTvService = modeTvService;
    }

    // Handles the intensity TV accessory if it is enabled
    if(intensityTvAccessory) {

        // Updates tv service
        let intensityTvService = intensityTvAccessory.getServiceByUUIDAndSubType(Service.Television, 'IntensityTVAccessory');
        if (!intensityTvService) {
            intensityTvService = intensityTvAccessory.addService(Service.Television, 'Intensity', 'IntensityTVAccessory');

            // Sets the TV name
            intensityTvService.setCharacteristic(Characteristic.ConfiguredName, state.device.name);
        }

        // Register intensity input sources
        const intensityInputServices = [];
        const intensities = ['none', 'Subtle' , 'Moderate', 'High', 'Intense'];
        for (let i = 1; i <= 4; i++) {
            let intensityInputService = intensityTvAccessory.getServiceByUUIDAndSubType(Service.InputSource, 'INTENSITY ' + i);
            if (!intensityInputService) {
                intensityInputService = intensityTvAccessory.addService(Service.InputSource, 'intensity' + i, 'INTENSITY ' + i);

                // Sets the TV name
                intensityInputService
                    .setCharacteristic(Characteristic.ConfiguredName, intensities[i])
                    .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
                    .setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN)
                    .setCharacteristic(Characteristic.TargetVisibilityState, Characteristic.TargetVisibilityState.SHOWN);
            }
            intensityInputService
                .setCharacteristic(Characteristic.Identifier, i)
                .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);

            // Adds the input as a linked service, which is important so that the input is properly displayed in the Home app
            intensityTvService.addLinkedService(intensityInputService);
            intensityInputServices.push(intensityInputService);
        }

        // Sets sleep discovery characteristic (which is always discoverable as Homebrige is always running)
        intensityTvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

        // Handles on/off events
        intensityTvService.getCharacteristic(Characteristic.Active).on('set', function (value, callback) {

            // Saves the changes
            if (value) {
                platform.log.debug('Switch state to ON');
                platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': 'passthrough' }); }).then(function() {}, function() {
                    platform.log('Failed to switch state to ON');
                });
            } else {
                platform.log.debug('Switch state to OFF');
                platform.limiter.schedule(function() { return platform.client.updateExecution({ 'mode': 'powersave' }); }).then(function() {}, function() {
                    platform.log('Failed to switch state to OFF');
                });
            }

            // Performs the callback
            callback(null);

        });

        // Handles input source changes
        intensityTvService.getCharacteristic(Characteristic.ActiveIdentifier).on('set', function (value, callback) {

            // Saves the changes
            let intensity = '';
            switch (value) {
                case 1:
                    intensity = 'subtle';
                    break;
                case 2:
                    intensity = 'moderate';
                    break;
                case 3:
                    intensity = 'high';
                    break;
                case 4:
                    intensity = 'intense';
                    break;
            }
            platform.log.debug('Switch intensity to ' + intensity);
            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': intensity }); }).then(function () {}, function () {
                platform.log('Failed to switch intensity to ' + intensity);
            });

            // Performs the callback
            callback(null);
        });

        // Handles showing/hiding of sources
        for (let i = 0; i < intensityInputServices.length; i++) {
            intensityInputServices[i].getCharacteristic(Characteristic.TargetVisibilityState).on('set', function (value, callback) {
                if (value === Characteristic.TargetVisibilityState.SHOWN) {
                    intensityInputServices[i].setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN);
                } else {
                    intensityInputServices[i].setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.HIDDEN);
                }

                // Performs the callback
                callback(null);
            });
        }

        // Stores the tv service
        device.intensityTvService = intensityTvService;
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
        device.tvService.updateCharacteristic(Characteristic.Active, state.execution.mode !== 'powersave');

        // Updates the HDMI input characteristic
        device.platform.log.debug('Updated HDMI input to ' + state.execution.hdmiSource);
        device.tvService.updateCharacteristic(Characteristic.ActiveIdentifier, parseInt(state.execution.hdmiSource.replace('input', '')));
    }

    // Updates the corresponding service of the mode TV accessory
    if (device.modeTvService) {

        // Updates the on characteristic
        device.platform.log.debug('Updated state to ' + state.execution.mode);
        device.modeTvService.updateCharacteristic(Characteristic.Active, state.execution.mode !== 'powersave');

        // Updates the mode input characteristic
        device.platform.log.debug('Updated mode to ' + state.execution.mode);
        switch (state.execution.mode) {
            case 'video':
                device.modeTvService.updateCharacteristic(Characteristic.ActiveIdentifier, 1);
                break;
            case 'music':
                device.modeTvService.updateCharacteristic(Characteristic.ActiveIdentifier, 2);
                break;
            case 'game':
                device.modeTvService.updateCharacteristic(Characteristic.ActiveIdentifier, 3);
                break;
            case 'passthrough':
                device.modeTvService.updateCharacteristic(Characteristic.ActiveIdentifier, 4);
                break;
        }
    }

    // Updates the corresponding service of the intensity TV accessory
    if (device.intensityTvService) {

        // Updates the on characteristic
        device.platform.log.debug('Updated state to ' + state.execution.mode);
        device.intensityTvService.updateCharacteristic(Characteristic.Active, state.execution.mode !== 'powersave');

        // Gets the current mode or the last sync mode to set the intensity
        let mode = 'video';
        if (state.execution.mode !== 'powersave' && state.execution.mode !== 'passthrough') {
            mode = state.execution.mode;
        } else if (state.execution.lastSyncMode) {
            mode = state.execution.lastSyncMode;
        }
        
        // Updates the intensity input characteristic
        device.platform.log.debug('Updated intensity to ' + state.execution[mode].intensity);
        switch (state.execution[mode].intensity) {
            case 'subtle':
                device.intensityTvService.updateCharacteristic(Characteristic.ActiveIdentifier, 1);
                break;
            case 'moderate':
                device.intensityTvService.updateCharacteristic(Characteristic.ActiveIdentifier, 2);
                break;
            case 'high':
                device.intensityTvService.updateCharacteristic(Characteristic.ActiveIdentifier, 3);
                break;
            case 'intense':
                device.intensityTvService.updateCharacteristic(Characteristic.ActiveIdentifier, 4);
                break;
        }
    }
}

/**
 * Defines the export of the file.
 */
module.exports = SyncBoxDevice;
