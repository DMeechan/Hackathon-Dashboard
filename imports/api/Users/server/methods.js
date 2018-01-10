import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

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
});
