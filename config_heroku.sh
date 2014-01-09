# MongoDB
heroku addons:add mongolab
MONGO_URL=`heroku config:get MONGOLAB_URI`
heroku config:set MONGO_URL="$MONGO_URL"

# OAuth
source ./keys.sh

URL="https://provider-google-drive.herokuapp.com"

heroku config:set GOOGLE_DRIVE_ID="$GOOGLE_DRIVE_ID"
heroku config:set GOOGLE_DRIVE_SECRET="$GOOGLE_DRIVE_SECRET"
heroku config:set GOOGLE_DRIVE_CALLBACK_URL="$URL/init/callback"
heroku config:set GOOGLE_DRIVE_CONNECT_URL="$URL/init/connect"

heroku config:set GOOGLE_DRIVE_CLUESTR_ID="$GOOGLE_DRIVE_CLUESTR_ID"
heroku config:set GOOGLE_DRIVE_CLUESTR_SECRET="$GOOGLE_DRIVE_CLUESTR_SECRET"

heroku config:set CLUESTR_FRONT="http://settings.anyfetch.com"