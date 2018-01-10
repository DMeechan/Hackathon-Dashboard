import './home.html';

import { Session } from 'meteor/session';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';

import Events from '/imports/api/Events/events.js'; 
import Tasks from '/imports/api/Tasks/tasks.js';
import UserData from '/imports/api/UserData/userData.js';

Template.Home_Layout.helpers({
    getEvent() {
        const event = getEvent();
        console.log(event);
        return event;
    }
});

Template.home_leaderboard.helpers({
    getTopParticipants() {
        const userID = Meteor.userId();
        const eventID = UserData.findOne({ _id: userID }).eventID;
        const top = UserData.find({ eventID: eventID }, { sort: { score: -1 }, skip: 0, limit: 5 });
        return top;

        // const participants = Events.findOne({_id: event._id}).participants;

        // Sort in descending order (by sorting in ascending order and then inversing it)
        // const sortedParticipants = _.sortBy(participants, 'score').reverse();

        // Cut it to only the top 5
        // const topParticipants = _.first(sortedParticipants, 5);  
        // console.log('top', topParticipants);
        // return topParticipants;

    },

    getParticipantName(id) {
        const user = Meteor.users.findOne(id, { fields: { _id: 1, 'profile.name': 1 } });
        console.log(user);
        return user;
    },

    getParticipantsCount() {
        Meteor.call('getParticipantsCount', event._id, (error, result) => {
            if (result) {
                Session.set('participant-count', result);
            }
        });
        
        return Session.get('participant-count');
        // const participants = Events.findOne({ _id: event._id }).participants;
        // return participants.length;
    }
    
});

Template.home_tasks.onRendered(function () {
    $(document).ready(function () {
        Materialize.showStaggeredList('.staggered');
    });
});

Template.home_task.events({
    'click .toggle-checked': (clickEvent) => {
        // clickEvent.preventDefault();
        const checkButton = clickEvent.target;
        const taskID = checkButton.id;
        const userID = Meteor.userId();
        const eventID = Session.get('event-id');

        const task = Tasks.find({_id: taskID});
        const difficulty = task.difficulty;


        const currentScore = 0;

        const result = Events.findOne({ _id: eventID }, 
            {
                fields: {
                    'participants.id': 1,
                    'participants.score': 1,
                }
            }
        );
        console.log('rrsult', result);

        const isChecked = $("#" + taskID).prop("checked");
        if (isChecked) {
            // Mark task incomplete
            Meteor.call('updateParticipantScore', eventID, userID, 25);
        } else {
            // Mark task complete

        }

    },
});

Template.home_tasks.helpers({
    getTasks() {
        const eventID = Session.get('event-id');
        return Tasks.find({ eventID: eventID });
    },
    getScore() {
        // Get user's participant ID
        const userID = Meteor.userId();
        // Get the participants from the event
        const participants = getParticipants(event._id);

        // Get a map of the array of participants and iterate through it
        // to find the right participant
        const map = participants.map(function (item) {
            if (item.id == userID) {
                const participant = item;
                // console.log('Participant:', participant.id, 'scores:', participant.score);
                return participant.score.toString();
            }
        });

        // Return the first (and only) value in the map
        return map.values().next().value;
    },
});

function getEvent() {
    const userID = Meteor.userId();
    const eventID = UserData.findOne({ _id: userID }).eventID;
    return Events.findOne({ _id: eventID });
    // const id = Session.get('event-id');
    // return event = Events.findOne({ _id: id });
}

function getParticipants(eventID) {
    // Get an array of events (containing only 1 event) and 
    // filter the result to return its Participants in an array
    const result = Events.find({
        _id: eventID,
    }, {
            fields: {
                'participants.id': 1,
                'participants.score': 1,
            }
        }).fetch();

    // Get the participants from the event
    const participants = result[0].participants;
    return participants;
}
