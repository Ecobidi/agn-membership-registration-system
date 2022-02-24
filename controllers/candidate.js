const path = require('path')
const CandidateService = require('../services/candidate')
const ElectionService = require('../services/election')

class CandidateController {

  static async selectElectionPage(req, res) {
    let elections = await ElectionService.findAll({})
    res.render('select-election', {elections})
  } 

  static async getCandidatesPage(req, res) {
    let pageNumber = Number.parseInt(req.query.page ? req.query.page : 1)
    let limit_size = Number.parseInt(req.query.limit || CandidateService.QUERY_LIMIT_SIZE)
    let offset = pageNumber * limit_size - limit_size
    let search = req.query.search, election_id = req.query.election_id
    let candidates, totalDocuments
    let elections = await ElectionService.findAll({})
    if (search || election_id) {
      if (search) search = search.trim()
      candidates = await CandidateService.searchBy({search, election_id}, {limit: limit_size, offset}) 
      totalDocuments = await CandidateService.countMatchingDocuments({search, election_id})
    } else {
      candidates = await CandidateService.findAll({limit: limit_size, offset})
      totalDocuments = await CandidateService.countMatchingDocuments({})
    }
    let totalNumberOfPages = Math.ceil(await totalDocuments / limit_size)

    res.render('candidates', {candidates, elections, currentPage: pageNumber, totalNumberOfPages, totalDocuments, limit_size, offset, searchTerm: search, electionId: election_id })

  }

  static async createCandidatePage(req, res) {
    let election_id = req.query.election_id
    if (!election_id) {
      return res.redirect('/candidates/select-election')
    }
    try {
      let election = await ElectionService.findById(election_id)
      if (!election) {
        return res.redirect('/candidates/select-election')
      }
      res.render('candidates-new', { election, error_msg: req.flash('error_msg') })
    } catch (error) {
      console.log(error)
      res.redirect('/candidates')
    }
  }

  static async createCandidate(req, res) {
    let dao = req.body
    try {
      if (req.files) {
        let file = req.files.photo
        let extname = path.extname(file.name)
        let filename = 'candidate_' + new Date().getMilliseconds() + extname
        await file.mv(process.cwd() + '/uploads/images/' + filename)
        dao.photo = filename
        await CandidateService.create(dao)
      } else {
        await CandidateService.create(dao)
      }
      res.redirect('/candidates')
    } catch (err) {
      console.log(err)
      res.redirect('/candidates')
    }
  }

  static async removeCandidate(req, res) {
    try {
      await CandidateService.removeOne(req.params.candidate_id)
      res.redirect('/candidates')
    } catch (err) {
      console.log(err)
      req.flash('error_msg', 'Last Operation Failed')
      res.redirect('/candidates')
    }
  }

}

module.exports = CandidateController