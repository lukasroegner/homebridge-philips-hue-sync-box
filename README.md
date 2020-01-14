# homebridge-philips-hue-sync-box

Homebridge plugin for the Philips Hue Sync Box. 

The Sync Box is exposed as a lightbulb. The following features are currently supported:
* On/Off
* Brightness

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
* The body of the request has to be JSON: `{ "appName": "homebridge", "appSecret": "aG9tZWJyaWRnZS1odWUtc3luYy1ib3gtYXBwLXNlY3JldA==", "instanceName": "homebridge" }`
* The first response to the request will be `{ "code": 16, "message": "Invalid State" }`
* IMPORTANT: Now, click and hold the button of the Sync Box until the LED switches to green. Immediately release the button as soon as the LED is green! It will switch to white again.
* Immediately make the request again
* The response contains an `accessToken` string

## Configuration

```json
{
    "platforms": [
        {
            "platform": "PhilipsHueSyncBoxPlatform",
            "syncBoxIpAddress": "<SYNC-BOX-IP-ADDRESS>",
            "syncBoxApiAccessToken": "<ACCESS-TOKEN>",
            "defaultOnMode": "video",
            "defaultOffMode": "passthrough"
        }
    ]
}
```

**syncBoxIpAddress**: The IP address of your Philips Hue Sync Box.

**syncBoxApiAccessToken**: The access token that you get while registration.

**defaultOnMode** (optional): The mode that is used when switching the Sync Box on via HomeKit. Defaults to `video`. Possible values are `video`, `music` or `game`.

**defaultOffMode** (optional): The mode that is used when switching the Sync Box off via HomeKit. Defaults to `passthrough`. Possible values are `powersave` or `passthrough`.
