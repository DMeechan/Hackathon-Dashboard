import './navigation.html';

Template.navMenu.events({
    'click .logout': () => {
        AccountsTemplates.logout();
    },
});
