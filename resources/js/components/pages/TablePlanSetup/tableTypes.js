import {fabric} from "fabric";
import wallImage from "../../../../assets/wall.svg"
import doorsImage from "../../../../assets/doors.svg"
import windowImage from "../../../../assets/window.svg"
import binImage from "../../../../assets/bin.svg"
import flowerImage from "../../../../assets/flower.svg"
import chairImage from "../../../../assets/chair.svg"
import sofaSmallImage from "../../../../assets/sofa_small.svg"
import sofaBigImage from "../../../../assets/sofa_big.svg"
import wardrobeImage from "../../../../assets/wardrobe.svg"
import stairsImage from "../../../../assets/stairs.svg"

const tableWidth = 30
const tableRadius = 18
const seatWidth = 4
const seatLength = 15
const tableStroke = '#c0c0c0'

const rectConfig = (tables,seats) => {
  let conf = []
  let size = {width:seatWidth,height:seatLength}
  let tC = tables%2 > 0 ? 1 : 2
  let pC = -1
  let c = 1
  let gC = -1
  if(seats-tables*2 > 0){
    conf.push({...size, dx: -(tableWidth/2*tables+seatWidth/2+3), dy: 0})
  }
  if(seats-tables*2 > 1){
    conf.push({...size, dx: (tableWidth/2*tables+seatWidth/2+3), dy: 0})
  }
  for(var i=0;i<(tables*2>seats?seats:tables*2);i++){
    conf.push({
      width: seatLength,
      height: seatWidth,
      dx: (tableWidth/2)*(tC-1)*gC,
      dy: (tableWidth/2+seatWidth/2+3)*pC,
    })
    if(c%2 > 0) gC*=-1
    if((tC === 1 && c === 2) || c === 4){
      tC+=2
      c=0
    }
    c++
    pC*=-1
  }
  return conf
}

const circConfig = (seats,c) => {
  let conf = []
  for(let i=0;i<seats;i++){
    conf.push({
      width: seatLength,
      height: seatWidth,
      dx: (tableRadius*c+seatWidth/2+3)*Math.cos((360/seats*i+90)*Math.PI/180),
      dy: -(tableRadius*c+seatWidth/2+3)*Math.sin((360/seats*i+90)*Math.PI/180),
      angle: 360/seats*i*-1
    })
  }
  return conf
}

const circsConfig = (n) => {
  let conf = {}
  let c
  for(let i=1;i<=n;i++){
    c = 1+0.001*i*i*i
    conf[`circ_${i}`] = {
        radius: tableRadius*c,
        seats: circConfig(i,c)
    }
  }
  return conf
}

