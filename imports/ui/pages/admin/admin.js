import './admin.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveMethod } from 'meteor/simple:reactive-method';
import { access } from 'fs';

import Events from '/imports/api/Events/events.js';
import Tasks from '/imports/api/Tasks/tasks.js';
import UserData from '/imports/api/UserData/userData.js';

Template.Admin_Layout.helpers({
    allowedUser() {
        return ReactiveMethod.call('isAdmin');
    },
});

Template.admin_events.helpers({
    getEvents() {
        // console.log(Events.find({}).fetch());
        return Events.find({});
        // return Events.find({active: true});
    },
});

Template.admin_events.onRendered(() => {
    $(document).ready(function () {
        $('.collapsible').collapsible();

        // Open up the first event
        $('.collapsible').collapsible('open', 0);
        // And make its editButton visible
        const liID = $('ul#events li:first')[0].id;
        const eventID = liID.replace('_li', '');
        const editButton = $('#' + eventID + '_editButton');
        editButton.removeClass('hide');

        // Set show staggered list
        Materialize.showStaggeredList('.staggered');
    });
});

Template.admin_event.events({
    'click .toggleEventButtonVisible': function (clickEvent) {
        clickEvent.preventDefault();
        const headerID = clickEvent.target.id;
        const eventID = headerID.replace('_header', '');

        const button = $('#' + eventID + '_editButton');
        if (button.hasClass('hide')) {
            button.removeClass('hide');
        } else {
            button.addClass('hide');
        }
    },
    'click .editController': (clickEvent) => {
        clickEvent.preventDefault();
        const editButtonIcon = clickEvent.target;

        const isEditingDisabled = $(".editable").prop("disabled");
        if (isEditingDisabled) {
            // Enable editing
            $(editButtonIcon).text('save');
            $(".editable").prop("disabled", false);
            $('.editableButton').removeClass('hide');
        } else {
            // Disable editing & save changes
            $(editButtonIcon).text('edit');
            $(".editable").prop("disabled", true);
            $('.editableButton').addClass('hide');

            const editButtonIconID = editButtonIcon.id;
            const eventID = editButtonIconID.replace('_editButtonIcon', '');
            saveEventChanges(eventID);
        }
    }
});

Template.admin_event_info.onCreated(() => {

});



Template.admin_event_info.onRendered(() => {
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 2, // Creates a dropdown of 15 years to control year,
        today: 'Today',
        clear: 'Clear',
        close: 'Ok',
        closeOnSelect: false // Close upon selecting a date,
    });

});

Template.admin_event_info.helpers({
    getInstructions(id) {
        // $(document).ready(function () {
        //     $('#event_instructions').val('hi');
        // });

        // Wait 0.1 seconds before triggering a textarea autoresize
        Meteor.setTimeout(() => {
            $('#' + id + "_event_instructions").trigger('autoresize');
        }, 150);

        return Events.findOne({ _id: id }).instructions;
    },

    getEnabled(id) {
        const active = Events.findOne({ _id: id }).active;
        
        $(document).ready(() => {
            Meteor.setTimeout(() => {
                $('#' + id + '_event_enabled').prop('checked', active);
            }, 100);
            // $('#' + id + '_event_enabled').prop('checked', true);
        });
    },

});

Template.admin_event_participants.helpers({
    getParticipants() {
        return UserData.find({ eventID: this._id});
    },
});

Template.admin_event_participants.events({
    'click .export': function(clickEvent) {
        Meteor.call('exportUserData', (error, data) => {
            if (error) {
                console.log('Error exporting user data:', error);
                return;
            }
            const csv = Papa.unparse(data);
            downloadCSV(csv);
        });
    },
});

function downloadCSV(csv) {
    const blob = new Blob([csv]);
    const csvUrl = window.URL.createObjectURL(blob, { type: 'text/plain' });
    saveAs( blob, 'users.csv' );
}

Template.admin_event_participant.helpers({
    getParticipant(id) {
        const user = Meteor.users.findOne(id, { fields: { _id: 1, 'profile.name': 1 } });
        return user;
    },
    getName() {
        const user = Meteor.users.findOne(this._id, { fields: { _id: 1, 'profile.name': 1 } });
        return user.profile.name;
    }
});

Template.admin_event_tasks.helpers({
    getTasks() {
        // console.log('id:', this._id);
        return Tasks.find({ eventID: this._id });
    }
});

Template.admin_event_task.events({
    'click .removeTask': (clickEvent) => {
        clickEvent.preventDefault();
        const removeTaskButton = clickEvent.target;
        const taskID = removeTaskButton.id.replace('REMOVE-TASK-BTN-', '');
        Meteor.call('removeTask', taskID, (error, result) => {
            if (error) {
                console.log('Error removing task:');
                console.log(error);
            }
        });
    }
});

