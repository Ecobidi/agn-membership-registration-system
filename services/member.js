const MemberModel = require('../models/member')

class MemberService {

  static QUERY_LIMIT_SIZE = 10;

  static async findById(id) {
    return MemberModel.findById(id)
  }

  static async findBySerialNumber(serial_number) {
    return MemberModel.findOne({serial_number})
  }

  static async searchBy({search = ''}, { offset = 0, limit = this.QUERY_LIMIT_SIZE}) {
    let pattern = new RegExp(search, 'ig')
    let members = await MemberModel.find({ $or: [{department_serial_number: pattern}, {first_name: pattern}, {surname: pattern}, {middle_name: pattern}]}).skip(offset).limit(limit)
    
    return members
  }
  
  static async findAll({ offset = 0, limit = this.QUERY_LIMIT_SIZE}) {
    return MemberModel.find().skip(offset).limit(limit)
  }

  static async countMatchingDocuments({search = ''}) {
    let numberOfDocs
    let pattern = new RegExp(search, 'ig')
    if (search) {
      numberOfDocs = await MemberModel.count({ $or: [{department_serial_number: pattern}, {first_name: pattern}, {surname: pattern}, {middle_name: pattern}]})
    } else {
      numberOfDocs = await MemberModel.count()
    }
    return numberOfDocs
  }

  static async create(dao) {
    return MemberModel.create(dao)
  }

  static async updateOne(update) {
    return MemberModel.findByIdAndUpdate(update._id, {$set: update})
  }

  static async removeOne(serial_number) {
    return MemberModel.findOneAndDelete({serial_number})
  }

}

module.exports = MemberService