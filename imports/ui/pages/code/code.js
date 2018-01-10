import './code.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import UserData from '/imports/api/UserData/userData.js';

// Template.code_activateBonus.events({
//     'click .submit': (clickEvent) => {
//         clickEvent.preventDefault();
//         $('.start').addClass('hide');
//         $('.end').removeClass('hide');
        
//         const userID = Meteor.userId();
//         const currentScore = UserData.findOne({
//             _id: userID
//         }).score;

//         UserData.update({ _id: userID}, { $set: {
//             score: currentScore + 10,
//         }});
//     }
// });