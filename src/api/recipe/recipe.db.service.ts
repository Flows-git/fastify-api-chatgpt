import { dbCollectionQueryService } from '@/services/dbCollectionQuery.service'
import { ApiListParams, Recipe } from '@/types'
import { Db, ObjectId } from 'mongodb'
import validate from './recipe.validation'

export function recipeDbService(db: Db) {
  const dbService = dbCollectionQueryService<Recipe>(db, 'recipes', {
    validate,
    parse: ({ item }) => {
      item.ingredients.forEach(ingredient => {
        ingredient.ingredientId =  new ObjectId(ingredient.ingredient._id)
        delete (ingredient as any).ingredient
      })
      return item
    },
  })

  function listItems(params: ApiListParams) {
    return dbService.listItems(params, [
      {
        $set: {
          ingredientsCount: { $size: '$ingredients' },
        },
      },
      {
        $project: {
          ingredients: 0,
          instructions: 0
        },
      },
    ])
  }

  function readItem(item: string | ObjectId ) {
    return dbService.readItem(item, [
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
                    ingredient: {
                      $first: {
                        $filter: {
                          input: '$products',
                          as: 'i',
                          cond: { $eq: ['$$i._id', '$$this.ingredientId'] },
                        },
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
        $unset: ['products', 'ingredients.ingredientId'],
      },
    ])
  }

  return {
    ...dbService,
    listItems,
    readItem
  }
}
