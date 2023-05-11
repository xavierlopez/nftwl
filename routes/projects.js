const { Project, validate, addNextEvent, features, blockchains,pcat, phases } = require("../models/project");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { ProjectCategory } = require("../models/projectCategory");
const validateObjectId = require("../middleware/validateObjectId");
const ALWAYSTRUE = {$or: [{active: [true, false]}]} //used for mongoose




/**
 * Route for getting newest projects ordered by date of creation.
 * @name get/newest
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
 router.get("/newest", async (req, res) => {
  const projects = await Project.find({active:true})
  .sort({createdAt:-1})
  res.send(projects);
  return;
});




/**
 * Route serving list of projects.
 * @name get/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get("/", async (req, res) => {
 
  if (Object.keys(req.query).length === 0 ) {
    const projects = await Project.find({active:true})
      .sort({promoted:-1, verified: -1, createdAt:-1})
    res.send(projects);
    return;
  }

  if (Object.keys(req.query).length > 0 ) {
    q = {... req.query}
    const features_have_filter = q.feature ? true : false
    
    const blockchain = q.blockchain ? q.blockchain: blockchains;
    const category = q.category ? q.category : pcat;
    const phase = q.phase ? q.phase : phases; 
    const feature = q.feature ? q.feature : features;
    
    let feats_array = []
    if (features_have_filter) {
      feats_array = [
        feature.includes("oracle") ? {'token.oracle':true} : ALWAYSTRUE,
        feature.includes("staking") ? {'token.staking':true} : ALWAYSTRUE,
        feature.includes("vesting") ? {'token.vesting':true} : ALWAYSTRUE,
        feature.includes("dao") ? {'token.dao':true} : ALWAYSTRUE,
        feature.includes("kyc") ? {'token.kyc':true} :ALWAYSTRUE,
        feature.includes("comission") ? {'token.comission':true} : ALWAYSTRUE,
        feature.includes("farming") ? {'token.farming':true} : ALWAYSTRUE,
        feature.includes("auditedContract") ? {'token.auditedContract':true} : ALWAYSTRUE,
      ];
    } else {
      feats_array = [ALWAYSTRUE]; 
    }

    const projects_filtered = await Project.find(
        {$and: [  
            {$and: [
              {'basics.category.name': category,
              'token.network': blockchain,
              'roadmap.phase': phase,
              'active':true
              }],  
            },
            {$and: feats_array}
          ]}
        )
        .sort({promoted:-1, verified: -1, createdAt:-1});  

    res.send(projects_filtered);
  }
});



/**
 * Route for posting a project.
 * @name post/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post("/", async (req, res) => {
  const p = req.body;
  const { error } = validate(p);
  if (error) return res.status(400).send(error);

  const projectCategories = await ProjectCategory.find({name:p.basics.category.value});
  if (!projectCategories) return res.status(400).send("Invalid category.");
  const projectCategory = projectCategories[0];
  
  const tags = p.basics.tags.map( t => t.value)

  const events = p.roadmap.map( e => {
    const event = {};
    event.description = e.description;
    event.datetime = e.datetime;
    event.phase = e.phase.value;
    return event;
  });
  
  
  const project = new Project({
    basics: {
      title: p.basics.title,
      subtitle: p.basics.subtitle,
      category: {
        _id: projectCategory._id,
        name:projectCategory.name
      },
      tags: tags,
      url_image:p.basics.url_image,
      video:p.basics.video
    },
    
    token: {
      network: p.token.network.value,
      coin: p.token.coin.value,
      supply:p.token.supply,
      roiFrom: p.token.roiFrom,
      roiTo: p.token.roiTo, 
      price: p.token.price,
      numberOfItems: p.token.price,
      auditedContract: p.token.auditedContract,
      oracle: p.token.oracle,
      vesting: p.token.vesting,
      kyc: p.token.vesting,
      comission: p.token.comission,
      farming: p.token.farming,
      staking: p.token.staking,
      firstInvestment:p.token.firstInvestment,
      dao:p.token.dao
    },

    roadmap: events,

    story: {
      description: p.story.description,
      risks: p.story.description
    },
    promotion: {
      contact_name: p.promotion.contact_name,
      contact_email: p.promotion.contact_email,
      contact_telegram: p.promotion.contact_telegram,
      contact_phoneNumber: p.promotion.contact_phoneNumber,
      website: p.promotion.website,
      whitepaper: p.promotion.whitepaper,
      contract_address: p.promotion.contact_address,
      marketplace: p.promotion.marketplace,
      twitter: p.promotion.twitter,
      telegram: p.promotion.telegram,
      discord: p.promotion.discord,
      lottery: p.promotion.lottery
    }

  });

  await project.save();

  res.send(project);
});



/**
 * Route for getting a specific project.
 * @name get/:id
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get("/:id", validateObjectId, async (req, res) => {
  const project = await Project.findById(req.params.id).select("-__v");

  if (!project)
    return res.status(404).send("The project with the given ID was not found.");

  await addNextEvent(project);

  const {...tosend} = project.toObject();
  delete tosend.promotion.contact_email, delete tosend.promotion.contact_phoneNumber, delete tosend.promotion.contact_telegram;
  res.send(tosend);
});






module.exports = router;
