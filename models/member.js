const mongoose = require('mongoose')
const DBCounterModel = require("./db_counter")

let MemberSchema = new mongoose.Schema({
  serial_number: {
    type: Number,
    unique: true,
  },
  department_serial_number: {
    type: String,
    unique: true,
  },
  surname: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  middle_name: String,
  residential_address: String,
  office_address: String,
  lga_of_origin: String,
  state_of_origin: String,
  occupation: String,
  phone: String,
  is_born_again: Boolean,
  when_born_again: String,
  is_baptized_member: Boolean,
  when_baptized: String,
  is_full_member: Boolean,
  is_holy_spirit_baptized: Boolean,
  when_holy_spirit_baptized: String,
  is_married: Boolean,
  name_of_spouse: String,
  is_spouse_a_member: Boolean,
  is_tithe_payer: Boolean,
  last_tithing_date: String,
  was_baptized_in_local_assembly: Boolean,
  period_transferred_to_church: String,
  location_transferred_from: String,
  is_sunday_school_attendee: Boolean,
  sunday_school_teacher: String,
  is_bible_class_attendee: Boolean,
  primary_church_department: {
    type: String,
    default: 'OT'
  },
  secondary_church_department: String,
  photo: String,
  photo_public_id: String,
}, {timestamps: {createdAt: true}})

async function getNextSequenceValue(sequenceName) {
  var sequenceDocument = await DBCounterModel.findOneAndUpdate({ _id: sequenceName }, { $inc: { sequence_value: 1}}, {upsert: true})
  return sequenceDocument.sequence_value
}

MemberSchema.pre("save", async function(next){
  if (this.serial_number == undefined) {
    let db_counter_to_increment
    let abbreviated_department = this.primary_church_department.toLowerCase()
    switch(this.primary_church_department.toLowerCase()) {
      case 'mm': {
        this.primary_church_department = "Men's Ministry"
        db_counter_to_increment = "men_membership_id"; break
      }
      case 'wm': {
        this.primary_church_department = "Women's Ministry"
        db_counter_to_increment = "women_membership_id"; 
        break
      }
      default: {
        this.primary_church_department = "Others"
        db_counter_to_increment = "other_membership_id";
      }
    }
    this.serial_number = await getNextSequenceValue("members_id")
    this.department_serial_number = abbreviated_department + "-" + await getNextSequenceValue(db_counter_to_increment)
  }
  next()
})

module.exports = mongoose.model('member', MemberSchema)
