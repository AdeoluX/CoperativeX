const models = require('../models');


class GenericRepo {
   constructor() {
      if (GenericRepo.instance) {
         return GenericRepo.instance;
      }
      this.data = Math.random(); // Example property
      GenericRepo.instance = this;
   }

   setOptions(model, { selectOptions, condition, paginateOptions, transaction, inclussions, data, array, changes, returning, group }) {
      // console.log(model, { selectOptions, condition, paginateOptions, transaction, inclussions, data, array, changes, returning, group })
      this.query = { selectOptions, condition, paginateOptions, transaction, inclussions, data, array, changes, returning, group };
      this.dbQuery = models[model]
      return this
   }

   create = () => {
      const { data, transaction, inclussions } = this.query
      if(!transaction){
         return this.dbQuery.create(data);
      }else{
         return this.dbQuery.create([data], transaction);
      }
      
   }

   bulkCreate = () => {
      const { array, transaction, inclussions,  } = this.query
      return this.dbQuery.insertMany(array)
   }

   update = async () => {
      const { changes, condition, transaction } = this.query
      return await this.dbQuery.findOneAndUpdate(
         condition, 
         changes, 
         {
            ...(!transaction && {returnDocument: 'after'}), 
            ...(transaction && {session: transaction, new: true})
         })
   }

   _delete = async () => {
      const { condition, transaction } = this.query
      return this.dbQuery.destroy({
         where: condition,
         ...(transaction && { transaction })
      })
   }

   findAll = () => {
      const { selectOptions, condition, transaction, inclussions } = this.query
      if(inclussions){
         if(inclussions.length > 0){
            let query = this.dbQuery.find(condition)
            for(var item of inclussions){
               if(typeof item === 'object' && item !== null){
                  // ...(item.populate && {populate: {path: item.populate.path}})
                  query = query.populate({path: item.ref, select: item.select, options: { strictPopulate: false }, })
               }else{
                  query = query.populate({path: item, options: { strictPopulate: false },})
               }
            }
            return query.sort({ createdAt: 1 })
                        .exec()
         }
      }else{
         return this.dbQuery.find(condition)
      }
   }

   findAllAndPagination = () => {
      const { selectOptions, condition, transaction, inclussions, paginateOptions } = this.query
      const {limit, offset } = paginateOptions
      if(inclussions){
         if(inclussions.length > 0){
            let query = this.dbQuery.find(condition)
            for(var item of inclussions){
               if(typeof item === 'object' && item !== null){
                  // ...(item.populate && {populate: {path: item.populate.path}})
                  query = query.populate({path: item.ref, select: item.select, options: { strictPopulate: false }, })
               }else{
                  query = query.populate({path: item, options: { strictPopulate: false },})
               }
            }
            return query.sort({ createdAt: 1 })
                        .skip(offset)
                        .limit(limit)
                        .exec()
         }
         
      }
      return this.dbQuery.find(condition)
                  .sort({ createdAt: 1 })
                  .skip(offset)
                  .limit(limit)
                  .exec()
   }

   findOne = () => {
      const {condition, inclussions} = this.query
      if(inclussions){
         if(inclussions.length > 1){
            let query = this.dbQuery.findOne(condition)
            for(var item of inclussions){
              query = query.populate(item)
            }
            return query.exec()
         }
         return this.dbQuery.findOne(condition).populate(inclussions[0]).exec()
      }
      return this.dbQuery.findOne(condition)
   }
}

module.exports = GenericRepo;