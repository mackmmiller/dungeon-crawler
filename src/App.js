import React, { Component } from 'react';
import './App.css';

const c = {height: 100, width: 100, max_rooms: 20, size_range: [6,15]};

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
      grid[i].push({type:0});
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

/*function initializePlayer() {

}*/

function HudElement(props) {
  return (
  <div className={props.className} id={props.id}>{props.name}: {props.displays}</div>
  )
}

class Hud extends Component {
  render() {
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

class Player extends Component {
  render() {
    return(
      <div className="player"></div>
    )
  }
}

function Map(props) {
  let floor = createFloor();
  let k=1;
  let m=1;
  return (
    <div id="screen">
      {floor.map((element,index) => {
        return(
          <div className={"row row"+k++} key={Date.now() + index}>
          {
            element.map((cell, i) => {
              return (
                <div className={(cell.type === 'floor' || cell.type === 'door') ? 'cell ' + cell.type + " " + cell.id : 'cell'} key={i+1} id={m++}>{cell.id}</div>
              );
            })
          }
          </div>
        )
      })}
    </div>
  );
}

class Screen extends Component {
  render() {
    return (
    <div>
      <Player currentPosition={this.props.currentPosition}/>
      <Map />
    </div>
    )
  }
}

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPosition: {
        x: undefined,
        y: undefined,
      },
      hud: {
        health: undefined,
        weapon: undefined,
        attack: undefined,
        level: undefined,
        nextLevel: undefined,
      },
    }
  }

  componentDidMount() {
    this.setState({
      currentPosition: {
        x: 0,
        y: 0,
      },
      hud: {
        health: 100,
        weapon: "Stick",
        attack: 10,
        level: 1,
        nextLevel: 100 + "XP",
      }
    })
  }

  render() {
    return (
      <div id="game">
        <div id="title">Dungeon Crawler</div>
        <Hud hud={this.state.hud}/>
        <Screen currentPosition={this.state.currentPosition}/>
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