cd %~dp0
start cmd /k mongoDb\mongod.exe --dbpath mongoDb\mongoData
mongoDb\mongoimport.exe -d adsServer -c ads --drop --file ads.json
mongoDb\mongoimport.exe -d adsServer -c displays --drop --file stations.json