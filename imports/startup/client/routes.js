import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

import '/imports/ui/index.js';

Router.configure({
 noRoutesTemplate: '404',
});

Router.onBeforeAction(function () {
    // all properties available in the route function
    // are also available here such as this.params
    if (!Meteor.userId()) {
        // if the user is not logged in, render the Login template
        this.render('Login_Layout');
    } else {
        // otherwise don't hold up the rest of hooks or our route/action function
        // from running
        this.next();
    }
}, {
    // except: ['code']
});

Router.route('/', function() {
    this.redirect('/events');
});

Router.route('/home', {
    subscriptions: function () {
        const subscriptions = [
            Meteor.subscribe('events'),
            Meteor.subscribe('tasks'),
            Meteor.subscribe('users'),
            Meteor.subscribe('userData'),
        ];
        return subscriptions;
    },

    action: function () {
        if (this.ready()) {
            this.render('Home_Layout');
        } else {
            this.render('Loading_Layout');
        }
    }
});

Router.route('/admin', {
    subscriptions: function () {
        const subscriptions = [
            Meteor.subscribe('events'),
            Meteor.subscribe('tasks'),
            Meteor.subscribe('users'),
            Meteor.subscribe('userData'),
        ];
        return subscriptions;
    },

    action: function () {
        if (this.ready()) {
            this.render('Admin_Layout');
        } else {
            this.render('Loading_Layout');
        }
    }
});

Router.route('/events', {
    subscriptions: function () {
        const subscriptions = [
            Meteor.subscribe('events'),
            Meteor.subscribe('userData'),
            Meteor.subscribe('users'),
        ];
        return subscriptions;
    },

    action: function () {
        if (this.ready()) {
            this.render('Events_Layout');
        } else {
            this.render('Loading_Layout');
        }
    }
});

Router.route('/code', {
    subscriptions: function () {
        const subscriptions = [
            Meteor.subscribe('userData'),
            Meteor.subscribe('users'),
        ];
        return subscriptions;
    },

    action: function () {
        if (this.ready()) {
            this.render('Code_Layout');
        } else {
            this.render('Code_Layout');
        }
    }
})

Router.route('/vote', {
    subscriptions: function () {
        const subscriptions = [
            Meteor.subscribe('userData'),
            Meteor.subscribe('users'),
        ];
        return subscriptions;
    },
    action: function() {
        if (this.ready()) {
            this.render('Vote_Layout');
        } else {
            this.render('Loading_Layout');
        }
    }
});

Router.route('/survey', {
    subscriptions: function () {

    },
    action: function () {
        if (this.ready()) {
            this.render('Survey_Layout');
        } else {
            this.render('Loading_Layout');
        }
    }
});