import { Meteor } from 'meteor/meteor';
import UserData from '../userData.js';

Meteor.publish('userData', function () {
    if (this.userId) {
        return UserData.find();
    }
});