#!/bin/sh
SimId=$(xcrun simctl list | grep Booted | cut -d'(' -f 2 | cut -d')' -f 1)
SimDir=~/Library/Developer/CoreSimulator/Devices/$SimId/data/Containers/Data/Application
MobileCrmDir=$(for i in $SimDir/*
do
  if [ -e $i/Documents/config.xml ]
  then
    echo $i
    break
  fi
done)
OfflineHtmlDir=$MobileCrmDir/Documents/WWW
echo $OfflineHtmlDir