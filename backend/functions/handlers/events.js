const { db } = require('../util/admin');

exports.getAllEvents = (req,res)=>{
  db
  .collection('events')
  .get()
  .then(doc => {
      let events = [];
      doc.forEach(data => {
          events.push({
              eventId: data.id,
              imageUrl: data.data().imageUrl,
              name: data.data().name,
              organizer: data.data().organizer,
              time: data.data().time,
              cap: data.data().cap,
              attending: data.data().attending,
              category: data.data().category,
              description: data.data().description, 
              participants: data.data().part
       });
      });
      return res.json(events);
    })
    .catch(err=> console.error(err))
} 

//Getting one event when the event ID is given
exports.getOneEvent = (req, res) => {
  let screamData = {};
    db.doc(`/events/${req.params.eventId}`).get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: `Event not found` });
            }
            eventData = doc.data();
            eventData.screamId = doc.id;
            return res.json(eventData);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}

exports.postEvents = (req, res) => {
  participants = [];
  const newEvent = {
      name: req.body.name,
      cap:req.body.cap,
      category:req.body.category,
      organizer: req.body.organizer,
      description:req.body.description,
      time: req.body.time,
      imageUrl:req.body.imageUrl,
      attending: 0,
      participants
  };
 db
      .collection('events')
      .add(newEvent)
      .then(doc => {
          const resEvent = newEvent;
          resEvent.eventId = doc.id;
          res.json(resEvent);
      })
      .catch(err => {
          res.status(500).json({error: `something went wrong`});
          console.error(err);
      });
}

exports.deleteEvents= (req, res) => {
   const document = db.doc(`/events/${req.params.eventId}`);
    document
      .get()
      .then(doc => {
          if(!doc.exists){
            return res.status(404).json({ error: `cannot find the event` });            
          }
          if((doc.data().organizer !== req.user.userName)){
            return res.status(403).json({ error: `Unauthorized` });
          } 
          else{
            return document.delete();
          }
      })
      .then(() => {
          res.json({ message: `Event deleted successfully` });
      })
      .catch(err => {
          console.error(err);
          return res.status(500).json(err);
      });
};

exports.markAttended=(req,res)=>{
  const user = db.doc(`/users/${req.user.userName}`);
  const eventDocument= db.doc(`/events/${req.params.eventId}`);
  let userData
  let eventData;
 eventDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          eventData = doc.data();
          eventData.eventId = doc.id;
          if(eventData.participants.indexOf(req.user.userName) === -1) {
            eventData.participants.push(req.user.userName);
            eventData.attending++;
            return (eventDocument.update({ participants: eventData.participants },{attending:eventData.attending}));
          } else {
            return res.json({ error: `You are already attending` });
          }
        } else {
          return res.status(404).json({ error: 'Event not found' });
        }
      })
      user
           .get()
           .then((doc)=>{
             if(doc.exists){
            userData=doc.data();
            console.log(userData.attending)
            userData.attending.push(eventData.eventId);
            userData.attending.indexOf(eventData.eventId) === -1 ? userData.attending.push(eventData.eventId) : 
            console.log("You are  already attending");
            return(user.update({attending:userData.attending}))
           
           }})
    
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
}

/**
 * TODO: implement unmarkAttended
 */

//Getting the names of all participants
exports.getParticipants = (req, res) => {
  db.doc(`/events/${req.params.eventId}`)
    .get()
    .then(doc => {
      if(doc.exists) {
        let users = [];
        doc.get('participants').forEach(data => {
          users.push(data);
        })
        return res.json(users);mmmm
      } else {
        return res.status(400).json({ error: `Event does not exist` });
      }
    })
    .catch(err => {
      return res.status(500).json({ error : `${err}`});
    })
}

//Getting all the events from a certain category
exports.getCategoryEvents = (req, res) => {
  db
  .collection('events')
  .where("category", "==", req.params.categoryName)
  .get()
  .then(doc => {
    if(!doc.empty) {
      let events = [];
      doc.forEach(data => {
          events.push({
              eventId: data.id,
              imageUrl: data.data().imageUrl,
              name: data.data().name,
              organizer: data.data().organizer,
              time: data.data().time,
              cap: data.data().cap,
              attending: data.data().attending,
              category: data.data().category,
              description: data.data().description, 
              participants: data.data().part
       });
      });
      return res.json(events);
    } else {
      return res.status(404).json({ general: `No Events Found` });
    }
  })
    .catch(err=> console.error(err))
}