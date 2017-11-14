import React, { Component } from 'react';
import './App.css';

const c = {height: 100, width: 100, max_rooms: 20, size_range: [4,20]};

const createFloor = () => {
//HELPER FUNCTIONS FOR CREATING THE MAP
  
  //Check if room placement can fit one cell away from the previous room, without overlapping an existing room.
  const isValidRoomPlacement = (grid, {x,y,width=1,height=1}) => {
    if (y<1||y+height>grid.length-1) {
      return false;
    }
    if (x<1||x+width>grid[0].length-1) {
      return false;
    }
    for (let i=y-1;i<y+height+1;i++) {
      for (let j=x-1;j<x+width+1;j++) {
        if (grid[i][j].type==='floor') {
          return false;
        }
      }
    }
    return true;
  }
  //Place the room on the blank grid.
  const placeRoom = (grid, {x,y,width=1,height=1,id}, type='floor') => {
    for (let i=y; i<y+height;i++) {
      for (let j=x; j<x+width;j++) {
        grid[i][j]={type, id};
      }
    }
    return grid;
  };
//END HELPER FUNCTIONS


  //Generate initial blank grid.
  let grid = [];
  for (let i=0; i<c.height; i++) {
    grid.push([]);
    for (let j=0; j<c.width; j++) {
      grid[i].push({type:"0"});
    }
  }

  //Generate the first room.
  const [min,max] = c.size_range;
  const firstRoom = {
    x: Math.floor(Math.random() * ((c.width - max -15)-1) + 1),
    y: Math.floor(Math.random() * ((c.height - max -15)-1) + 1),
    height: Math.floor(Math.random() * (max - min) + min),
    width: Math.floor(Math.random() * (max-min) + min),
    id: 'O',
  };

  //Place the first room on the grid.
  grid = placeRoom(grid, firstRoom);
  
  //Create rooms from the initial seed.
  const createRoomsFromSeed = (grid,{x,y,width,height},range=c.size_range) => {
    const [min,max] = range;
    const roomValues = [];
    
    const north = { height: Math.floor(Math.random()*(max - min)+min), width: Math.floor(Math.random()*(max-min)+min) };
    north.x = Math.floor(Math.random()*((x+width-1) - x) + x);
    north.y = y - north.height - 1;
    north.doorx = Math.floor(Math.random()*((Math.min(north.x+north.width,x+width))-north.x)+north.x);
    north.doory = y-1;
    north.id="N";
    roomValues.push(north);

    const east = { height: Math.floor(Math.random()*(max-min)+min), width: Math.floor(Math.random()*(max-min)+min) };
    east.x = x + width + 1;
    east.y = Math.floor(Math.random()*((height+y-1)-y)+y);
    east.doorx = east.x - 1;
    east.doory = Math.floor(Math.random()*((Math.min(east.y+east.height,y+height)-1)-east.y)+east.y);
    east.id="E";
    roomValues.push(east);

    const south = { height: Math.floor(Math.random()*(max-min)+min), width: Math.floor(Math.random()*(max-min)+min)};
    south.x = Math.floor(Math.random((width+x-1)-x)+x);
    south.y = y+height+1;
    south.doorx = Math.floor(Math.random()*((Math.min(south.x+south.width,x+width)-1)-south.x)+south.x);
    south.doory = y+height;
    south.id="S";
    roomValues.push(south);

    const west = { height: Math.floor(Math.random()*(max-min)+min), width: Math.floor(Math.random()*(max-min)+min) };
    west.x = x-west.width-1;
    west.y = Math.floor(Math.random()*((height+y-1) - y)+y);
    west.doorx = x - 1;
    west.doory = Math.floor(Math.random()*((Math.min(west.y+west.height,y+height)-1)-west.y)+west.y);
    west.id="W";
    roomValues.push(west);

    const placedRooms = [];
    roomValues.forEach(room => {
      if (isValidRoomPlacement(grid,room)) {
        grid = placeRoom(grid,room);
        grid = placeRoom(grid,{x: room.doorx, y: room.doory, width: undefined,height: undefined, id:"D"}, 'door');
        placedRooms.push(room);
      }
    });
    return {grid, placedRooms};
  }

  //Grow the floor by adding rooms recursively to the firstRoom.
  const growMap = (grid, seedRooms, counter=1, maxRooms = c.max_rooms) => {
    if (counter+seedRooms.length > maxRooms||!seedRooms.length) {
      return grid;
    }
    grid = createRoomsFromSeed(grid, seedRooms.pop());
    seedRooms.push(...grid.placedRooms);
    counter += grid.placedRooms.length;
    return growMap(grid.grid, seedRooms, counter);
  };

  return growMap(grid, [firstRoom]);
}

