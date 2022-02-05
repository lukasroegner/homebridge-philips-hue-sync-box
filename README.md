# homebridge-philips-hue-sync-box

## Breaking Changes in 1.0.0

Starting with version 1.0.0, this plugins supports multiple Philips Hue Sync Boxes. If you have used the plugin prior to version 1.0.0, your configuration has to be updated.

## About

Homebridge plugin for the Philips Hue Sync Box. 

The Sync Box can be exposed as a lightbulb. The following features are supported:
* On/Off
* Brightness

The Sync Box can be exposed as a switch. The following features are supported:
* On/Off

You can also enable additional TV accessories that support:
* Switching HDMI inputs
* Switching modes
* Switching intensity
* Switching entertainment areas

Each of the additional TV accessories supports the iOS remote widget:
* Up/down: change brightness
* Left/right: change intensity
* Select (center button): toggle modes
* Information button: toggle HDMI inputs
* Play/Pause: toggle on/off

Additionally, each TV accessory can have an integrated lightbulb with support for:
* On/Off
* Brightness

**Important**: TV accessories must be added to HomeKit manually, the logs show the pin for adding them (should be the same pin as for the plugin).

## Installation

Install the plugin via npm:

```bash
npm install homebridge-philips-hue-sync-box -g
```

## Prepare Sync Box

You have to create new credentials to communicate with the Philips Hue Sync Box:
* Make sure the Sync Box is on
* Make sure synchronization is stopped
* Make an HTTP POST request to `https://<SYNC-BOX-IP>/api/v1/registrations`
* The body of the request has to be JSON: `{ "appName": "homebridge", "appSecret": "MDAwMTExMDAwMTExMDAwMTExMDAwMTExMDAwMTExMDA=", "instanceName": "homebridge" }`
* The first response to the request will be `{ "code": 16, "message": "Invalid State" }`
* IMPORTANT: Now, click and hold the button of the Sync Box until the LED switches to green. Immediately release the button as soon as the LED is green! It will switch to white again.
* Immediately make the request again
* The response contains an `accessToken` string

Hints:
* One way to do this is to enter the following into the Terminal: `curl -H "Content-Type: application/json" -X POST -d '{"appName": "homebridge", "appSecret":"MDAwMTExMDAwMTExMDAwMTExMDAwMTExMDAwMTExMDA=", "instanceName": "homebridge"}' https://<SYNC-BOX-IP>/api/v1/registrations`, replacing `<SYNC-BOX-IP>` with the IP address of your Sync Box. If an issue occurs due to a certificate error, add the parameter `-k` to the cURL command.
* Another way may be to use tools like **Postman**. Set the request method to `POST` and enter `https://<SYNC-BOX-IP>/api/v1/registrations` as the request URL (replace `<SYNC-BOX-IP>` with the IP address of your Sync Box). Next, open the tab "Body", set the type to "raw" and select "JSON" as the content type in the dropdown. Then, enter `{ "appName": "homebridge", "appSecret": "MDAwMTExMDAwMTExMDAwMTExMDAwMTExMDAwMTExMDA=", "instanceName": "homebridge" }` into the text box for the body. Click on the "Send" button at the top right to send the request. If an issue occurs due to a certificate error, you can disable certificate verification in Postman. Go to the global settings, open the tab "General" and disable the toggle switch for "SSL certificate verification".

## Configuration

```json
{
    "platforms": [
        {
            "platform": "PhilipsHueSyncBoxPlatform",
            "devices": [
                {
                    "syncBoxIpAddress": "<SYNC-BOX-IP-ADDRESS>",
                    "syncBoxApiAccessToken": "<ACCESS-TOKEN>",
                    "defaultOnMode": "video",
                    "defaultOffMode": "passthrough",
                    "baseAccessory": "lightbulb",
                    "tvAccessory": false,
                    "tvAccessoryType": "tv",
                    "tvAccessoryLightbulb": false,
                    "modeTvAccessory": false,
                    "modeTvAccessoryType": "tv",
                    "modeTvAccessoryLightbulb": false,
                    "intensityTvAccessory": false,
                    "intensityTvAccessoryType": "tv",
                    "intensityTvAccessoryLightbulb": false,
                    "entertainmentTvAccessory": false,
                    "entertainmentTvAccessoryType": "tv",
                    "entertainmentTvAccessoryLightbulb": false
                }
            ]
        }
    ]
}
```

**devices**: Array for all Philips Hue Sync Boxes that should be used by the plugin.

**syncBoxIpAddress**: The IP address of your Philips Hue Sync Box.

**syncBoxApiAccessToken**: The access token that you get while registration.

**defaultOnMode** (optional): The mode that is used when switching the Sync Box on via HomeKit. Defaults to `video`. Possible values are `video`, `music`, `game` or `lastSyncMode`.

**defaultOffMode** (optional): The mode that is used when switching the Sync Box off via HomeKit. Defaults to `passthrough`. Possible values are `powersave` or `passthrough`.

**baseAccessory** (optional): Determines the type of the base accessory for the Sync Box. Defaults to `lightbulb`. Possible values are `lightbulb`, `switch` or `none`. If `none` is used, no base accessory is exposed.

**tvAccessory** (optional): Enables a TV Accessory for switching the inputs of the Sync Box. Defaults to `false`.

**tvAccessoryType** (optional): Type of icon that the Apple Home app should show. Possible values are `tv`, `settopbox`, `tvstick` or `audioreceiver`. Defaults to `tv`.

**tvAccessoryLightbulb** (optional): Enables an integrated lightbulb for the TV Accessory for switching the inputs. Defaults to `false`.

**modeTvAccessory** (optional): Enables a TV Accessory for switching the modes (`video`, `music`, `game`) of the Sync Box. Defaults to `false`.

**modeTvAccessoryType** (optional): Type of icon that the Apple Home app should show. Possible values are `tv`, `settopbox`, `tvstick` or `audioreceiver`. Defaults to `tv`.

**modeTvAccessoryLightbulb** (optional): Enables an integrated lightbulb for the TV Accessory for switching the modes. Defaults to `false`.

**intensityTvAccessory** (optional): Enables a TV Accessory for switching the intensity (`subtle`, `moderate`, `high`, `intense`) of the Sync Box. Defaults to `false`.

**intensityTvAccessoryType** (optional): Type of icon that the Apple Home app should show. Possible values are `tv`, `settopbox`, `tvstick` or `audioreceiver`. Defaults to `tv`.

**intensityTvAccessoryLightbulb** (optional): Enables an integrated lightbulb for the  TV Accessory for switching the intensity. Defaults to `false`.

**entertainmentTvAccessory** (optional): Enables a TV Accessory for switching the entertainment area of the Sync Box. Defaults to `false`.

**entertainmentTvAccessoryType** (optional): Type of icon that the Apple Home app should show. Possible values are `tv`, `settopbox`, `tvstick` or `audioreceiver`. Defaults to `tv`.

**entertainmentTvAccessoryLightbulb** (optional): Enables an integrated lightbulb for the  TV Accessory for switching the entertainment areas. Defaults to `false`.
