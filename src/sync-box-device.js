
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

    let mainAccessory;

    // Gets the main light bulb accessory
    let lightBulbAccessory;
    if(platform.config.baseAccessory === 'lightbulb') {
        lightBulbAccessory = unusedDeviceAccessories.find(function (a) { return a.context.kind === 'LightBulbAccessory'; });
        if (lightBulbAccessory) {
            unusedDeviceAccessories.splice(unusedDeviceAccessories.indexOf(lightBulbAccessory), 1);
        } else {
            platform.log('Adding new accessory with kind LightBulbAccessory.');
            lightBulbAccessory = new Accessory(state.device.name, UUIDGen.generate('LightBulbAccessory'));
            lightBulbAccessory.context.kind = 'LightBulbAccessory';
            newDeviceAccessories.push(lightBulbAccessory);
        }
        deviceAccessories.push(lightBulbAccessory);

        mainAccessory = lightBulbAccessory;
    }

    // Gets the main switch accessory
    let switchAccessory;
    if(platform.config.baseAccessory === 'switch') {
        switchAccessory = unusedDeviceAccessories.find(function (a) { return a.context.kind === 'SwitchAccessory'; });
        if (switchAccessory) {
            unusedDeviceAccessories.splice(unusedDeviceAccessories.indexOf(switchAccessory), 1);
        } else {
            platform.log('Adding new accessory with kind SwitchAccessory.');
            switchAccessory = new Accessory(state.device.name, UUIDGen.generate('SwitchAccessory'));
            switchAccessory.context.kind = 'SwitchAccessory';
            newDeviceAccessories.push(switchAccessory);
        }
        deviceAccessories.push(switchAccessory);

        mainAccessory = switchAccessory;
    }

    // Gets the tv accessory
    let tvAccessory;
    if(platform.config.tvAccessory) {
        platform.log('Setting up accessory with kind TVAccessory.');
        tvAccessory = new Accessory(state.device.name, UUIDGen.generate('TVAccessory'));
        switch (platform.config.tvAccessoryType) {
            case 'settopbox':
                tvAccessory.category = Categories.TV_SET_TOP_BOX;
                break;
            case 'tvstick':
                tvAccessory.category = Categories.TV_STREAMING_STICK;
                break;
            case 'audioreceiver':
                tvAccessory.category = Categories.AUDIO_RECEIVER;
                break;
            default:
                tvAccessory.category = Categories.TELEVISION;
                break;
        }
        tvAccessory.context.kind = 'TVAccessory';
        externalAccessories.push(tvAccessory);
        deviceAccessories.push(tvAccessory);
    }

    // Gets the tv accessory
    let modeTvAccessory;
    if(platform.config.modeTvAccessory) {
        platform.log('Setting up accessory with kind ModeTVAccessory.');
        modeTvAccessory = new Accessory(state.device.name, UUIDGen.generate('ModeTVAccessory'));
        switch (platform.config.modeTvAccessoryType) {
            case 'settopbox':
                modeTvAccessory.category = Categories.TV_SET_TOP_BOX;
                break;
            case 'tvstick':
                modeTvAccessory.category = Categories.TV_STREAMING_STICK;
                break;
            case 'audioreceiver':
                modeTvAccessory.category = Categories.AUDIO_RECEIVER;
                break;
            default:
                modeTvAccessory.category = Categories.TELEVISION;
                break;
        }
        modeTvAccessory.context.kind = 'ModeTVAccessory';
        externalAccessories.push(modeTvAccessory);
        deviceAccessories.push(modeTvAccessory);
    }

    // Gets the tv accessory
    let intensityTvAccessory;
    if(platform.config.intensityTvAccessory) {
        platform.log('Adding new accessory with kind IntensityTVAccessory.');
        intensityTvAccessory = new Accessory(state.device.name, UUIDGen.generate('IntensityTVAccessory'));
        switch (platform.config.intensityTvAccessoryType) {
            case 'settopbox':
                intensityTvAccessory.category = Categories.TV_SET_TOP_BOX;
                break;
            case 'tvstick':
                intensityTvAccessory.category = Categories.TV_STREAMING_STICK;
                break;
            case 'audioreceiver':
                intensityTvAccessory.category = Categories.AUDIO_RECEIVER;
                break;
            default:
                intensityTvAccessory.category = Categories.TELEVISION;
                break;
        }
        intensityTvAccessory.context.kind = 'IntensityTVAccessory';
        externalAccessories.push(intensityTvAccessory);
        deviceAccessories.push(intensityTvAccessory);
    }

    // Gets the tv accessory
    let entertainmentTvAccessory;
    if(platform.config.entertainmentTvAccessory) {
        platform.log('Adding new accessory with kind EntertainmentTVAccessory.');
        entertainmentTvAccessory = new Accessory(state.device.name, UUIDGen.generate('EntertainmentTVAccessory'));
        switch (platform.config.entertainmentTvAccessoryType) {
            case 'settopbox':
                entertainmentTvAccessory.category = Categories.TV_SET_TOP_BOX;
                break;
            case 'tvstick':
                entertainmentTvAccessory.category = Categories.TV_STREAMING_STICK;
                break;
            case 'audioreceiver':
                entertainmentTvAccessory.category = Categories.AUDIO_RECEIVER;
                break;
            default:
                entertainmentTvAccessory.category = Categories.TELEVISION;
                break;
        }
        entertainmentTvAccessory.context.kind = 'EntertainmentTVAccessory';
        externalAccessories.push(entertainmentTvAccessory);
        deviceAccessories.push(entertainmentTvAccessory);
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
            .setCharacteristic(Characteristic.FirmwareRevision, state.device.firmwareVersion);

        // Applies a custom serial number as otherwise issues with matching in HomeKit could occur
        if (deviceAccessory.context.kind == 'TVAccessory') {
            accessoryInformationService.setCharacteristic(Characteristic.SerialNumber, state.device.uniqueId + '-T');
        } else if (deviceAccessory.context.kind == 'ModeTVAccessory') {
            accessoryInformationService.setCharacteristic(Characteristic.SerialNumber, state.device.uniqueId + '-M');
        } else if (deviceAccessory.context.kind == 'IntensityTVAccessory') {
            accessoryInformationService.setCharacteristic(Characteristic.SerialNumber, state.device.uniqueId + '-I');
        } else if (deviceAccessory.context.kind == 'EntertainmentTVAccessory') {
            accessoryInformationService.setCharacteristic(Characteristic.SerialNumber, state.device.uniqueId + '-E');
        } else {
            accessoryInformationService.setCharacteristic(Characteristic.SerialNumber, state.device.uniqueId);
        }  
    }

    // Handles the lightbulb accessory if it is enabled
    if (lightBulbAccessory) {

        // Updates the light bulb service
        let lightBulbService = lightBulbAccessory.getServiceByUUIDAndSubType(Service.Lightbulb);
        if (!lightBulbService) {
            lightBulbService = lightBulbAccessory.addService(Service.Lightbulb);
        }

        // Stores the light bulb service
        device.lightBulbService = lightBulbService;

        // Subscribes for changes of the on characteristic
        lightBulbService.getCharacteristic(Characteristic.On).on('set', function (value, callback) {

            // Ignores changes if the new value equals the old value
            if (lightBulbService.getCharacteristic(Characteristic.On).value === value) {
                if (value) {
                    platform.log.debug('Switch state is already ON');
                } else {
                    platform.log.debug('Switch state is already OFF');
                }
                callback(null);
                return;
            }

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
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                    platform.log('Failed to switch state to ON');
                });
            } else {
                platform.log.debug('Switch state to OFF');
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
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
            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.round((value / 100.0) * 200) }); }).then(function () { }, function () {
                platform.log('Failed to switch brightness to ' + value);
            });

            // Performs the callback
            callback(null);
        });
    }

    // Handles the switch accessory if it is enabled
    if (switchAccessory) {

        // Updates the switch service
        let switchService = switchAccessory.getServiceByUUIDAndSubType(Service.Switch);
        if (!switchService) {
            switchService = switchAccessory.addService(Service.Switch);
        }

        // Stores the switch service
        device.switchService = switchService;

        // Subscribes for changes of the on characteristic
        switchService.getCharacteristic(Characteristic.On).on('set', function (value, callback) {

            // Ignores changes if the new value equals the old value
            if (switchService.getCharacteristic(Characteristic.On).value === value) {
                if (value) {
                    platform.log.debug('Switch state is already ON');
                } else {
                    platform.log.debug('Switch state is already OFF');
                }
                callback(null);
                return;
            }

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
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                    platform.log('Failed to switch state to ON');
                });
            } else {
                platform.log.debug('Switch state to OFF');
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
                    platform.log('Failed to switch state to OFF');
                });
            }

            // Performs the callback
            callback(null);
        });
    }

    // Handles the TV accessory if it is enabled
    if(tvAccessory) {

        // Updates tv service
        let tvService = tvAccessory.getServiceByUUIDAndSubType(Service.Television);
        if (!tvService) {
            tvService = tvAccessory.addService(Service.Television);

            // Sets the TV name
            if (mainAccessory) {
                tvService.setCharacteristic(Characteristic.ConfiguredName, mainAccessory.context.tvAccessoryConfiguredName || state.device.name);
                tvService.getCharacteristic(Characteristic.ConfiguredName).on('set', function (value, callback) {
                    mainAccessory.context.tvAccessoryConfiguredName = value;
                    callback(null);
                });
            } else {
                tvService.setCharacteristic(Characteristic.ConfiguredName, state.device.name);
            }
        }

        // Register HDMI sources
        const hdmiInputServices = [];
        for (let i = 1; i <= 4; i++) {
            let hdmiInputService = tvAccessory.getServiceByUUIDAndSubType(Service.InputSource, 'HDMI ' + i);
            if (!hdmiInputService) {
                hdmiInputService = tvAccessory.addService(Service.InputSource, 'hdmi' + i, 'HDMI ' + i);

                // Sets the TV name
                const hdmiState = state.hdmi['input' + i];
                const hdmiName = hdmiState.name || ('HDMI ' + i);

                hdmiInputService
                    .setCharacteristic(Characteristic.ConfiguredName, hdmiName)
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

        // Sets sleep discovery characteristic (which is always discoverable as Homebridge is always running)
        tvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

        // Handles on/off events
        tvService.getCharacteristic(Characteristic.Active).on('set', function (value, callback) {

            // Ignores changes if the new value equals the old value
            if (tvService.getCharacteristic(Characteristic.Active).value === value) {
                if (value) {
                    platform.log.debug('Switch state is already ON');
                } else {
                    platform.log.debug('Switch state is already OFF');
                }
                callback(null);
                return;
            }

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
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                    platform.log('Failed to switch state to ON');
                });
            } else {
                platform.log.debug('Switch state to OFF');
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
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

        // Handles remote key input
        tvService.getCharacteristic(Characteristic.RemoteKey).on('set', function (value, callback) {
            platform.log.debug('Remote key pressed: ' + value);

            let mode;
            switch (value) {
                case Characteristic.RemoteKey.ARROW_UP:
                    platform.log.debug('Increase brightness by 25%');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.min(200, device.state.execution.brightness + 50) }); }).then(function () { }, function () {
                        platform.log('Failed to increase brightness by 25%');
                    });
                    break;
                        
                case Characteristic.RemoteKey.ARROW_DOWN:
                    platform.log.debug('Decrease brightness by 25%');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.max(0, device.state.execution.brightness - 50) }); }).then(function () { }, function () {
                        platform.log('Failed to decrease brightness by 25%');
                    });
                    break;
                
                case Characteristic.RemoteKey.ARROW_LEFT:

                    // Gets the current mode or the last sync mode to set the intensity
                    mode = 'video';
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        mode = device.state.execution.mode;
                    } else if (device.state.execution.lastSyncMode) {
                        mode = device.state.execution.lastSyncMode;
                    }
                    
                    device.platform.log.debug('Toggle intensity');
                    switch (device.state.execution[mode].intensity) {
                        case 'subtle':
                            break;
                        case 'moderate':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'subtle' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'high':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'moderate' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'intense':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'high' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.ARROW_RIGHT:

                    // Gets the current mode or the last sync mode to set the intensity
                    mode = 'video';
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        mode = device.state.execution.mode;
                    } else if (device.state.execution.lastSyncMode) {
                        mode = device.state.execution.lastSyncMode;
                    }
                    
                    device.platform.log.debug('Toggle intensity');
                    switch (device.state.execution[mode].intensity) {
                        case 'subtle':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'moderate' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'moderate':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'high' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'high':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'intense' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'intense':
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.SELECT:   
                    device.platform.log.debug('Toggle mode');
                    switch (device.state.execution.mode) {
                        case 'video':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'music' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'music':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'game' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'game':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'passthrough' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'passthrough':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'video' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.PLAY_PAUSE:
                    platform.log.debug('Toggle switch state');
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
                            platform.log('Failed to toggle switch state');
                        });
                    } else {
                        let onMode = platform.config.defaultOnMode;
                        if (onMode === 'lastSyncMode') {
                            if (device.state && device.state.execution && device.state.execution.lastSyncMode) {
                                onMode = device.state.execution.lastSyncMode;
                            } else {
                                onMode = 'video';
                            }
                        }
                        platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                            platform.log('Failed to toggle switch state');
                        });
                    }
                    break;
            
                case Characteristic.RemoteKey.INFORMATION:   
                    device.platform.log.debug('Toggle hdmi source');
                    switch (device.state.execution.hdmiSource) {
                        case 'input1':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input2' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input2':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input3' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input3':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input4' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input4':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input1' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                    }
                    break;
            }

            // Performs the callback
            callback(null);
        });

        // Stores the tv service
        device.tvService = tvService;

        // Handles the lightbulb accessory if it is enabled
        if (platform.config.tvAccessoryLightbulb) {

            // Updates the light bulb service
            let tvAccessoryLightBulbService = tvAccessory.getServiceByUUIDAndSubType(Service.Lightbulb);
            if (!tvAccessoryLightBulbService) {
                tvAccessoryLightBulbService = tvAccessory.addService(Service.Lightbulb);
            }

            // Stores the light bulb service
            device.tvAccessoryLightBulbService = tvAccessoryLightBulbService;

            // Subscribes for changes of the on characteristic
            tvAccessoryLightBulbService.getCharacteristic(Characteristic.On).on('set', function (value, callback) {

                // Ignores changes if the new value equals the old value
                if (tvAccessoryLightBulbService.getCharacteristic(Characteristic.On).value === value) {
                    if (value) {
                        platform.log.debug('Switch state is already ON');
                    } else {
                        platform.log.debug('Switch state is already OFF');
                    }
                    callback(null);
                    return;
                }

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
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                        platform.log('Failed to switch state to ON');
                    });
                } else {
                    platform.log.debug('Switch state to OFF');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
                        platform.log('Failed to switch state to OFF');
                    });
                }

                // Performs the callback
                callback(null);
            });

            // Subscribes for changes of the brightness characteristic
            tvAccessoryLightBulbService.getCharacteristic(Characteristic.Brightness).on('set', function (value, callback) {

                // Saves the changes
                platform.log.debug('Switch brightness to ' + value);
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.round((value / 100.0) * 200) }); }).then(function () { }, function () {
                    platform.log('Failed to switch brightness to ' + value);
                });

                // Performs the callback
                callback(null);
            });
        }
    }

    // Handles the mode TV accessory if it is enabled
    if (modeTvAccessory) {

        // Updates tv service
        let modeTvService = modeTvAccessory.getServiceByUUIDAndSubType(Service.Television, 'ModeTVAccessory');
        if (!modeTvService) {
            modeTvService = modeTvAccessory.addService(Service.Television, 'Mode', 'ModeTVAccessory');

            // Sets the TV name
            if (mainAccessory) {
                modeTvService.setCharacteristic(Characteristic.ConfiguredName, mainAccessory.context.modeTvAccessoryConfiguredName || state.device.name);
                modeTvService.getCharacteristic(Characteristic.ConfiguredName).on('set', function (value, callback) {
                    mainAccessory.context.modeTvAccessoryConfiguredName = value;
                    callback(null);
                });
            } else {
                modeTvService.setCharacteristic(Characteristic.ConfiguredName, state.device.name);
            }
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

        // Sets sleep discovery characteristic (which is always discoverable as Homebridge is always running)
        modeTvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

        // Handles on/off events
        modeTvService.getCharacteristic(Characteristic.Active).on('set', function (value, callback) {

            // Ignores changes if the new value equals the old value
            if (modeTvService.getCharacteristic(Characteristic.Active).value === value) {
                if (value) {
                    platform.log.debug('Switch state is already ON');
                } else {
                    platform.log.debug('Switch state is already OFF');
                }
                callback(null);
                return;
            }

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
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                    platform.log('Failed to switch state to ON');
                });
            } else {
                platform.log.debug('Switch state to OFF');
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
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

        // Handles remote key input
        modeTvService.getCharacteristic(Characteristic.RemoteKey).on('set', function (value, callback) {
            platform.log.debug('Remote key pressed: ' + value);

            let mode;
            switch (value) {
                case Characteristic.RemoteKey.ARROW_UP:
                    platform.log.debug('Increase brightness by 25%');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.min(200, device.state.execution.brightness + 50) }); }).then(function () { }, function () {
                        platform.log('Failed to increase brightness by 25%');
                    });
                    break;
                        
                case Characteristic.RemoteKey.ARROW_DOWN:
                    platform.log.debug('Decrease brightness by 25%');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.max(0, device.state.execution.brightness - 50) }); }).then(function () { }, function () {
                        platform.log('Failed to decrease brightness by 25%');
                    });
                    break;
                
                case Characteristic.RemoteKey.ARROW_LEFT:

                    // Gets the current mode or the last sync mode to set the intensity
                    mode = 'video';
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        mode = device.state.execution.mode;
                    } else if (device.state.execution.lastSyncMode) {
                        mode = device.state.execution.lastSyncMode;
                    }
                    
                    device.platform.log.debug('Toggle intensity');
                    switch (device.state.execution[mode].intensity) {
                        case 'subtle':
                            break;
                        case 'moderate':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'subtle' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'high':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'moderate' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'intense':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'high' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.ARROW_RIGHT:

                    // Gets the current mode or the last sync mode to set the intensity
                    mode = 'video';
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        mode = device.state.execution.mode;
                    } else if (device.state.execution.lastSyncMode) {
                        mode = device.state.execution.lastSyncMode;
                    }
                    
                    device.platform.log.debug('Toggle intensity');
                    switch (device.state.execution[mode].intensity) {
                        case 'subtle':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'moderate' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'moderate':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'high' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'high':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'intense' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'intense':
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.SELECT:   
                    device.platform.log.debug('Toggle mode');
                    switch (device.state.execution.mode) {
                        case 'video':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'music' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'music':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'game' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'game':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'passthrough' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'passthrough':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'video' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.PLAY_PAUSE:
                    platform.log.debug('Toggle switch state');
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
                            platform.log('Failed to toggle switch state');
                        });
                    } else {
                        let onMode = platform.config.defaultOnMode;
                        if (onMode === 'lastSyncMode') {
                            if (device.state && device.state.execution && device.state.execution.lastSyncMode) {
                                onMode = device.state.execution.lastSyncMode;
                            } else {
                                onMode = 'video';
                            }
                        }
                        platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                            platform.log('Failed to toggle switch state');
                        });
                    }
                    break;
            
                case Characteristic.RemoteKey.INFORMATION:   
                    device.platform.log.debug('Toggle hdmi source');
                    switch (device.state.execution.hdmiSource) {
                        case 'input1':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input2' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input2':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input3' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input3':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input4' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input4':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input1' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                    }
                    break;
            }

            // Performs the callback
            callback(null);
        });

        // Stores the tv service
        device.modeTvService = modeTvService;

        // Handles the lightbulb accessory if it is enabled
        if (platform.config.modeTvAccessoryLightbulb) {

            // Updates the light bulb service
            let modeTvAccessoryLightBulbService = modeTvAccessory.getServiceByUUIDAndSubType(Service.Lightbulb);
            if (!modeTvAccessoryLightBulbService) {
                modeTvAccessoryLightBulbService = modeTvAccessory.addService(Service.Lightbulb);
            }

            // Stores the light bulb service
            device.modeTvAccessoryLightBulbService = modeTvAccessoryLightBulbService;

            // Subscribes for changes of the on characteristic
            modeTvAccessoryLightBulbService.getCharacteristic(Characteristic.On).on('set', function (value, callback) {

                // Ignores changes if the new value equals the old value
                if (modeTvAccessoryLightBulbService.getCharacteristic(Characteristic.On).value === value) {
                    if (value) {
                        platform.log.debug('Switch state is already ON');
                    } else {
                        platform.log.debug('Switch state is already OFF');
                    }
                    callback(null);
                    return;
                }

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
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                        platform.log('Failed to switch state to ON');
                    });
                } else {
                    platform.log.debug('Switch state to OFF');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
                        platform.log('Failed to switch state to OFF');
                    });
                }

                // Performs the callback
                callback(null);
            });

            // Subscribes for changes of the brightness characteristic
            modeTvAccessoryLightBulbService.getCharacteristic(Characteristic.Brightness).on('set', function (value, callback) {

                // Saves the changes
                platform.log.debug('Switch brightness to ' + value);
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.round((value / 100.0) * 200) }); }).then(function () { }, function () {
                    platform.log('Failed to switch brightness to ' + value);
                });

                // Performs the callback
                callback(null);
            });
        }
    }

    // Handles the intensity TV accessory if it is enabled
    if (intensityTvAccessory) {

        // Updates tv service
        let intensityTvService = intensityTvAccessory.getServiceByUUIDAndSubType(Service.Television, 'IntensityTVAccessory');
        if (!intensityTvService) {
            intensityTvService = intensityTvAccessory.addService(Service.Television, 'Intensity', 'IntensityTVAccessory');

            // Sets the TV name
            if (mainAccessory) {
                intensityTvService.setCharacteristic(Characteristic.ConfiguredName, mainAccessory.context.intensityTvAccessoryConfiguredName || state.device.name);
                intensityTvService.getCharacteristic(Characteristic.ConfiguredName).on('set', function (value, callback) {
                    mainAccessory.context.intensityTvAccessoryConfiguredName = value;
                    callback(null);
                });
            } else {
                intensityTvService.setCharacteristic(Characteristic.ConfiguredName, state.device.name);
            }
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

        // Sets sleep discovery characteristic (which is always discoverable as Homebridge is always running)
        intensityTvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

        // Handles on/off events
        intensityTvService.getCharacteristic(Characteristic.Active).on('set', function (value, callback) {

            // Ignores changes if the new value equals the old value
            if (intensityTvService.getCharacteristic(Characteristic.Active).value === value) {
                if (value) {
                    platform.log.debug('Switch state is already ON');
                } else {
                    platform.log.debug('Switch state is already OFF');
                }
                callback(null);
                return;
            }

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
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                    platform.log('Failed to switch state to ON');
                });
            } else {
                platform.log.debug('Switch state to OFF');
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
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

        // Handles remote key input
        intensityTvService.getCharacteristic(Characteristic.RemoteKey).on('set', function (value, callback) {
            platform.log.debug('Remote key pressed: ' + value);

            let mode;
            switch (value) {
                case Characteristic.RemoteKey.ARROW_UP:
                    platform.log.debug('Increase brightness by 25%');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.min(200, device.state.execution.brightness + 50) }); }).then(function () { }, function () {
                        platform.log('Failed to increase brightness by 25%');
                    });
                    break;
                        
                case Characteristic.RemoteKey.ARROW_DOWN:
                    platform.log.debug('Decrease brightness by 25%');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.max(0, device.state.execution.brightness - 50) }); }).then(function () { }, function () {
                        platform.log('Failed to decrease brightness by 25%');
                    });
                    break;
                
                case Characteristic.RemoteKey.ARROW_LEFT:

                    // Gets the current mode or the last sync mode to set the intensity
                    mode = 'video';
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        mode = device.state.execution.mode;
                    } else if (device.state.execution.lastSyncMode) {
                        mode = device.state.execution.lastSyncMode;
                    }
                    
                    device.platform.log.debug('Toggle intensity');
                    switch (device.state.execution[mode].intensity) {
                        case 'subtle':
                            break;
                        case 'moderate':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'subtle' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'high':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'moderate' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'intense':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'high' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.ARROW_RIGHT:

                    // Gets the current mode or the last sync mode to set the intensity
                    mode = 'video';
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        mode = device.state.execution.mode;
                    } else if (device.state.execution.lastSyncMode) {
                        mode = device.state.execution.lastSyncMode;
                    }
                    
                    device.platform.log.debug('Toggle intensity');
                    switch (device.state.execution[mode].intensity) {
                        case 'subtle':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'moderate' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'moderate':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'high' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'high':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'intense' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'intense':
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.SELECT:   
                    device.platform.log.debug('Toggle mode');
                    switch (device.state.execution.mode) {
                        case 'video':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'music' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'music':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'game' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'game':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'passthrough' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'passthrough':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'video' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.PLAY_PAUSE:
                    platform.log.debug('Toggle switch state');
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
                            platform.log('Failed to toggle switch state');
                        });
                    } else {
                        let onMode = platform.config.defaultOnMode;
                        if (onMode === 'lastSyncMode') {
                            if (device.state && device.state.execution && device.state.execution.lastSyncMode) {
                                onMode = device.state.execution.lastSyncMode;
                            } else {
                                onMode = 'video';
                            }
                        }
                        platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                            platform.log('Failed to toggle switch state');
                        });
                    }
                    break;
            
                case Characteristic.RemoteKey.INFORMATION:   
                    device.platform.log.debug('Toggle hdmi source');
                    switch (device.state.execution.hdmiSource) {
                        case 'input1':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input2' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input2':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input3' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input3':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input4' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input4':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input1' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                    }
                    break;
            }

            // Performs the callback
            callback(null);
        });

        // Stores the tv service
        device.intensityTvService = intensityTvService;

        // Handles the lightbulb accessory if it is enabled
        if (platform.config.intensityTvAccessoryLightbulb) {

            // Updates the light bulb service
            let intensityTvAccessoryLightBulbService = intensityTvAccessory.getServiceByUUIDAndSubType(Service.Lightbulb);
            if (!intensityTvAccessoryLightBulbService) {
                intensityTvAccessoryLightBulbService = intensityTvAccessory.addService(Service.Lightbulb);
            }

            // Stores the light bulb service
            device.intensityTvAccessoryLightBulbService = intensityTvAccessoryLightBulbService;

            // Subscribes for changes of the on characteristic
            intensityTvAccessoryLightBulbService.getCharacteristic(Characteristic.On).on('set', function (value, callback) {

                // Ignores changes if the new value equals the old value
                if (intensityTvAccessoryLightBulbService.getCharacteristic(Characteristic.On).value === value) {
                    if (value) {
                        platform.log.debug('Switch state is already ON');
                    } else {
                        platform.log.debug('Switch state is already OFF');
                    }
                    callback(null);
                    return;
                }

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
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                        platform.log('Failed to switch state to ON');
                    });
                } else {
                    platform.log.debug('Switch state to OFF');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
                        platform.log('Failed to switch state to OFF');
                    });
                }

                // Performs the callback
                callback(null);
            });

            // Subscribes for changes of the brightness characteristic
            intensityTvAccessoryLightBulbService.getCharacteristic(Characteristic.Brightness).on('set', function (value, callback) {

                // Saves the changes
                platform.log.debug('Switch brightness to ' + value);
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.round((value / 100.0) * 200) }); }).then(function () { }, function () {
                    platform.log('Failed to switch brightness to ' + value);
                });

                // Performs the callback
                callback(null);
            });
        }
    }

    // Handles the entertainment area TV accessory if it is enabled
    if (entertainmentTvAccessory) {

        // Updates tv service
        let entertainmentTvService = entertainmentTvAccessory.getServiceByUUIDAndSubType(Service.Television, 'EntertainmentTVAccessory');
        if (!entertainmentTvService) {
            entertainmentTvService = entertainmentTvAccessory.addService(Service.Television, 'Entertainment Area', 'EntertainmentTVAccessory');

            // Sets the TV name
            if (mainAccessory) {
                entertainmentTvService.setCharacteristic(Characteristic.ConfiguredName, mainAccessory.context.entertainmentTvAccessoryConfiguredName || state.device.name);
                entertainmentTvService.getCharacteristic(Characteristic.ConfiguredName).on('set', function (value, callback) {
                    mainAccessory.context.entertainmentTvAccessoryConfiguredName = value;
                    callback(null);
                });
            } else {
                entertainmentTvService.setCharacteristic(Characteristic.ConfiguredName, state.device.name);
            }
        }

        // Register input sources
        const entertainmentInputServices = [];
        let i = 1;
        for (let groupId in device.state.hue.groups) {
            const group = device.state.hue.groups[groupId];

            let entertainmentInputService = entertainmentTvAccessory.getServiceByUUIDAndSubType(Service.InputSource, 'AREA ' + i);
            if (!entertainmentInputService) {
                entertainmentInputService = entertainmentTvAccessory.addService(Service.InputSource, 'area' + i, 'AREA ' + i);

                // Sets the TV name
                entertainmentInputService
                    .setCharacteristic(Characteristic.ConfiguredName, group.name)
                    .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
                    .setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN)
                    .setCharacteristic(Characteristic.TargetVisibilityState, Characteristic.TargetVisibilityState.SHOWN);
            }
            entertainmentInputService
                .setCharacteristic(Characteristic.Identifier, i)
                .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI);

            // Adds the input as a linked service, which is important so that the input is properly displayed in the Home app
            entertainmentTvService.addLinkedService(entertainmentInputService);
            entertainmentInputServices.push(entertainmentInputService);

            i++;
        }

        // Sets sleep discovery characteristic (which is always discoverable as Homebridge is always running)
        entertainmentTvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

        // Handles on/off events
        entertainmentTvService.getCharacteristic(Characteristic.Active).on('set', function (value, callback) {

            // Ignores changes if the new value equals the old value
            if (entertainmentTvService.getCharacteristic(Characteristic.Active).value === value) {
                if (value) {
                    platform.log.debug('Switch state is already ON');
                } else {
                    platform.log.debug('Switch state is already OFF');
                }
                callback(null);
                return;
            }

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
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                    platform.log('Failed to switch state to ON');
                });
            } else {
                platform.log.debug('Switch state to OFF');
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
                    platform.log('Failed to switch state to OFF');
                });
            }

            // Performs the callback
            callback(null);

        });

        // Handles input source changes
        entertainmentTvService.getCharacteristic(Characteristic.ActiveIdentifier).on('set', function (value, callback) {

            // Gets the ID of the group based on the index
            let groupId;
            let i = 1;
            for (let currentGroupId in device.state.hue.groups) {
                if (i == value) {
                    groupId = currentGroupId;
                    break;
                }

                i++;
            }

            const group = device.state.hue.groups[groupId];

            // Saves the changes
            platform.log.debug('Switch entertainment area to ' + group.name);
            platform.limiter.schedule(function () { return platform.client.updateHue({ 'groupId': groupId }); }).then(function () {}, function () {
                platform.log('Failed to switch entertainment area to ' + group.name);
            });

            // Performs the callback
            callback(null);
        });

        // Handles showing/hiding of sources
        for (let i = 0; i < entertainmentInputServices.length; i++) {
            entertainmentInputServices[i].getCharacteristic(Characteristic.TargetVisibilityState).on('set', function (value, callback) {
                if (value === Characteristic.TargetVisibilityState.SHOWN) {
                    entertainmentInputServices[i].setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN);
                } else {
                    entertainmentInputServices[i].setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.HIDDEN);
                }

                // Performs the callback
                callback(null);
            });
        }

        // Handles remote key input
        entertainmentTvService.getCharacteristic(Characteristic.RemoteKey).on('set', function (value, callback) {
            platform.log.debug('Remote key pressed: ' + value);

            let mode;
            switch (value) {
                case Characteristic.RemoteKey.ARROW_UP:
                    platform.log.debug('Increase brightness by 25%');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.min(200, device.state.execution.brightness + 50) }); }).then(function () { }, function () {
                        platform.log('Failed to increase brightness by 25%');
                    });
                    break;
                        
                case Characteristic.RemoteKey.ARROW_DOWN:
                    platform.log.debug('Decrease brightness by 25%');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.max(0, device.state.execution.brightness - 50) }); }).then(function () { }, function () {
                        platform.log('Failed to decrease brightness by 25%');
                    });
                    break;
                
                case Characteristic.RemoteKey.ARROW_LEFT:

                    // Gets the current mode or the last sync mode to set the intensity
                    mode = 'video';
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        mode = device.state.execution.mode;
                    } else if (device.state.execution.lastSyncMode) {
                        mode = device.state.execution.lastSyncMode;
                    }
                    
                    device.platform.log.debug('Toggle intensity');
                    switch (device.state.execution[mode].intensity) {
                        case 'subtle':
                            break;
                        case 'moderate':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'subtle' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'high':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'moderate' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'intense':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'high' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.ARROW_RIGHT:

                    // Gets the current mode or the last sync mode to set the intensity
                    mode = 'video';
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        mode = device.state.execution.mode;
                    } else if (device.state.execution.lastSyncMode) {
                        mode = device.state.execution.lastSyncMode;
                    }
                    
                    device.platform.log.debug('Toggle intensity');
                    switch (device.state.execution[mode].intensity) {
                        case 'subtle':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'moderate' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'moderate':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'high' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'high':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'intensity': 'intense' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle intensity');
                            });
                            break;
                        case 'intense':
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.SELECT:   
                    device.platform.log.debug('Toggle mode');
                    switch (device.state.execution.mode) {
                        case 'video':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'music' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'music':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'game' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'game':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'passthrough' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                        case 'passthrough':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': 'video' }); }).then(function () {}, function () {
                                platform.log('Failed to toggle mode');
                            });
                            break;
                    }
                    break;
                
                case Characteristic.RemoteKey.PLAY_PAUSE:
                    platform.log.debug('Toggle switch state');
                    if (device.state.execution.mode !== 'powersave' && device.state.execution.mode !== 'passthrough') {
                        platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
                            platform.log('Failed to toggle switch state');
                        });
                    } else {
                        let onMode = platform.config.defaultOnMode;
                        if (onMode === 'lastSyncMode') {
                            if (device.state && device.state.execution && device.state.execution.lastSyncMode) {
                                onMode = device.state.execution.lastSyncMode;
                            } else {
                                onMode = 'video';
                            }
                        }
                        platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                            platform.log('Failed to toggle switch state');
                        });
                    }
                    break;
            
                case Characteristic.RemoteKey.INFORMATION:   
                    device.platform.log.debug('Toggle hdmi source');
                    switch (device.state.execution.hdmiSource) {
                        case 'input1':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input2' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input2':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input3' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input3':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input4' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                        case 'input4':
                            platform.limiter.schedule(function () { return platform.client.updateExecution({'hdmiSource': 'input1' }); }).then(function () {}, function () {
                                platform.log('Failed to switch hdmi source');
                            });
                            break;
                    }
                    break;
            }

            // Performs the callback
            callback(null);
        });

        // Stores the tv service
        device.entertainmentTvService = entertainmentTvService;

        // Handles the lightbulb accessory if it is enabled
        if (platform.config.entertainmentTvAccessoryLightbulb) {

            // Updates the light bulb service
            let entertainmentTvAccessoryLightBulbService = entertainmentTvAccessory.getServiceByUUIDAndSubType(Service.Lightbulb);
            if (!entertainmentTvAccessoryLightBulbService) {
                entertainmentTvAccessoryLightBulbService = entertainmentTvAccessory.addService(Service.Lightbulb);
            }

            // Stores the light bulb service
            device.entertainmentTvAccessoryLightBulbService = entertainmentTvAccessoryLightBulbService;

            // Subscribes for changes of the on characteristic
            entertainmentTvAccessoryLightBulbService.getCharacteristic(Characteristic.On).on('set', function (value, callback) {

                // Ignores changes if the new value equals the old value
                if (entertainmentTvAccessoryLightBulbService.getCharacteristic(Characteristic.On).value === value) {
                    if (value) {
                        platform.log.debug('Switch state is already ON');
                    } else {
                        platform.log.debug('Switch state is already OFF');
                    }
                    callback(null);
                    return;
                }

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
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': onMode }); }).then(function () { }, function () {
                        platform.log('Failed to switch state to ON');
                    });
                } else {
                    platform.log.debug('Switch state to OFF');
                    platform.limiter.schedule(function () { return platform.client.updateExecution({ 'mode': platform.config.defaultOffMode }); }).then(function () { }, function () {
                        platform.log('Failed to switch state to OFF');
                    });
                }

                // Performs the callback
                callback(null);
            });

            // Subscribes for changes of the brightness characteristic
            entertainmentTvAccessoryLightBulbService.getCharacteristic(Characteristic.Brightness).on('set', function (value, callback) {

                // Saves the changes
                platform.log.debug('Switch brightness to ' + value);
                platform.limiter.schedule(function () { return platform.client.updateExecution({ 'brightness': Math.round((value / 100.0) * 200) }); }).then(function () { }, function () {
                    platform.log('Failed to switch brightness to ' + value);
                });

                // Performs the callback
                callback(null);
            });
        }
    }

    // Publishes the external accessories (i.e. the TV accessories)
    if (externalAccessories.length > 0) {
        platform.api.publishExternalAccessories(platform.pluginName, externalAccessories);
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

    // Updates the corresponding service
    if (device.switchService) {

        // Updates the on characteristic
        device.platform.log.debug('Updated state to ' + state.execution.mode);
        device.switchService.updateCharacteristic(Characteristic.On, state.execution.mode !== 'powersave' && state.execution.mode !== 'passthrough');
    }

    // Updates the corresponding service of the TV accessory
    if (device.tvService) {

        // Updates the on characteristic
        device.platform.log.debug('Updated state to ' + state.execution.mode);
        device.tvService.updateCharacteristic(Characteristic.Active, state.execution.mode !== 'powersave');

        // Updates the HDMI input characteristic
        device.platform.log.debug('Updated HDMI input to ' + state.execution.hdmiSource);
        device.tvService.updateCharacteristic(Characteristic.ActiveIdentifier, parseInt(state.execution.hdmiSource.replace('input', '')));

        // Updates the corresponding service
        if (device.tvAccessoryLightBulbService) {

            // Updates the on characteristic
            device.platform.log.debug('Updated state to ' + state.execution.mode);
            device.tvAccessoryLightBulbService.updateCharacteristic(Characteristic.On, state.execution.mode !== 'powersave' && state.execution.mode !== 'passthrough');

            // Updates the brightness characteristic
            device.platform.log.debug('Updated brightness to ' + state.execution.brightness);
            device.tvAccessoryLightBulbService.updateCharacteristic(Characteristic.Brightness, Math.round((state.execution.brightness / 200.0) * 100));
        }
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

        // Updates the corresponding service
        if (device.modeTvAccessoryLightBulbService) {

            // Updates the on characteristic
            device.platform.log.debug('Updated state to ' + state.execution.mode);
            device.modeTvAccessoryLightBulbService.updateCharacteristic(Characteristic.On, state.execution.mode !== 'powersave' && state.execution.mode !== 'passthrough');

            // Updates the brightness characteristic
            device.platform.log.debug('Updated brightness to ' + state.execution.brightness);
            device.modeTvAccessoryLightBulbService.updateCharacteristic(Characteristic.Brightness, Math.round((state.execution.brightness / 200.0) * 100));
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

        // Updates the corresponding service
        if (device.intensityTvAccessoryLightBulbService) {

            // Updates the on characteristic
            device.platform.log.debug('Updated state to ' + state.execution.mode);
            device.intensityTvAccessoryLightBulbService.updateCharacteristic(Characteristic.On, state.execution.mode !== 'powersave' && state.execution.mode !== 'passthrough');

            // Updates the brightness characteristic
            device.platform.log.debug('Updated brightness to ' + state.execution.brightness);
            device.intensityTvAccessoryLightBulbService.updateCharacteristic(Characteristic.Brightness, Math.round((state.execution.brightness / 200.0) * 100));
        }
    }

    // Updates the corresponding service of the entertainment area TV accessory
    if (device.entertainmentTvService) {

        // Updates the on characteristic
        device.platform.log.debug('Updated state to ' + state.execution.mode);
        device.entertainmentTvService.updateCharacteristic(Characteristic.Active, state.execution.mode !== 'powersave');

        // Gets the ID of the group based on the index
        let index = 1;
        for (let currentGroupId in device.state.hue.groups) {
            if (currentGroupId === state.hue.groupId) {
                break;
            }

            index++;
        }

        // Updates the input characteristic
        device.entertainmentTvService.updateCharacteristic(Characteristic.ActiveIdentifier, index);

        // Updates the corresponding service
        if (device.entertainmentTvAccessoryLightBulbService) {

            // Updates the on characteristic
            device.platform.log.debug('Updated state to ' + state.execution.mode);
            device.entertainmentTvAccessoryLightBulbService.updateCharacteristic(Characteristic.On, state.execution.mode !== 'powersave' && state.execution.mode !== 'passthrough');

            // Updates the brightness characteristic
            device.platform.log.debug('Updated brightness to ' + state.execution.brightness);
            device.entertainmentTvAccessoryLightBulbService.updateCharacteristic(Characteristic.Brightness, Math.round((state.execution.brightness / 200.0) * 100));
        }
    }
}

/**
 * Defines the export of the file.
 */
module.exports = SyncBoxDevice;
