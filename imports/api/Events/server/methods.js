import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import moment from 'moment';

import Events from '../events';

Meteor.methods({
    insertEvent: function (name, active, stringDate, theme) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        const date = stringToDate(stringDate);

        check(name, String);
        check(active, Boolean);
        check(theme, String);

        const content = {
            name: name,
            active: active,
            date: date,
            theme: theme,
        }

        Events.insert(content);
    },

    updateEvent: (id, name, active, stringDate, theme, instructions, voteEmbedURL) => {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        const date = stringToDate(stringDate);

        check(name, String);
        check(active, Boolean);
        check(theme, String);
        check(instructions, String);
        check(voteEmbedURL, String);

        Events.update({ _id: id }, {
            $set: {
                name: name,
                active: active,
                date: date,
                theme: theme,
                instructions: instructions,
                voteEmbedURL: voteEmbedURL
            } 
        });
    },

    removeEvent: function (id) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        check(id, String);
        Events.remove(id);
    },

});

function stringToDate(stringDate) {
    check(stringDate, String);
    
    const momentDate = moment(stringDate, "DD MMMM, YYYY");
    const date = momentDate.toISOString();

    // Check that JS would consider the output as a valid date:
    const dateObject = moment(date).toDate();
    check(dateObject, Date);

    return date;
}
