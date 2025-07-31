import AnimatedScene from "./scenes/Boot";
//mport { GameOver } from './scenes/GameOver';
import { GameScene } from "./scenes/Game";
//import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from "phaser";
//import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 900,
  height: 640,
  parent: "board",
  backgroundColor: "transparent",
  scene: [
    //AnimatedScene,
    //MainMenu,
    GameScene,
    //GameOver
  ],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
