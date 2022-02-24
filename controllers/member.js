const { streamUpload, removeUploadedFile } = require('../config/cloudinary')

const MemberService = require('../services/member')

class MemberController {

  static async getMemberProfilePage(req, res) {
    let serial_number = req.params.serial_number
    let member = await MemberService.findBySerialNumber(serial_number)
    res.render('member-profile', { member })
  }

  static async getMembersPage(req, res) {
    let pageNumber = Number.parseInt(req.query.page ? req.query.page : 1)
    let limit_size = Number.parseInt(req.query.limit || MemberService.QUERY_LIMIT_SIZE)
    let offset = pageNumber * limit_size - limit_size
    let search = req.query.search
    let members, totalDocuments
    if (search) {
      members = await MemberService.searchBy({search}, {limit: limit_size, offset}) 
      totalDocuments = await MemberService.countMatchingDocuments({search})
    } else {
      members = await MemberService.findAll({limit: limit_size, offset})
      totalDocuments = await MemberService.countMatchingDocuments({})
    }
    let totalNumberOfPages = Math.ceil(await totalDocuments / limit_size)

    res.render('members', {members, currentPage: pageNumber, totalNumberOfPages, totalDocuments, limit_size, offset, searchTerm: search })
  }

  static async createMemberPage(req, res) {
    res.render('members-new', { error_msg: req.flash('error_msg') })
  }

  static async createMember(req, res) {
    let dao = req.body

    try {
      // let member = await MemberService.create(dao)
      if (req.file) {
        // let file = req.files.photo
        // let extname = path.extname(file.name)
        // let filename = member.department_serial_number + extname
        // await file.mv(process.cwd() + '/uploads/images/members/' + filename)
        const imageInfo = await streamUpload(req.file, 'agn-member-registration/members')
        // console.log(imageInfo)
        // member.photo = imageInfo.url
        // member.photo_public_id = imageInfo.public_id
        // await member.save()
        dao.photo = imageInfo.url
        dao.photo_public_id = imageInfo.public_id
      }
      let member = await MemberService.create(dao)
      req.flash('success_msg', "Member successfully added")
      res.redirect('/members')
    } catch (err) {
      console.log(err)
      res.redirect('/members')
    }
  }

  // static async createMember(req, res) {
  //   let dao = req.body
  //   try {
  //     let member = await MemberService.create(dao)
  //     if (req.files) {
  //       let file = req.files.photo
  //       let extname = path.extname(file.name)
  //       let filename = member.department_serial_number + extname
  //       await file.mv(process.cwd() + '/uploads/images/members/' + filename)
  //       member.photo = filename
  //       await member.save()
  //     }
  //     req.flash('success_msg', "Member successfully added")
  //     res.redirect('/members')
  //   } catch (err) {
  //     console.log(err)
  //     res.redirect('/members')
  //   }
  // }

  // TODO Implement Image Cleanup After Member Removal

  static async removeMember(req, res) {
    try {
      let doc = await MemberService.removeOne(req.params.member_id)
      // remove photo
      if (doc.photo_public_id) {
        let result = await removeUploadedFile(doc.photo_public_id)  
      }
      // await fs.unlink(process.cwd() + '/uploads/images/members/' + doc.photo)
      req.flash('success_msg', 'Member removed successfully')
      res.redirect('/members')
    } catch (err) {
      console.log(err)
      req.flash('error_msg', 'Error removing member')
      res.redirect('/members')
    }
  }

}

module.exports = MemberController