Template.admin_event_task.onRendered(() => {
    $(document).ready(function () {
        $('select').material_select();
    });
});

Template.admin_event_addTask.events({
    'click .addTask': (clickEvent) => {
        clickEvent.preventDefault();
        const addTaskButton = clickEvent.target;
        const eventID = addTaskButton.id.replace('ADD-TASK-BTN-', '');

        const formID = '#ADD-TASK-FORM-' + eventID;
        const formElements = $(formID + ' :input[type=text]');
        const inputsDict = elementsToDictionary(formElements);
        // console.log(inputsDict);

        const name = inputsDict['new_task_name'];
        const difficulty = inputsDict['new_task_difficulty'] || 1;

        Meteor.call('insertTask', name, difficulty, eventID, (error, result) => {
            if (error) {
                console.log('Error inserting task:');
                console.log(error);
            }
            // If it worked, reset the values inside the card
            $('#new_task_name').val('');
            $('#new_task_difficulty').val('');
        });
    },
});

Template.admin_addEvent.events({
    'click .addEventToggle': () => {
        const button = $(".toggleAddButton");
        if (button.hasClass('hide')) {
            button.removeClass('hide');
        } else {
            button.addClass('hide');
        }
    },
    'click .addEvent': (clickEvent) => {
        clickEvent.preventDefault();

        const name = $('input#add_event_name').val();
        const active = true;
        const date = $('input#add_event_date').val();
        const theme = $('input#add_event_theme').val();

        Meteor.call('insertEvent', name, active, date, theme, (error, result) => {
            if (error) {
                console.log('Error inserting event:');
                console.log(error);
            }
            $('input#add_event_name').val('');
            $('input#add_event_theme').val('');
        });
    }
});

function saveEventChanges(id) {
    const formID = '#FORM-' + id;
    const formTextElements = $(formID + ' :input[type=text]');

    const textInputsDict = elementsToDictionary(formTextElements);
    const enabledSwitchElement = $('#' + id + '_event_enabled');
    const instructionsElement = $('#' + id + '_event_instructions');
    instructionsElement.trigger('autoresize');

    // console.log('id', id);
    // console.log('element', enabledSwitchElement);
    // console.log('element 0', enabledSwitchElement[0]);
    // console.log('active', enabledSwitchElement[0].checked);

    const name = textInputsDict['event_name'];
    const date = textInputsDict['event_date'];
    const theme = textInputsDict['event_theme'];
    const voteEmbedURL = textInputsDict['event_vote_url'];
    const active = enabledSwitchElement[0].checked;
    const instructions = instructionsElement.val();

    Meteor.call('updateEvent', id, name, active, date, theme, instructions, voteEmbedURL, (error, result) => {
        if (error) {
            console.log('Error updating event:');
            console.log(error);
        }
    });

    let tasksDict = {};
    for (const key in textInputsDict) {
        if (textInputsDict.hasOwnProperty(key)) {
            const value = textInputsDict[key];
            if (key.includes('task_name-')) {
                const taskID = key.replace('task_name-', '');
                tasksDict[taskID] = {};
                tasksDict[taskID]['name'] = value;
            } 
            else if (key.includes('task_difficulty-')) {
                const taskID = key.replace('task_difficulty-', '');
                tasksDict[taskID]['difficulty'] = value;
            }
        }
    }
    // console.log(tasksDict);
    updateTasks(tasksDict);
}

function updateTasks(tasksDictionary) {
    for (const key in tasksDictionary) {
        if (tasksDictionary.hasOwnProperty(key)) {
            const value = tasksDictionary[key];

            const id = key;
            const name = value['name'];
            const difficulty = value['difficulty'];

            Meteor.call('updateTask', id, name, difficulty, (error, result) => {
                if (error) {
                    console.log('Error updating task:');
                    console.log(error);
                } 
            });
        }
    }
}

function elementsToDictionary(formElements) {
    let inputsDict = new Object();
    const inputsArray = formElements.map(function () {
        const key = this.id;
        const value = this.value;

        inputsDict[key] = value;
        return;
        // return {
        //     key: this.id,
        //     value: this.value,
        // };
    }).get();
    return inputsDict;
}

function getEvent() {
    const userID = Meteor.userId();
    const eventID = UserData.findOne({ _id: userID }).eventID;
    return Events.findOne({ _id: eventID });
}

function getEventID() {
    const userID = Meteor.userId();
    return UserData.findOne({ _id: userID }).eventID;
}