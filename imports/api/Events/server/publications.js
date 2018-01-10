import { Meteor } from 'meteor/meteor';
import Events from '../events.js';

Meteor.publish('events', function () {
    if (this.userId) {
        return Events.find();
    }
});