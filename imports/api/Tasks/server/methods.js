import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Tasks from '../tasks';

Meteor.methods({
    insertTask: function(name, difficultyString, eventID) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        const difficulty = Number(difficultyString);
        check(name, String);
        check(difficulty, Number);
        check(eventID, String);

        const content = {
            name: name,
            difficulty: difficulty,
            eventID: eventID,
        }

        Tasks.insert(content);
    },

    updateTask: (id, name, difficultyString) => {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        const difficulty = Number(difficultyString);
        check(id, String);
        check(name, String);
        check(difficulty, Number);

        Tasks.update({_id: id}, {
            $set: {
                name: name,
                difficulty: difficulty,
            },
        });
    },

    removeTask: function (id) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        check(id, String);
        Tasks.remove(id);
    },

});
