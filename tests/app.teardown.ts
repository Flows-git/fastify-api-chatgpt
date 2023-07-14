export default async function () {
  await global.mongo.stop()
  console.log('MongoMemoryServer stopped')
};