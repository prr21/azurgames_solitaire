// for webpack
import './index.html'
import './index.css'
import './assets/board/board.png'
import {start, started} from './js/app';

document.addEventListener('deviceready', onDeviceReady);

async function onDeviceReady() {
    // Cordova is now initialized. Have fun!
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    
    await start();
    
    document.getElementsByClassName('app')[0].remove();
}
