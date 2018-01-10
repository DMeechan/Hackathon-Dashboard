import './admin.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { access } from 'fs';

import Events from '/imports/api/Events/events.js';
import Tasks from '/imports/api/Tasks/tasks.js';
import UserData from '/imports/api/UserData/userData.js';

Template.Admin_Layout.helpers({
    allowedUser() {
        const userInfo = Meteor.users.findOne({_id: Meteor.userId()}, {
            fields: {
                'emails': 1,
            },
        });
        const email = userInfo.emails[0].address;
        const allowedEmails = [
            "admin@email.com",
            "daniel.meechan@ibm.com"
        ];
        const emailFound = (allowedEmails.indexOf(email) > -1);
        return emailFound || false;
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
        $('.collapsible').collapsible('open', 0);
        Materialize.showStaggeredList('.staggered');
    });
});

Template.admin_event.events({
    'click .toggleEventEditButton': function () {
        const button = $("#eventEditButton");
        if (button.hasClass('hide')) {
            button.removeClass('hide');
        } else {
            button.addClass('hide');
        }
    },
    'click .editController': (clickEvent) => {
        clickEvent.preventDefault();
        const editButton = clickEvent.target;

        const isEditingDisabled = $(".editable").prop("disabled");
        if (isEditingDisabled) {
            // Enable editing
            $(editButton).text('save');
            $(".editable").prop("disabled", false);
            $('.editableButton').removeClass('hide');
        } else {
            // Disable editing & save changes
            $(editButton).text('edit');
            $(".editable").prop("disabled", true);
            $('.editableButton').addClass('hide');

            const editButtonID = editButton.id;
            const eventID = editButtonID.replace('EDIT-', '');
            saveEventChanges(eventID);
        }
    }
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
    const formElements = $(formID + ' :input[type=text]');

    const inputsDict = elementsToDictionary(formElements);
    // console.log(inputsDict);

    const name = inputsDict['event_name'];
    const active = inputsDict['event_active'] || true;
    const date = inputsDict['event_date'];
    const theme = inputsDict['event_theme'];

    Meteor.call('updateEvent', id, name, active, date, theme, (error, result) => {
        if (error) {
            console.log('Error updating event:');
            console.log(error);
        }
    });

    let tasksDict = {};
    for (const key in inputsDict) {
        if (inputsDict.hasOwnProperty(key)) {
            const value = inputsDict[key];
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