import './home.html';

import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import Events from '/imports/api/Events/events.js'; 
import Tasks from '/imports/api/Tasks/tasks.js';
import UserData from '/imports/api/UserData/userData.js';

Template.Home_Layout.helpers({
    getEvent() {
        const event = getEvent();
        // console.log(event);
        return event;
    }
});

Template.home_welcome.helpers({
    getName() {
        return Meteor.users.findOne({ _id: Meteor.userId() }).profile.name;
    },
});

Template.home_leaderboard.helpers({
    getTopParticipants() {
        const eventID = getEventID();
        const top = UserData.find({ eventID: eventID }, { sort: { score: -1 }, skip: 0, limit: 10 });
        return top;

    },

    getParticipantName(id) {
        const user = Meteor.users.findOne(id, { fields: { _id: 1, 'profile.name': 1 } });
        return user;
    },

    getParticipantsCount() {
        const eventID = getEventID();
        const participants = UserData.find({ eventID: eventID }).fetch();
        return participants.length;
    }
    
});

Template.home_tasks.onRendered(function () {
    $(document).ready(function () {
        Materialize.showStaggeredList('.staggered');
    });
});

Template.home_task.onRendered(function() {
    // Check current task is done or not in database
    // And add current task (as false) if it doesn't exist in database
    // If it's not, set checkbox to unchcked
    // If it is, set checkbox to checked
    // console.log('Task ID on render is: ', self._id);

    const userID = Meteor.userId();
    const taskID = this.data._id;

    const taskData = getTaskData(taskID);

    // If the task doesn't exist (taskData is empty), insert it into the user's tasks array
    if (!taskData) {
        insertTask(taskID);
    }

    const taskComplete = getTaskComplete(taskData);
    // Set task check mark to match whether the task is checked or not
    updateTaskCheckbox(taskID, taskComplete);

});

function getTaskData(taskID) {
    const userTasksOutput = UserData.findOne({ _id: Meteor.userId() }, {
        fields: {
            tasks: 1,
        }
    }).tasks;

    if (!userTasksOutput) {
        console.log('home.js | getTaskData | Warning: unable to get user', Meteor.userId(), 'tasks. Exiting.')
        return;
    }

    const tasksFilter = userTasksOutput.filter((task) => {
        if (task.id == taskID) {
            return task;
        }
    });
    // Return the first (and only) value in the filter
    const taskData = tasksFilter.values().next().value;
    return taskData;
}

function getTaskComplete(taskData) {
    // console.log('Task complete:', taskData.complete);
    // If the value is a boolean, return the boolean value
    // If it's not, use a string to boolean conversion
    if (!taskData) {
        return false;
    }
    if(typeof(taskData.complete) === 'boolean') {
        return taskData.complete
    }
    return (taskData.complete == 'true');
}

function insertTask(taskID) {
    UserData.update({ _id: Meteor.userId() }, {
        $push: {
            tasks: {
                id: taskID,
                complete: false,
            }
        }
    });
}

function removeTask(taskID) {
    UserData.update({ _id: Meteor.userId() }, {
        $pull: {
            tasks: {
                id: taskID
            }
        }
    });
}

function updateTaskCheckbox(taskID, taskComplete) {
    $("#" + taskID).prop("checked", taskComplete);
}

Template.home_task.events({
    'click .toggle-checked': (clickEvent) => {
        // clickEvent.preventDefault();
        const checkButton = clickEvent.target;

        const taskID = checkButton.id;
        const userID = Meteor.userId();

        const taskData = getTaskData(taskID);
        const oldTaskValue = getTaskComplete(taskData);
        const newTaskValue = !oldTaskValue
        // console.log('Old value:', oldTaskValue, 'New Value:', newTaskValue);

        // Update task value in database
        Meteor.call('updateTaskValue', userID, taskID, newTaskValue, (error, result) => {
            if (error) {
                console.log('Error updating task value', error);
                return;
            }
            // Update task checkbox in UI
            updateTaskCheckbox(taskID, newTaskValue);
            if (newTaskValue == true) {
                Materialize.toast('Challenge complete! Well done!', 2000);
            }
            updateScore();   
        });

    },
});

Template.home_tasks.onRendered(() => {
    updateScore();
});

function updateScore() {
    // console.log('Updating score');
    const userID = Meteor.userId();
    const userTasksOutput = UserData.findOne({ _id: userID }, {
        fields: {
            tasks: 1,
        }
    }).tasks;

    if (!userTasksOutput) {
        console.log('Whoops, cannot find userTasksOutput when updating score');
        return;
    }

    let score = 0;
    for (let i = 0; i < userTasksOutput.length; i++) {
        const taskID = userTasksOutput[i].id;
        // const complete = getTaskComplete(userTasksOutput[i].complete);
        const complete = userTasksOutput[i].complete;
        const taskData = Tasks.findOne({ _id: taskID });
        if (!taskData) {
            // Task doesn't exist; it has probably been deleted
            // So we need to remove it from the User's Tasks array
            // And then move to the next item in the loop
            removeTask(taskID);
            continue;
        }
        const difficulty = taskData.difficulty;
        if (complete) {
            const modifier = difficulty * 10;
            score += modifier;
        }
    }

    const foundSecretCode = UserData.findOne({ _id: userID }).foundSecretCode;
    // Check if the object exists
    if (typeof foundSecretCode === 'boolean') {
        // And then check if the value is true
        if (foundSecretCode === true) {
            score += 15;
        } 
    }

    UserData.update({_id: userID}, {
        $set: {
            score: score,
        }
    });
}

Template.home_tasks.helpers({
    getTasks() {
        const eventID = getEventID();
        return Tasks.find({ eventID: eventID });
    },
    getScore() {
        const user = UserData.findOne({_id: Meteor.userId()});
        return user.score;
    },
});

Template.home_secret_code.helpers({
    codeNotFound() {
        const foundSecretCode = UserData.findOne({ _id: Meteor.userId() }).foundSecretCode;
        // Check the object is a boolean first; we don't want to return undefined
        if (typeof foundSecretCode !== 'boolean') {
            // console.log('Secret code not found:', foundSecretCode);
            return true;
        }
        return !foundSecretCode;
    },
});

Template.home_secret_code.events({
    'click .submitCode': (clickEvent) => {
        const enteredCode = $('#secret_code').val();
        if (enteredCode.toLowerCase() === "merrychristmas2017") {
            UserData.update({ _id: Meteor.userId() }, {
                $set: {
                    foundSecretCode: true,
                }
            }, (error) => {
                if (error) {
                    console.log('Error writing secret code result to database:', error);
                }
                updateScore();
                Materialize.toast("Well done for finding the hidden code!", 4000);
                Materialize.toast("You've been awarded 15 bonus points", 4000);
                // $('.tooltipped').tooltip('remove');
            });
        }
        
    }
});

Template.home_secret_code.onRendered(() => {
    $(document).ready(function () {
        $('.tooltipped').tooltip({ delay: 50 });
    });
});

function getEvent() {
    const userID = Meteor.userId();
    const eventID = UserData.findOne({ _id: userID }).eventID;
    return Events.findOne({ _id: eventID });
}

function getEventID() {
    const userID = Meteor.userId();
    return UserData.findOne({ _id: userID }).eventID;
}
