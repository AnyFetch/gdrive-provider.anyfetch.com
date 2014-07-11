# AnyFetch provider for Google Drive

> What is Anyfetch ? [anyfetch.com](http://anyfetch.com/)

## Installation

### Requirements

* [Redis](http://redis.io)

### Get the app

```shell
git clone git@github.com:AnyFetch/gdrive.provider.anyfetch.com.git
cd gdrive.provider.anyfetch.com
npm install
```

## Test

```
npm test
```

## Usage

Create a `keys.sh` file:

```shell
# Create a client app at https://cloud.google.com/console
export GDRIVE_API_ID="google client id"
export GDRIVE_API_SECRET="google client secret"
export PROVIDER_URL="http://myprovider.example.com"

# Create a client app at http://manager.anyfetch.com/clients/new
export ANYFETCH_API_ID="anyfetch client id"
export ANYFETCH_API_SECRET="anyfetch client secret"
```

Source and start !

```shell
source keys.sh
npm start
```

## How does it work ?

Fetch API will call `/init/connect` with anyfetch authorization code. We will generate a request_token and transparently redirect the user to gdrive consentment page. gdrive will then call us back on `/init/callback`. We'll check our request_token has been granted approval, and store this.

We can now sync data between gdrive and AnyFetch.

This is where the `upload` helper comes into play. Every time `upload` is called, the function will retrieve, for all the accounts, the files modified since the last run, and upload the data to AnyFetch. Deleted files will also be deleted from AnyFetch.

The computation of the delta (between last run and now) or by push is done by gdrive, and can be really long in some rare cases (for most accounts it is a few seconds, on mine it lasts for 25 minutes -- heavy gdrive users beware! And that says nothing about the time to retrieve the data after.)