// noinspection JSSuspiciousNameCombination
export const tableTypes = {
  'rect_1_1': {
    width: tableWidth,
    height: tableWidth,
    seats: [
      {
        width: seatWidth,
        height: seatLength,
        dx: -(tableWidth/2+seatWidth/2+3),
        dy: 0,
      }
    ]
  },
  'rect_1_2': {
    width: tableWidth,
    height: tableWidth,
    seats: rectConfig(1,2)
  },
  'rect_1_2_1': {
    width: tableWidth,
    height: tableWidth,
    seats: [
      {
        width: seatLength,
        height: seatWidth,
        dx: 0,
        dy: -(tableWidth/2+seatWidth/2+3),
      },
      {
        width: seatWidth,
        height: seatLength,
        dx: -(tableWidth/2+seatWidth/2+3),
        dy: 0,
      }
    ]
  },
  'rect_1_3': {
    width: tableWidth,
    height: tableWidth,
    seats: rectConfig(1,3)
  },
  'rect_1_4': {
    width: tableWidth,
    height: tableWidth,
    seats: rectConfig(1,4)
  },
  'rect_2_4': {
    width: tableWidth * 2,
    height: tableWidth,
    seats: rectConfig(2,4)
  },
  'rect_2_5': {
    width: tableWidth * 2,
    height: tableWidth,
    seats: rectConfig(2,5)
  },
  'rect_2_6': {
    width: tableWidth * 2,
    height: tableWidth,
    seats: rectConfig(2,6)
  },
  'rect_3_6': {
    width: tableWidth * 3,
    height: tableWidth,
    seats: rectConfig(3,6)
  },
  'rect_3_7': {
    width: tableWidth * 3,
    height: tableWidth,
    seats: rectConfig(3,7)
  },
  'rect_3_8': {
    width: tableWidth * 3,
    height: tableWidth,
    seats: rectConfig(3,8)
  },
  'rect_4_8': {
    width: tableWidth * 4,
    height: tableWidth,
    seats: rectConfig(4,8)
  },
  'rect_4_9': {
    width: tableWidth * 4,
    height: tableWidth,
    seats: rectConfig(4,9)
  },
  'rect_4_10': {
    width: tableWidth * 4,
    height: tableWidth,
    seats: rectConfig(4,10)
  },
  'rect_5_10': {
    width: tableWidth * 5,
    height: tableWidth,
    seats: rectConfig(5,10)
  },
  'rect_5_11': {
    width: tableWidth * 5,
    height: tableWidth,
    seats: rectConfig(5,11)
  },
  'rect_5_12': {
    width: tableWidth * 5,
    height: tableWidth,
    seats: rectConfig(5,12)
  },
  'rect_6_12': {
    width: tableWidth * 6,
    height: tableWidth,
    seats: rectConfig(6,12)
  },
  'rect_6_13': {
    width: tableWidth * 6,
    height: tableWidth,
    seats: rectConfig(6,13)
  },
  'rect_6_14': {
    width: tableWidth * 6,
    height: tableWidth,
    seats: rectConfig(6,14)
  },
  'spec_rect_9_20': {
    width: tableWidth * 9,
    height: tableWidth,
    seats: rectConfig(9,20)
  },
  'spec_rect_10_20': {
    width: tableWidth * 10,
    height: tableWidth,
    seats: rectConfig(10,20)
  },
  ...circsConfig(10),
  'spec_circ_12': {
    radius: tableRadius*(1+0.001*12*12*6),
    seats: circConfig(12,1+0.001*12*12*6)
  },
  'spec_circ_20': {
    radius: tableRadius*(1+0.001*20*20*6),
    seats: circConfig(20,1+0.001*20*20*6)
  },
  'land_wall': {svg: wallImage},
  'land_door': {svg: doorsImage},
  'land_window': {svg: windowImage},
  'land_bin': {svg: binImage},
  'land_flower': {svg: flowerImage},
  'land_chair': {svg: chairImage},
  'land_sofa_small': {svg: sofaSmallImage},
  'land_sofa_big': {svg: sofaBigImage},
  'land_wardrobe': {svg: wardrobeImage},
  'land_stairs': {svg: stairsImage},
}

export const rectTable = (key,data) => {
  const type = tableTypes[data['type']]
  let seats = []
  type.seats.forEach(seat => {
    const s = new fabric.Rect({
      left: seat.dx,
      top: seat.dy,
      width: seat.width,
      height: seat.height,
      fill: tableStroke,
      strokeWidth: 0,
      originX: 'center',
      originY: 'center',
      selectable: false
    })
    seats.push(s)
  })
  const table = new fabric.Rect({
    width: type.width,
    height: type.height,
    fill: (data.hasOwnProperty('markColor') && data.markColor) ? data['markColor'] : data['color'],
    stroke: tableStroke,
    strokeWidth: 3,
    originX: 'center',
    originY: 'center',
    centeredRotation: true,
    selectable: false,
    rx: 4,
    ry: 4
  })
  const tableG = new fabric.Group([table, ...seats], {
    centeredRotation: true,
    snapAngle: 45,
    originX: 'center',
    originY: 'center',
    angle: data['angle'],
  })

  const text = tableText(data)

  const og = new fabric.Group([tableG, text], {
    left: data['left'],
    top: data['top'],
    centeredRotation: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    snapAngle: 45,
    selectable: true,
    hasControls: false,
    originX: 'center',
    originY: 'center',
    id: key,
    data: data
  })

  return og
}

