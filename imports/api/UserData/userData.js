import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const UserData = new Mongo.Collection('userData');

export default UserData;