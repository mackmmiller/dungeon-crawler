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
  for (let i=0; i<4; i++) {
    weapon.push({type: "weapon", id:"w"});
  }
  const food = [];
  for (let i=0; i<10;i++) {
    food.push({type: "food", id:"f"});
  }
  const stairs = [{type: "stairs", id:"s"}];

  let currentPosition = [];
  [stairs,food,weapon,monster,player].forEach(piece => {
    while (piece.length) {
      const x = Math.floor(Math.random()*c.width);
      const y = Math.floor(Math.random()*c.height);
      if (grid[y][x].type==="floor") {
        if (piece[0].type === "player") {
          currentPosition = {x: x, y: y};
        }
        grid[y][x]=piece.pop();
      }
    }
  });
  return {floor: grid, currentPosition: currentPosition};
}

function HudElement(props) {
  return (
  <div className={props.className} id={props.id}>{props.name}: {props.displays}</div>
  )
}

class Hud extends Component {
  render() {
    console.log("Hud rendering");
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
  console.log("Map rendering");
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
    console.log("Screen rendering");
    return (
    <div id={"screen"}>
      <Map floor={this.props.floor} currentPosition={this.props.currentPosition} visible={this.props.visible}/>
    </div>
    )
  }
}

class Game extends Component {
  constructor(props) {
    super(props);
    const floor = this.generateMap();
    const weapons = [{name: "Stick",damage:10},{name: "Pipe",damage:15}];
    this.state = {
      currentPosition: floor.currentPosition,
      visible: {x1: undefined, y1: undefined, x2: undefined, y2: undefined},
      hud: {
        health: 100,
        weapon: weapons[0].name,
        attack: weapons[0].damage,
        level: 1,
        nextLevel: 100 + "XP",
      },
      map: floor.floor,
    }
  }

  componentDidMount() {
    this.setVisibility();
    window.addEventListener('keydown', this.keydown);
  }

  keydown = (e) => {
    const currPos = this.state.currentPosition;
    let target = {};
    console.log(currPos);
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
    if (targetType==="floor"||targetType==="door") {
      this.movePlayer(currPos, target);
    } else if (targetType==="monster") {
      this.battleMonster(target);
    } else if (targetType==="weapon"||targetType==="food") {
      this.pickUpItem(target, targetType);
    } else {
      return;
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

  battleMonster(target) {
    console.log("battling", target);
    let updateHud = this.state.hud;
    updateHud.health -= 5;
    this.setState({
      hud: updateHud
    })
  }

  pickUpItem(target, targetType) {
    const hud = this.state.hud;
    if (targetType==="food") {
      let addHealth = Math.round(Math.random()*(10-5)+5);
      hud.health += addHealth;
    } else {
      console.log("New weapon");
      //hud.weapon = weapons[1].name;
      //hud.attack = weapons[1].damage;
    }
    this.setState({
        hud: hud
    })
    console.log(target.y,target.x);
    this.movePlayer(undefined,target);
  }

  generateMap() {
    return populateFloor()
  }

  setVisibility() {
    const currPos = this.state.currentPosition;
    this.setState({visible: {x1: currPos.x-10,y1:currPos.y+10,x2:currPos.x+10,y2:currPos.y-10}});
  }

  render() {
    console.log("Game rendering");
    return (
      <div id="game">
        <div id="title">Dungeon Crawler</div>
        <Hud hud={this.state.hud}/>
        <Screen currentPosition={this.state.currentPosition} floor={this.state.map} visible={this.state.visible}/>
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
      <Game />
      <footer>
          <p id="signature">Developed by <a href="https:www.mackmmiller.com/">Mackenzie Miller</a></p>
          <p id="credit">Favicon made by <a href="https://www.flaticon.com/authors/twitter" title="Twitter">Twitter</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC 3.0 BY</a></p>
      </footer>
      </div>
    );
  }
}

export default App;