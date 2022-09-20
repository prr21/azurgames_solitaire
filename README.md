This is a sample project. It was created with cordova and phaser. It uses webpack and [@flow](https://flow.org/).

In order to build and run this project follow the further steps. It should be relevant for **MacOS** and **Linux**. 

## Prerequsites

- nodejs v18.6.0
- npm v8.13.2
- cordova 11 (`npm install -g cordova`)

## Steps

1. Clone repo to your pc.
```bash
git clone https://github.com/DmitryGolovin-azur/cordova-phaser-solitaire.git
cd cordova-phaser-solitaire
```

2. Install the dependencies.
```bash
npm i
```

3. Add platform and build it.
```bash
cordova platform add browser # android/ios
```

4. Run
```bash
cordova build browser
```

5. Run
```bash
cordova run browser # android/ios

# cordova run browser -- -livereload # run with livereload
```

## Enjoy!

*Known issue: There is a problem with audio on IOS. It may be fixed with Cordova's plugin `cordova-plugin-media`.*
