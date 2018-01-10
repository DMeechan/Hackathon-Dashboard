import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import UserData from '../userData.js';

Meteor.methods({
    updateTaskValue: (userID, taskID, newTaskValue) => {
        UserData.update({ _id: userID, 'tasks.id': taskID }, {
            $set: {
                'tasks.$.complete': newTaskValue,
            }
        });
    },

    updateScore: (userID, score) => {
        UserData.update({ _id: userID }, {
            $set: {
                score: score,
            }
        });
    },
});