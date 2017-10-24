Plugin for ircgrampp to show motd message to new Telegram users

# Install & Configure

Install as globaly:

    # npm install -g ircgrampp-plugin-motd

Add file `{ircgrampp_config_dir}/plugins/motd` with the follow content:

```yaml
name motd
enable true
```

# Bridge configuration

Each bridge is defined with the bridge name and params, for example, if you have a bridge name `friends`:

```yaml
name motd
enable true

friends:
    enable: true
    motd: "Hello %u, welcome to the friends group"
```

You can set singular and plural motds:

```yaml
friends:
    enable: true
    motd:
        singular: "We have a new friend, %u"
        plural: "We have new friends, %u"
```

## Options

* **enable** *(Boolean)*: Motd is enabled in channel
* **motd** *(String)*: Simple message to display
* **motd:singular** *(String)*: Simple message to display on new member
* **motd:plural** *(String)*: Simple message to display on new member**s**
* **motdFile** *(String)*: Load motd from file 
* **motdFile:singular** *(String)*: As motd:singular but load motd from file
* **motdFile:plural** *(String)*: As motd:plural but load motd from file
* **delayTime** *(Integer)*: Wait time in ms before show motd
* **html** *(Boolean)*: Use motd in HTML format, by defualt use markdown

## Message params

The follow strings in motd did be replaced:

* **%u**: User or users with profile link
* **%c**: Channel title
* **%l**: If it exists, the invite link

# Know issues

* When multiple members are added, only show the first user (wait fix from ircgrampp)
* Invitation link does not works (wait fix from ircgrampp)

## HTML formating

Telegram bot api, only accepts `a`, `b`, `i`, `code` and `pre` tags, see more [here](https://core.telegram.org/bots/api#html-style)
