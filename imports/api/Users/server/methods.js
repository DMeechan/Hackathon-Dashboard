import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import admins from '/imports/modules/settings.js';

Meteor.methods({
    exportUserData: function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        const userEmails = Meteor.users.find({}, {
            fields:{
                _id: 1,
                'profile.name': 1,
                'emails': 1,
            },
        }).fetch();

        const map = userEmails.map(function(item) {
            const dict = {
                _id: item._id,
                email: item.emails[0].address,
                name: item.profile.name,
            };
            return dict;
        });

        console.log(map);
        return map;

    },

    isAdmin: () => {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        const userInfo = Meteor.users.findOne({ _id: Meteor.userId() }, {
            fields: {
                'emails': 1,
            },
        });
        const email = userInfo.emails[0].address;
        const allowedEmails = admins.admins;

        const emailFound = (allowedEmails.indexOf(email) > -1);
        return emailFound || false;
    },
});
