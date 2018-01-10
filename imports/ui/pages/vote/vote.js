import './vote.html';

import '/imports/ui/components/navigation/navigation.js';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import Events from '/imports/api/Events/events.js';
import UserData from '/imports/api/UserData/userData.js';

Template.Vote_Layout.helpers({
    doesVoteExist() {
        const event = getEvent();
        const voteEmbedURL = event.voteEmbedURL;
        if (typeof voteEmbedURL !== 'string') {
            return false;
        }

        if (voteEmbedURL == "" || !voteEmbedURL.includes("http")) {
            return false;
        }

        return true;
    },

    getVoteEmbedURL() {
        const event = getEvent();
        return event.voteEmbedURL;
    },

    getEventName() {
        const event = getEvent();
        return event.name;
    },
});

function getEvent() {
    const userID = Meteor.userId();
    const eventID = UserData.findOne({ _id: userID }).eventID;
    return Events.findOne({ _id: eventID });
}