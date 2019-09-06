const FlakeId = require('flakeid');
const flake = new FlakeId();
const servers = require('./../../../models/servers');
const publicServersList = require("./../../../models/publicServersList");

module.exports = async (req, res, next) => {
  const {server_id, description} = req.body;

  if (description.length > 150) return res.status(403).json({message: 'description must be shorter than 150 characters.'});

  if (!server_id) return res.status(403).json({message: 'server_id missing.'});
  
  // get server by id
  const server = await servers.findOne({server_id}).select('name server_id creator').lean(); 
  // if servers exists
  if (!server) return res.status(404).json({message: 'server does not exist.'});
  // if server creator is by request
  if (server.creator.toString() != req.user._id) return res.status(404).json({message: 'This server is not yours.'});


  // check if already public-ed
  const publicList = await publicServersList.findOne({server: server._id});
  if (publicList) return res.status(404).json({message: 'server is already in the public list.'});

  // check if user added other servers
  const lastTwoCreated = await publicServersList.find({creator: req.user._id}, {_id: 0}).select('created').sort({_id: -1}).limit(2)
  if (lastTwoCreated.length >= 2) {
    let first = lastTwoCreated[0].created;
    let second = lastTwoCreated[1].created;

    // if the user already added server 2 times in an hour:
    if (inHour(first) && inHour(second))
      return res.status(403).json({message: 'Wait an hour before adding another server.'});

  }
  // update server
  const update = await servers.updateOne({_id: server._id}, {$set: {
    public: true
  }})

  // add server
  const add = await publicServersList.create({
    id: flake.gen(),
    server: server._id,
    creator: req.user._id,
    description,
  })


  res.end();
};


const inHour = (time) => ((new Date) - time) < 60 * 60 * 1000