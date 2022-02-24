const UserModel = require('../models/user')

class UserService {

  static QUERY_LIMIT_SIZE = 10;

  static async findByEmail(email) {
    return UserModel.findOne({email})
  }

  static async findByPhone(phone) {
    return UserModel.findOne({phone})
  }

  static async findBySerialNumber(serial_number) {
    return UserModel.findOne({serial_number})
  }

  static async searchByName(search, { offset = 0, limit = this.QUERY_LIMIT_SIZE}) {
    let pattern = new RegExp(search, 'ig')
    return UserModel.find({ $or: [ {other_names: pattern}, {surname: pattern}] })
        .skip(offset).limit(limit)
  }
  
  static async findAll({ offset = 0, limit = this.QUERY_LIMIT_SIZE}) {
    limit = Number.parseInt(limit)
    offset = Number.parseInt(offset)
    return UserModel.find().skip(offset).limit(limit)
  }

  static async countMatchingDocuments(search) {
    let docs
    if (search) {
      let pattern = new RegExp(search, 'ig')
      docs = await UserModel.count({ $or: [ {other_names: pattern}, {surname: pattern}] })
    } else {
      docs = await UserModel.count()
    }
    return docs
  }

  static async create(dao) {
    return UserModel.create(dao)
  }

  static async removeOne(serial_number) {
    return UserModel.findOneAndDelete({serial_number})
  }

}

module.exports = UserService