export default async function (globalConfig: any, projectConfig: any) {
  await global.mongo.stop()
  console.log('MongoMemoryServer stopped')
};