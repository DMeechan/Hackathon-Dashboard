import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Tasks = new Mongo.Collection('tasks');

export default Tasks;