function populateFloor() {
  const grid = createFloor();
  const player = [{type: "player", id: "p"}];
  const monster = [];
  for (let i=0;i<10;i++) {
    monster.push({type: "monster", id: "m"});
  }
  const weapon = [];
  for (let i=0; i<(Math.floor(Math.random()*(2)+1)); i++) {
    weapon.push({type: "weapon", id:"w"});
  }
  const food = [];
  for (let i=0; i<(Math.round(Math.random()*(10-4)+5));i++) {
    food.push({type: "food", id:"f"});
  }
  const stairs = [{type: "stairs", id:"s"}];

  let stairsOrBoss=[];
  let currentPosition = [];
  let monsters = {};
  let weapons = [{name:"Stick", damage:10},{name:"Pipe", damage:12},{name:"Club", damage:14},{name:"Dagger", damage:18},{name:"Sword", damage:24},{name:"Two Swords", damage:30},{name:"Rubber Chicken", damage:40}];
  [stairs,food,weapon,monster,player].forEach(piece => {
    while (piece.length) {
      const x = Math.floor(Math.random()*c.width);
      const y = Math.floor(Math.random()*c.height);
      if (grid[y][x].type==="floor") {
        if (piece[0].type === "player") {
          currentPosition = {x: x, y: y};
        } else if (piece[0].type==="monster") {
          monsters[x+","+y]= ({attack: 5, health: 30});
        } else if (piece[0].type==="stairs") {
          stairsOrBoss = {x: x, y: y};
        }
        grid[y][x]=piece.pop();
      }
    }
  });
  return {floor: grid, currentPosition: currentPosition, monsters: monsters, weapons: weapons, stairs: stairsOrBoss};
}

function HudElement(props) {
  return (
  <div className={props.className} id={props.id}>{props.name}: {props.displays}</div>
  )
}

class Hud extends Component {
  render() {
    //console.log("Hud rendering");
    return (
      <div id="hud">
        <HudElement className={"hudElement"} id={"health"} name={"HP"} displays={this.props.hud.health}/>
        <HudElement className={"hudElement"} id={"weapon"} name={"Weapon"} displays={this.props.hud.weapon}/>
        <HudElement className={"hudElement"} id={"attack"} name={"Attack"} displays={this.props.hud.attack}/>
        <HudElement className={"hudElement"} id={"level"} name={"Level"} displays={this.props.hud.level}/>
      </div>
    );
  }
}

function Map(props) {
  const floor = props.floor;
  const visible = props.visible;
  let k=1;
  let m=1;
  //console.log("Map rendering");
  return (
    <div id="visible">
      {floor.map((element,index) => {
        if (index>visible.y2&&index<=visible.y1) {return(
          <div className={"row row"+k++} key={Date.now() + index}>
          {element.map((cell, i) => {
          if (i<=visible.x2&&i>=visible.x1) {return (
            <div className={(cell.type==="0")? 'cell empty' : 'cell ' + cell.type + " " + cell.id} key={i+1} id={m++}></div>);} else {return null}
          })
          }
          </div>
        )} else {return null}
      })}
    </div>
  );
}

