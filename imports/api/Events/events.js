import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Events = new Mongo.Collection('events');

export default Events;