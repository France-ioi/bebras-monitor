# bebras-monitor

bebras-monitor is the control interface for
[bebras-guard](https://github.com/France-ioi/bebras-guard). It oversees
counters saved by bebras-guard, applies rules to rate-limit or blacklist
clients, configures bebras-guard instances, and displays all that information
through a web interface.

## Installation

Install nvm, node (8.9.1+), and install yarn globally.
Run this command in the project's directory to install dependencies:

    yarn install

## Development

Start the server in development mode with this command:

    LISTEN=8020 REDIS_URL=redis://172.16.0.1:6379 npm run develop

## Production

Run this command to build the javascript bundles:

    npm run build

Then start the server in production mode with this command:

    LISTEN=8020 REDIS_URL=redis://172.16.0.1:6379 npm start

## Actions

Various actions can be applied to a client :

* `r` (rate-limit) : requests from this client will be rate-limited according to different, usually stricter, rules
* `b` (blacklist) : requests from this client will be rejected with a 429 HTTP code (Too many requests)
* `w` (whitelist) : doesn't actually do anything
* `W` (bypass) : stop counting requests from this client and serve it normally

## List of counters

Here is the list of counters read by bebras-monitor.

    activity.pass
    answer.pass
    checkPassword.fail
    checkPassword.pass
    closeContest.pass
    createTeam.public
    createTeam.private
    destroySession
    error
    getRemainingTime.fail
    getRemainingTime.pass
    loadContestData.pass
    loadIndex
    loadOther.data
    loadOther.fail
    loadPublicGroups
    loadSession.found
    loadSession.new
    request.total
    solutions.pass


## Rules configuration

Rules allow to take automatic actions on some clients depending on their counters.

Rules can be configured in `rules.json` ; this file is reloaded every minute.
An example of such file is in `rules.json.example`.

There are two types of rules :

* `shortterm` : rules applied on the counters for the last 10 seconds of requests
* `longterm` : rules applied on the total activity counters ; the values computed from these rules are also displayed on the web interface

Each rule has four fields :

* `name` : a unique identifier for the rule
* `label` : a user-readable name, displayed in logs and in the entry panel of the web interface
* `action` : the action to take if the rule counter gets below 0
* `counter` : a mathematical expression to evaluate from clients counters, which gives the rule counter

The action can be one of :

* `log` : simply log when a rule counter gets below 0
* `reset` : reset the action applied to the client to none
* `reset-` : reset the action applied to the client to none, but only if the previous action was a negative action, either `r` (rate-limit) or `b` (blacklist)
* `r` (rate-limit), `b` (blacklist), `w` (whitelist), `W` (bypass) : apply the specified action to the client
* (nothing) : just do nothing, useful for rules which are simply meant to be displayed in the web interface

The counter is a mathematical expression using the counters read by
bebras-monitor (see list above) ; it can be an expression such as `10 +
answer_pass - 2 * loadIndex`. The counter names must have their dots `.`
replaced by underscores `_`.
