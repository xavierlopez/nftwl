const Joi = require('joi');
const mongoose = require('mongoose');
const {eventSchema} = require('./event');
const { projectCategory, projectCategorySchema } = require('./projectCategory');
const moment = require("moment");


const Project = mongoose.model('Project', new mongoose.Schema({
  active:  {
    type: Boolean,
    default: false
  },
  
  promoted:  {
    type: Boolean,
    default: false
  },
  
  verified:  {
    type: Boolean,
    default: false
  },
  
  basics: {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: new mongoose.Schema({
        name: {
          type: String,
          required: true,
          trim: true
        }
      })
    },
    tags: {
      type:Array
    },
    url_image: {
      type:String,
      trim:true,
      required:true
    },
    video: {
      type:String,
      trim:true,
      required:true
    }
  },

  token:{
    network: {
       type:String,
       trim:true,
       required:true
    },
    coin: {
      type:String,
      trim:true,
      required:true
    },
    supply: Number,
    roiFrom:Number,
    roiTo:Number,
    price:Number,
    numberOfItems:Number,
    auditedContract: Boolean,
    oracle: Boolean,
    vesting: Boolean,
    kyc: Boolean,
    comission: Boolean,
    farming: Boolean,
    staking: Boolean,
    dao: Boolean,
    firstInvestment:Number
  },

  roadmap: [eventSchema],

  story: {
    description: String,
    risks: String
  },

  promotion: {
    contact_name: String,
    contact_email: {
      type:String,
      trim:true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    contact_telegram: String,
    contact_phoneNumber: String,
    website: String,
    whitepaper: String,
    contract_address: String,
    marketplace: String,
    twitter: String,
    telegram: String,
    discord: String,
    lottery: String
  },

  next_event: {
    type:eventSchema
  },

  events_in_future: {
    type: Array
  }
  },
  { timestamps: true }
  ));


function validateProject(project) {
  const schema = {
    basics: {
      title: Joi.string(),
      subtitle:Joi.string(),
      category:Joi.object(),
      tags: Joi.array().items(Joi.object()),
      url_image:Joi.string(),
      video:Joi.string()
    },
    token: {
      network: Joi.object(),
      coin: Joi.object(),
      supply: Joi.number(),
      roiFrom: Joi.number(),
      roiTo: Joi.number(),
      price: Joi.number(),
      numberOfItems: Joi.number(),
      auditedContract: Joi.boolean(),
      oracle: Joi.boolean(),
      vesting: Joi.boolean(),
      kyc: Joi.boolean(),
      comission: Joi.boolean(),
      farming: Joi.boolean(),
      staking: Joi.boolean(),
      firstInvestment:Joi.number(),
      dao:Joi.boolean()
    },
    
    roadmap: Joi.array().items(Joi.object()),
    
    story: {
      description: Joi.string(),
      risks: Joi.string()
    },

    promotion: {
      contact_name: Joi.string(),
      contact_email: Joi.string(),
      contact_telegram: Joi.string(),
      contact_phoneNumber: Joi.string(),
      website: Joi.string(),
      whitepaper: Joi.string(),
      contract_address: Joi.string(),
      marketplace: Joi.string(),
      twitter: Joi.string(),
      telegram: Joi.string(),
      discord: Joi.string(),
      lottery: Joi.string()
    }
  }
  
  return Joi.validate(project, schema);
}

// adds next event to project document
async function addNextEvent(project) {
  const events = [...project.roadmap];
  
  const events_with_moment= events.map(function(e){
    const mom =  moment(e.datetime, "MM/DD/YYYY HH:mm");
    e.moment = mom;
    return e;
  });
  
  const events_sorted = events_with_moment.sort( function ( a, b ) {
    if ( a.moment.valueOf() < b.moment.valueOf() ){
      return -1;
    }
    if (  a.moment.valueOf() < b.moment.valueOf() ){
      return 1;
    }
    return 0;
  }); 

  const events_in_future = events_sorted.filter( function (e) {
    return moment().isBefore(e.moment)
  });

  project.events_in_future= events_in_future;
 
  project.next_event = events_in_future[0];
  
  await project.save();
}

exports.Project = Project; 
exports.validate = validateProject;
exports.addNextEvent = addNextEvent;
exports.features = ['oracle', 'vesting', 'staking','dao','kyc','comission','farming','auditedContrat'];
exports.blockchains =  ['ethereum','bsc','polygon'];
exports.pcat =  ['art','games','collectibles','metaverse','film_and_video','photography','music','publications','utilities'];
exports.phases= ['private-sale','public-sale','start-project','start-farming','start-mint','start-staking','start-pve', 'start-pvp'];