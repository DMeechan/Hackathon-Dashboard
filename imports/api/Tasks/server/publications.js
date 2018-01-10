import { Meteor } from 'meteor/meteor';
import Tasks from '../tasks.js';

Meteor.publish('tasks', function () {
    if (this.userId) {
        return Tasks.find();
    }
});