class Screen extends Component {
  render() {
    //console.log("Screen rendering");
    if (this.props.gameover===false) {
      return (
      <div id={"screen"}>
        <Map floor={this.props.floor} currentPosition={this.props.currentPosition} visible={this.props.visible}/>
      </div>
      )
    } else {
      return (
      <div id={"endgame"}>
        <p>Gameover!</p>
        <button id="playAgain" className={"btn"} onClick={this.props.handleClick}>Play again?</button>
      </div>
      )
    }
  }
}

class Game extends Component {
  constructor(props) {
    super(props);
    const floor = this.props.props;
    this.state = {
      currentPosition: floor.currentPosition,
      visible: {x1: undefined, y1: undefined, x2: undefined, y2: undefined},
      weaponID: 0,
      hud: {
        health: 100,
        weapon: undefined,
        attack: undefined,
        level: 1,
        xp: 0,
        nextLevel: 100,
      },
      map: floor.floor,
      floor: 1,
      monsters: floor.monsters,
      stairsAreBoss: false,
      stairs: floor.stairs,
      gameover: false,
    }
    this.playAgain = this.playAgain.bind(this);
  }

  componentDidMount() {
    this.setVisibility();
    this.setWeapons();
    window.addEventListener('keydown', this.keydown);
  }

  keydown = (e) => {
    const currPos = this.state.currentPosition;
    let target = {};
    //console.log(currPos);
    switch (e.key) {
      case "w":
      case "ArrowUp":
        e.preventDefault();
        target = {x: currPos.x, y: currPos.y-1}
        break;
      case "s":
      case "ArrowDown":
        e.preventDefault();
        target = {x: currPos.x, y: currPos.y+1}
        break;
      case "d":
      case "ArrowRight":
        target = {x: currPos.x+1, y: currPos.y}
        break;
      case "a":
      case "ArrowLeft":
        target = {x: currPos.x-1, y: currPos.y}
        break;
      default:
        console.log("Key pressed");
        return;
    }
    let targetType = this.state.map[target.y][target.x].type;
    console.log(targetType);
    if (targetType==="floor"||targetType==="door") {
      this.movePlayer(currPos, target);
    } else if (targetType==="monster"||targetType==="boss") {
      this.battleMonster(target, targetType);
    } else if (targetType==="weapon"||targetType==="food") {
      this.pickUpItem(target, targetType);
    } else if(targetType==="stairs") {
      this.nextFloor();
    }
  }

  movePlayer(currPos = this.state.currentPosition, target) {
    let newMap = this.state.map;
    newMap[currPos.y][currPos.x] = {type: "floor", id:"floor"};
    newMap[target.y][target.x] = {type: "player", id:"p"};
    this.setState({
      currentPosition: target,
      map: newMap,
    })
    this.setVisibility();
  }

  battleMonster(target, targetType) {
    const state = this.state;
    const monster = (targetType==="monster") ? state.monsters[target.x+","+target.y] : state.stairs;
    const playerDamage = Math.round(Math.random()*state.hud.attack);
    const monsterDamage = Math.round(Math.random()*(monster.attack+(this.state.floor/10)));
    const updateHud = state.hud;
    updateHud.health -= monsterDamage;
    const updateStairs = state.stairs;
    const updateMonsters = state.monsters;
    if (targetType==="monster") {
      updateMonsters[target.x+","+target.y].health -= playerDamage;
    } else {
      updateStairs.health -= playerDamage;
    }
    if (monster.health<=0) {
      this.movePlayer(undefined, target);
      const xp = Math.round(Math.random()*((10+this.state.floor/10)-5+1)+5);
      updateHud.xp += xp;
      if (updateHud.nextLevel<=updateHud.xp) {
        updateHud.level++;
        updateHud.nextLevel = ((updateHud.level/10)+1)*100;
      }
    }
    if (this.state.hud.health<=0) {
      this.setState({
        gameover: true,
      })
    } else if (this.state.stairs.health<=0) {
      this.setState({
        gameover: true,
      })
    } else {
      this.setState({
        hud: updateHud,
        monsters: updateMonsters,
        stairs: updateStairs
      })
    }
  }

