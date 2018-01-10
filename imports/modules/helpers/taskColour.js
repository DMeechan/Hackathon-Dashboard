import { Template } from 'meteor/templating';

Template.registerHelper('getTaskColour', (difficulty) => {
    // console.log('color: ', difficulty);
    switch (difficulty) {
        case 1:
            return "green";
            break;
        case 2:
            return "orange";
            break;
        case 3:
            return "lighten-2 red";
            break;
        default:
            return "blue";
            break;
    }
});

Template.registerHelper('getTaskDifficultyLabel', (difficulty) => {
    switch (difficulty) {
        case 1:
            return "Easy";
            break;
        case 2:
            return "Medium";
            break;
        case 3:
            return "Hard";
            break;
        default:
            return "";
            break;
    }
});