export const circTable = (key,data) => {
  const type = tableTypes[data['type']]
  let seats = []
  type.seats.forEach(seat => {
    const s = new fabric.Rect({
      left: seat.dx,
      top: seat.dy,
      width: seat.width,
      height: seat.height,
      angle: seat.angle,
      fill: tableStroke,
      strokeWidth: 0,
      originX: 'center',
      originY: 'center',
      selectable: false
    })
    seats.push(s)
  })
  const table = new fabric.Circle({
    radius: type.radius,
    fill: (data.hasOwnProperty('markColor') && data.markColor) ? data['markColor'] : data['color'],
    stroke: tableStroke,
    strokeWidth: 3,
    originX: 'center',
    originY: 'center',
    centeredRotation: true,
    selectable: false,
  })
  const tableG = new fabric.Group([table, ...seats], {
    centeredRotation: true,
    snapAngle: 45,
    originX: 'center',
    originY: 'center',
    angle: data['angle'],
  })

  const text = tableText(data)

  const og = new fabric.Group([tableG, text], {
    left: data['left'],
    top: data['top'],
    centeredRotation: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    snapAngle: 45,
    selectable: true,
    hasControls: false,
    originX: 'center',
    originY: 'center',
    id: key,
    data: data
  })

  return og
}

export const landscape = async (key, data) => {
  const type = tableTypes[data['type']]
  const land = await new Promise((resolve, reject) => {
    fabric.loadSVGFromURL(type.svg, function (objects, options) {
      let obj = fabric.util.groupSVGElements(objects, options)
      resolve(obj)
    })
  }).then(res => {
    return res
  })
  land.left = data['left']
  land.top = data['top']
  land.centeredRotation = true
  land.lockRotation = true
  land.lockScalingX = true
  land.lockScalingY = true
  land.snapAngle = 45
  land.selectable = true
  land.hasControls = false
  land.originX = 'center'
  land.originY = 'center'
  land.angle = data['angle']
  land.id = key
  land.data = data

  return land
}

export const tableText = (data) => {
  let objectArray = []
  let textColor = contrastColor((data.hasOwnProperty('markColor') && data.markColor) ? data['markColor'] : data['color'])
  if(data.hasOwnProperty('number')){
    const textNumber = new fabric.IText('t: '+data['number'].toString(), {
      // fontFamily: 'Calibri',
      top: -8,
      fontSize: 10,
      fill: textColor,
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    })
    objectArray.push(textNumber)
  }

  if(data.hasOwnProperty('seats')) {
    const textSeats = new fabric.IText('s: ' + data['seats'].toString(), {
      fontSize: 10,
      fill: textColor,
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    })
    objectArray.push(textSeats)
  }

  if(data.hasOwnProperty('order') && data['order']) {
    const textGroup = new fabric.IText(data['order'], {
      top: 8,
      fontSize: 10,
      fill: textColor,
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    })
    objectArray.push(textGroup)
  }else if(data.hasOwnProperty('time') && data['time'].length > 0 &&
    data['time'][0].hasOwnProperty('group') && data['time'][0]['group']) {
    const textGroup = new fabric.IText('g: ' + data['time'][0]['group'].toString(), {
      top: 8,
      fontSize: 10,
      fill: textColor,
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    })
    objectArray.push(textGroup)
  }

  const g = new fabric.Group(objectArray, {
    centeredRotation: true,
    snapAngle: 45,
    originX: 'center',
    originY: 'center',
  })

  return g
}

const contrastColor = (hex) => {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  return (r * 0.299 + g * 0.587 + b * 0.114) > 186
    ? '#000000'
    : '#FFFFFF';
}
