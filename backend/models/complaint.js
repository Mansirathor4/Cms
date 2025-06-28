const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complainant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  reportedBy: { type: String, required: true },
  dispatchNo: String,
  requestedBy: String,
  date: { type: Date, default: Date.now },
  roomLocation: String,
  description: String,
  isUrgent: { type: Boolean, default: false },
  attachment: String,

  assignedDivision: {
    type: String,
    enum: ['Electrical', 'Civil', 'Computer', 'Mechanical', 'Plumbing and Water', 'Electronics', 'electrical', 'civil', 'computer', 'mechanical', 'plumbing and water', 'electronics'],
    default: null
  },

  assignedDivisionHead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  workStatus: {
    type: String,
    enum: ['IN_PROGRESS', 'PARTIALLY_DONE', 'DONE', 'CLOSED_BY_USER', 'PENDING', 'REOPENED'],
    default: 'IN_PROGRESS',
    required: true,
  },
  workImage: String,

  remarks: {
    type: String,
    default: '' // Assignee's remarks about the work
  },
  completionDate: {
    type: Date,
    default: null // Date when work was marked DONE or PARTIALLY_DONE
  },

 feedback: {
        status: { // To track if feedback has been given
            type: String,
            enum: ['PENDING', 'SATISFIED', 'PARTIALLY_SATISFIED', 'NOT_SATISFIED'],
            default: 'PENDING'
        },
        comment: { type: String, default: '' }, // User's feedback comment
        date: { type: Date, default: null } // Date when feedback was provided
    },


  coordinatorRemarks: { type: String, default: '' },
    isClosed: { type: Boolean, default: false }, // Final status, after coordinator review
    reopenedCount: { type: Number, default: 0 } // Track how many times it was reopened

}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

module.exports = mongoose.model('Complaint', complaintSchema);