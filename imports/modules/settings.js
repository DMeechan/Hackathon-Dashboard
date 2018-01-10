import { Meteor } from 'meteor/meteor';

const settings = Meteor.settings;
const admins = settings.admins;

if (!admins) {
    console.warn('settings.js | Warning: Cannot find "admins" in settings.json');
    console.warn('settings.js | Make sure to add "--settings settings.json" to the end of your command when starting the Meteor server');
}

export { admins };