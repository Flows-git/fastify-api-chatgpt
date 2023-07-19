import { dbCollectionQueryService } from '@/services/dbCollectionQuery.service'
import { Recipe } from '@/types'
import { Db, ObjectId } from 'mongodb'
import validate from './recipe.validation'

export function recipeDbService(db: Db) {
  return dbCollectionQueryService<Recipe>(db, 'recipes', {
    validate,
    parse: ({ item }) => {
      item.ingredients.forEach((ingredient) => {
        ingredient.ingredientId = new ObjectId(ingredient?._id)
        delete (ingredient as any)._id
      })
      return item
    },
    listPipeline: [
      {
        $set: {
          ingredientsCount: { $size: '$ingredients' },
        },
      },
      {
        $addFields: {
          'duration.total': {
            $sum: ['$duration.preperation', '$duration.rest', '$duration.cook'],
          },
        },
      },
      {
        $project: {
          ingredients: 0,
          instructions: 0,
        },
      },
    ],
    readPipeLine: [
      {
        $lookup: {
          from: 'products',
          localField: 'ingredients.ingredientId',
          foreignField: '_id',
          as: 'products',
        },
      },
      {
        $addFields: {
          ingredients: {
            $map: {
              input: '$ingredients',
              in: {
                $mergeObjects: [
                  '$$this',
                  {
                    $first: {
                      $filter: {
                        input: '$products',
                        as: 'i',
                        cond: { $eq: ['$$i._id', '$$this.ingredientId'] },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          'duration.total': {
            $sum: ['$duration.preperation', '$duration.rest', '$duration.cook'],
          },
        },
      },
      {
        $unset: ['products', 'ingredients.ingredientId'],
      },
    ],
  })
}
