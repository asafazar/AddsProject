cd %~dp0

@echo *** Start mongo db server ***
start cmd /k mongoDb\mongod.exe --dbpath mongoDb\mongoData
mongoDb\mongoimport.exe -d adsServer -c ads --drop --file ads.json
mongoDb\mongoimport.exe -d adsServer -c displays --drop --file stations.json

timeout 5

@echo *** Start node server ***
start cmd /k node AdsMasterProj\bin\www

timeout 5
start chrome --incognito "http://localhost:8080/"

@pause
