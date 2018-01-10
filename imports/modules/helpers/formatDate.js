import { Template } from 'meteor/templating';
import moment from 'moment';

Template.registerHelper('formatDate', function (date) {
    return moment(date).format('dddd Do MMM YYYY');
    // Will display the date as: Monday 1 Nov 2017
});

Template.registerHelper('formatDateMaterialize', function (date) {
    return moment(date).format('DD MMMM, YYYY');
    // Will display the date as: Monday 1 Nov 2017
});