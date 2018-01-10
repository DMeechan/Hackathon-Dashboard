import './events.html';

import { Meteor } from 'meteor/meteor';

import Events from '/imports/api/Events/events.js';
import UserData from '/imports/api/UserData/userData.js';

Template.Events_Layout.helpers({
    getEvents() {
        return Events.find({});
        // return Events.find({active: true});
    },
});

Template.Events_Layout.onRendered(function() {
    $(document).ready(function () {
        Materialize.showStaggeredList('#eventsList');
    });
});

Template.event_card.helpers({
    getCardColour() {
        if (this.active) {
            return "blue lighten-1";
        }
        return "grey";
    }
});

Template.event_card.events({
    'click .join': (clickEvent) => {
        const eventID = clickEvent.target.id;
        const userID = Meteor.userId();

        // Add the event and score to the user's data
        // And add the events tasks in there too
        UserData.upsert({
            _id: userID,
        }, {
            $set: {
                eventID: eventID,
                score: 0,
            },
        });

        console.log('Joining event: ', eventID);
    }
});