  pickUpItem(target, targetType) {
    const hud = this.state.hud;
    let nextWeapon = this.state.weaponID;
    if (targetType==="food") {
      let addHealth = Math.round(Math.random()*((10+this.state.hud.level)-5)+5);
      hud.health += addHealth;
    } else {
      if (nextWeapon<7) {
        nextWeapon++;
        hud.weapon = this.props.props.weapons[nextWeapon].name;
        hud.attack = this.props.props.weapons[nextWeapon].damage;
      }
    }
    this.setState({
        hud: hud,
        weaponID: nextWeapon,
    })
    this.movePlayer(undefined,target);
  }

  nextFloor() {
    let dungeon = this.state.floor;
    if (dungeon<5) {
      dungeon++;
      const x = populateFloor();
      this.setState({
        currentPosition: x.currentPosition,
        map: x.floor,
        monsters: x.monsters,
        floor: dungeon,
        stairsAreBoss: false,
        stairs: x.stairs
      })
      if (dungeon===5) {
        this.stairsAreBoss();
      }
    }
  }

  stairsAreBoss() {
    const state = this.state;
    const makeBoss = state.map[this.state.stairs.y][this.state.stairs.x] = {type: "boss", id: "b", attack: 1.5*this.state.hud.attack, health: 1.5*this.state.hud.health};
    this.setState({
      stairsAreBoss: true,
      stairs: makeBoss,
    })
  }

  setVisibility() {
    const currPos = this.state.currentPosition;
    this.setState({visible: {x1: currPos.x-10,y1:currPos.y+10,x2:currPos.x+10,y2:currPos.y-10}});
  }

  setWeapons() {
    const currHud = this.state.hud;
    currHud.weapon = this.props.props.weapons[this.state.weaponID].name;
    currHud.attack = this.props.props.weapons[this.state.weaponID].damage;
    this.setState({
      hud: currHud,
    })
  }

  setHud() {
    let hud = this.state.hud;
    hud.health = 100;
    hud.level = 1;
    hud.xp = 0;
    hud.nextLevel = 100;
    this.setState({
      hud: hud,
    })
  }

  playAgain() {
    let x = populateFloor();
    this.setState({
      currentPosition: x.currentPosition,
      visible: {x1: undefined, y1: undefined, x2: undefined, y2: undefined},
      weaponID: 0,
      hud: {
        health: undefined,
        weapon: undefined,
        attack: undefined,
        level: undefined,
        xp: undefined,
        nextLevel: undefined,
      },
      map: x.floor,
      floor: 1,
      monsters: x.monsters,
      stairsAreBoss: false,
      stairs: x.stairs,
      gameover: false,
    });
    this.setHud();
    this.setVisibility();
    this.setWeapons();
  }

  render() {
    //console.log("Game rendering");
    return (
      <div id="game">
        <div id="title">Dungeon Crawler</div>
        <Hud hud={this.state.hud}/>
        <Screen currentPosition={this.state.currentPosition} floor={this.state.map} visible={this.state.visible} gameover={this.state.gameover} handleClick={this.playAgain}/>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
      <nav>
        <a href="https://www.freecodecamp.org/challenges/build-the-game-of-life"><img alt="freeCodeCamp's logo" src="https://s3.amazonaws.com/freecodecamp/freecodecamp_logo.svg"></img></a>
      </nav>
      <Game props={populateFloor()}/>
      <footer>
          <p id="signature">Developed by <a href="https:www.mackmmiller.com/">Mackenzie Miller</a></p>
          <p id="credit">Favicon made by <a href="https://www.flaticon.com/authors/twitter" title="Twitter">Twitter</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC 3.0 BY</a></p>
      </footer>
      </div>
    );
  }
}

export default App;